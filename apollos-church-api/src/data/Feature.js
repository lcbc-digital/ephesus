/* eslint-disable class-methods-use-this */
import { Feature } from '@apollosproject/data-connector-rock';
import { createGlobalId, parseGlobalId } from '@apollosproject/server-core';
import { get, startCase } from 'lodash';
import ApollosConfig from '@apollosproject/config';
import gql from 'graphql-tag';
import fetch from 'node-fetch';
import moment from 'moment';

const { resolver: baseResolver, schema: baseSchema } = Feature;

const resolver = {
  ...baseResolver,
  Query: {
    ...baseResolver.Query,
    userFeedFeaturesWithCampus: (root, { campusId }, context, ...args) => {
      // eslint-disable-next-line
      context.campusId = campusId;
      return baseResolver.Query.userFeedFeatures(root, null, context, ...args);
    },
  },
  ActionListAction: {
    ...baseResolver.ActionListAction,
    subtitle: ({ subtitle, summary }) => subtitle || summary,
  },
  CardListItem: {
    ...baseResolver.CardListItem,
    labelText: (item) =>
      item?.relatedNode?.craftType === 'media_mediaWallpaper_Entry'
        ? 'Wallpaper'
        : startCase(item.relatedNode.labelText) || item.labelText,
    // action: (item) =>
    //   item?.relatedNode?.craftType === 'media_mediaWallpaper_Entry'
    //     ? 'SHARE_IMAGE'
    //     : item.action,
    title: (item) =>
      item?.relatedNode?.craftType === 'media_mediaWallpaper_Entry'
        ? ''
        : item.title,
  },
};

const schema = gql`
  ${baseSchema}

  extend type Query {
    userFeedFeaturesWithCampus(campusId: ID): [Feature] @cacheControl(maxAge: 0)
  }

  extend enum ACTION_FEATURE_ACTION {
    SHARE_IMAGE
  }

  type ActionBarAction {
    id: ID
    url: String @cacheControl(maxAge: 0)
    icon: String
    label: String
  }

  type ActionBarFeature implements Feature & Node {
    id: ID!
    order: Int

    title: String
    actions: [ActionBarAction]
  }

  type ShareableImageFeature implements Feature & Node {
    id: ID!
    order: Int

    image: ImageMedia
    title: String
  }
`;

class dataSource extends Feature.dataSource {
  ACTION_ALGORITHIMS = {
    // We need to make sure `this` refers to the class, not the `ACTION_ALGORITHIMS` object.
    ...this.ACTION_ALGORITHIMS,
    MOST_RECENT_SERMON: this.mostRecentSermonAlgorithm.bind(this),
    SECTION: this.sectionFeature.bind(this),
    CAMPUS: this.campusFeature.bind(this),
    VERSE_OF_THE_DAY: this.verseOfTheDayAlgorithm.bind(this),
    START_SOMETHING_NEW: this.startSomethingNewAlgorithm.bind(this),
  };

  getFromId(args, id, { info }) {
    const type = id.split(':')[0];
    const funcArgs = JSON.parse(args);
    const method = this[`create${type}`].bind(this);
    this.info = info;
    if (funcArgs.campusId) {
      this.context.campusId = funcArgs.campusId;
    }
    return method(funcArgs);
  }

  createFeatureId({ args, type }) {
    return createGlobalId(
      JSON.stringify({ campusId: this.context.campusId, ...args }),
      type
    );
  }

  createSharableImageFeature({ url }) {
    return {
      id: createGlobalId({ url }, 'ShareableImageFeature'),
      image: { sources: [{ uri: url }] },
      __typename: 'ShareableImageFeature',
    };
  }

  async verseOfTheDayAlgorithm() {
    const verseOfTheDay = await fetch(
      `https://developers.youversionapi.com/1.0/verse_of_the_day/${moment().dayOfYear()}?version_id=1`,
      {
        headers: {
          'X-YouVersion-Developer-Token': 'UKe3tMsbC7Rpt55oXjwgI4In__Y',
          'Accept-Language': 'en',
          Accept: 'application/json',
        },
      }
    ).then((result) => result.json());
    const imageUrl = get(verseOfTheDay, 'image.url', '')
      .replace('{width}', 800)
      .replace('{height}', 800);

    return [
      {
        id: createGlobalId('verse-of-the-day', 'CardListItem'),
        title: '',
        subtitle: '',
        labelText: 'Verse of the Day',
        relatedNode: {
          url: get(verseOfTheDay, 'verse.url'),
          id: createGlobalId(JSON.stringify({ verseOfTheDay }), 'Url'),
          __type: 'Url',
        },
        image: { sources: [{ uri: imageUrl }] },
        action: 'OPEN_URL',
        hasAction: false,
      },
    ];
  }

  async getHomeFeedFeatures() {
    return Promise.all(
      get(ApollosConfig, 'HOME_FEATURES', []).map((featureConfig) => {
        switch (featureConfig.type) {
          case 'ActionBar':
            return this.createActionBarFeature(featureConfig);
          case 'VerticalCardList':
            return this.createVerticalCardListFeature(featureConfig);
          case 'HorizontalCardList':
            return this.createHorizontalCardListFeature(featureConfig);
          case 'HeroListFeature':
            console.warn(
              'Deprecated: Please use the name "HeroList" instead. You used "HeroListFeature"'
            );
            return this.createHeroListFeature(featureConfig);
          case 'HeroList':
            return this.createHeroListFeature(featureConfig);
          case 'PrayerList':
            return this.createPrayerListFeature(featureConfig);
          case 'ActionList':
          default:
            // Action list was the default in 1.3.0 and prior.
            return this.createActionListFeature(featureConfig);
        }
      })
    );
  }

  async createActionBarFeature({ title }) {
    // Generate a list of horizontal cards.
    // const cards = () => this.runAlgorithms({ algorithms });
    const actions = await this.context.dataSources.ContentItem.getAppBarActions();
    return {
      // The Feature ID is based on all of the action ids, added together.
      // This is naive, and could be improved.
      id: this.createFeatureId({
        type: 'ActionBarFeature',
        args: {
          title,
        },
      }),
      actions,
      title,
      // Typename is required so GQL knows specifically what Feature is being created
      __typename: 'ActionBarFeature',
    };
  }

  async sectionFeature({ section }) {
    const { ContentItem } = this.context.dataSources;

    const items = await ContentItem.getBySection(section);

    return items.map((item, i) => ({
      id: createGlobalId(`${item.id}${i}`, 'ActionListAction'),
      title: item.title,
      subtitle: get(item, 'parent.title'),
      relatedNode: { ...item, __type: ContentItem.resolveType(item) },
      image: ContentItem.getCoverImage(item),
      action: 'READ_CONTENT',
      summary: ContentItem.createSummary(item),
    }));
  }

  async campusFeature() {
    const { ContentItem } = this.context.dataSources;

    if (!this.context.campusId) return [];

    const rockCampusId = parseGlobalId(this.context.campusId).id;

    const items = await ContentItem.getByCampusId({
      campusId: rockCampusId,
    });

    return items.map((item, i) => ({
      id: createGlobalId(`${item.id}${i}`, 'ActionListAction'),
      title: item.title,
      subtitle: get(item, 'parent.title'),
      relatedNode: { ...item, __typename: ContentItem.resolveType(item) },
      image: ContentItem.getCoverImage(item),
      action: 'READ_CONTENT',
      summary: ContentItem.createSummary(item),
    }));
  }

  async mostRecentSermonAlgorithm() {
    const { ContentItem } = this.context.dataSources;

    const item = await ContentItem.getMostRecentSermon();
    return [
      {
        id: createGlobalId(`${item.id}`, 'ActionListAction'),
        title: item.title,
        subtitle: get(item, 'parent.title'),
        relatedNode: { ...item, __type: ContentItem.resolveType(item) },
        image: ContentItem.getCoverImage(item),
        action: 'READ_CONTENT',
        summary: ContentItem.createSummary(item),
      },
    ];
  }

  async seriesInProgressAlgorithm({ limit = 3 } = {}) {
    if (this.info) {
      this.info.cacheControl.setCacheHint({ maxAge: 0 });
    }
    const { ContentItem } = this.context.dataSources;

    const items = await ContentItem.getSeriesWithUserProgress();

    return items.slice(0, limit).map((item, i) => ({
      id: createGlobalId(`${item.id}${i}`, 'ActionListAction'),
      title: item.title,
      subtitle: get(item, 'contentChannel.name'),
      relatedNode: { ...item, __type: ContentItem.resolveType(item) },
      image: ContentItem.getCoverImage(item),
      action: 'READ_CONTENT',
      summary: ContentItem.createSummary(item),
    }));
  }

  async startSomethingNewAlgorithm({ limit = 3 } = {}) {
    if (this.info) {
      this.info.cacheControl.setCacheHint({ maxAge: 0 });
    }
    const { ContentItem } = this.context.dataSources;

    const items = await ContentItem.getNewSeries();

    return items.slice(0, limit).map((item, i) => ({
      id: createGlobalId(`${item.id}${i}`, 'ActionListAction'),
      title: item.title,
      subtitle: get(item, 'contentChannel.name'),
      relatedNode: { ...item, __type: ContentItem.resolveType(item) },
      image: ContentItem.getCoverImage(item),
      action: 'READ_CONTENT',
      summary: ContentItem.createSummary(item),
    }));
  }
}

export { resolver, schema, dataSource };
