/* eslint-disable class-methods-use-this */
import { Feature } from '@apollosproject/data-connector-rock';
import { createGlobalId } from '@apollosproject/server-core';
import { get, startCase } from 'lodash';
import ApollosConfig from '@apollosproject/config';
import gql from 'graphql-tag';

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
  ShareableImageFeature: {
    id: ({ id }) => createGlobalId(id, 'ShareableImageFeature'),
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

  type ShareableImageFeature implements Feature & Node {
    id: ID!
    order: Int

    image: ImageMedia
    title: String
  }

  extend type ActionBarAction {
    url: String
    label: String
  }
`;

class dataSource extends Feature.dataSource {
  getFromId(args, id, { info } = { info: {} }) {
    this.cacheControl = info.cacheControl;
    const type = id.split(':')[0];
    const funcArgs = JSON.parse(args);
    const method = this[`create${type}`].bind(this);
    this.info = info;
    if (funcArgs.campusId) {
      this.context.campusId = funcArgs.campusId;
    }
    return method(funcArgs);
  }

  createFeatureId({ args }) {
    return JSON.stringify({ campusId: this.context.campusId, ...args });
  }

  createSharableImageFeature({ url }) {
    return {
      id: JSON.stringify({ url }),
      image: { sources: [{ uri: url }] },
      __typename: 'ShareableImageFeature',
    };
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
}

export { resolver, schema, dataSource };
