import { Feature } from '@apollosproject/data-connector-rock';
import { createGlobalId, parseGlobalId } from '@apollosproject/server-core';
import { get } from 'lodash';
<<<<<<< Updated upstream
import gql from 'graphql-tag';

const { resolver: baseResolver, schema: baseSchema } = Feature;

const schema = gql`
  ${baseSchema}

  extend type Query {
    userFeedFeaturesWithCampus(campusId: ID): [Feature]
  }
`;
=======
import ApollosConfig from '@apollosproject/config';
import gql from 'graphql-tag';

const { resolver: baseResolver, schema: baseSchema } = Feature;
>>>>>>> Stashed changes

const resolver = {
  ...baseResolver,
  Query: {
    ...baseResolver.Query,
    userFeedFeaturesWithCampus: (root, { campusId }, context, ...args) => {
      context.campusId = campusId;
      return baseResolver.Query.userFeedFeatures(root, null, context, ...args);
    },
  },
  ActionListAction: {
    ...baseResolver.ActionListAction,
    subtitle: ({ subtitle, summary }) => subtitle || summary,
  },
};

const schema = gql`
  ${baseSchema}

  type ActionBarAction {
    id: ID
    url: String
  }

  type ActionBarFeature implements Feature & Node {
    id: ID!
    order: Int

    title: String
    actions: [ActionBarAction]
  }
`;

class dataSource extends Feature.dataSource {
  ACTION_ALGORITHIMS = {
    // We need to make sure `this` refers to the class, not the `ACTION_ALGORITHIMS` object.
    ...this.ACTION_ALGORITHIMS,
    MOST_RECENT_SERMON: this.mostRecentSermonAlgorithm.bind(this),
    SECTION: this.sectionFeature.bind(this),
    CAMPUS: this.campusFeature.bind(this),
  };

<<<<<<< Updated upstream
  getFromId(args, id) {
    const type = id.split(':')[0];
    const funcArgs = JSON.parse(args);
    const method = this[`create${type}`].bind(this);
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
=======
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

  async createActionBarFeature({ actions = [], title }) {
    // Generate a list of horizontal cards.
    // const cards = () => this.runAlgorithms({ algorithms });
    return {
      // The Feature ID is based on all of the action ids, added together.
      // This is naive, and could be improved.
      id: this.createFeatureId({
        type: 'ActionBarFeature',
        args: {
          actions,
          title,
        },
      }),
      actions,
      title,
      // Typename is required so GQL knows specifically what Feature is being created
      __typename: 'ActionBarFeature',
    };
>>>>>>> Stashed changes
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
}

export { resolver, schema, dataSource };
