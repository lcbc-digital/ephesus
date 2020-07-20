import { ContentItem } from '@apollosproject/data-connector-rock';
import ApollosConfig from '@apollosproject/config';
import sanitizeHtml from '@apollosproject/data-connector-rock/lib/sanitize-html';
import { parseCursor, createGlobalId } from '@apollosproject/server-core';
import sanitize from 'sanitize-html';
import { ApolloError } from 'apollo-server';
import { get, kebabCase, intersection } from 'lodash';
import CraftDataSource, { mapToEdgeNode } from './CraftDataSource';

export const { schema } = ContentItem;

const newResolvers = {
  htmlContent: ({ description, articlePost }) => {
    if (articlePost && articlePost?.length > 0) {
      return sanitizeHtml(articlePost.map(({ body }) => body).join('\n'));
    }
    return sanitizeHtml(description);
  },
  childContentItemsConnection: ({ id }, args, context) =>
    context.dataSources.ContentItem.getChildren(id, args),
  siblingContentItemsConnection: ({ parent }, args, context) =>
    parent
      ? context.dataSources.ContentItem.getChildren(parent.id, args)
      : null,
  __resolveType: (root, { dataSources: { ContentItem } }) =>
    ContentItem.resolveType(root),
  parentChannel: ({ parent }, args, { dataSources }) =>
    dataSources.ContentItem.getFromId(parent.id),
};

const contentItemTypes = Object.keys(ApollosConfig.ROCK_MAPPINGS.CONTENT_ITEM);

const baseResolver = {
  ...ContentItem.resolver,
  DevotionalContentItem: {
    ...ContentItem.resolver.DevotionalContentItem,
    scriptures: async ({ bibleReference }, args, { dataSources }) => {
      if (bibleReference && bibleReference != null) {
        const scripture = await dataSources.Scripture.getScriptures(
          bibleReference
        );
        return scripture;
      }
      return null;
    },
  },
};

export const resolver = contentItemTypes.reduce(
  (acc, curr) => ({
    ...acc,
    [curr]: { ...baseResolver[curr], ...newResolvers },
  }),
  {
    ...baseResolver,
  }
);

export class dataSource extends CraftDataSource {
  entryFragment = `
    id
    title
    typeId
    craftType: __typename

    # series
    ... on series_series_Entry {
      description: seriesDescription
      hero {
        ... on hero_photoHero_BlockType {
          image {
            id
            title
            url
          }
        }
      }
    }

    # sermons
    ... on series_sermon_Entry {
      description: sermonDescription
    }

    # bible reading plans
    ... on bibleReading_bibleReadingPlan_Entry {
      description: planDescription
      image {
        id
        title
        url
      }
    }

    # for children of bible reading plans
    ... on bibleReading_bibleReading_Entry {
      description: body
      bibleReference
    }


    # Parent block - for retrieving needed data for series entries
    parent {
      ... on bibleReading_bibleReadingPlan_Entry {
        image {
          id
          title
          url
        }
      }
      id
    }

    # news
    ... on news_news_Entry {
      description: body
      image {
        id
        title
        url
      }
    }

    # stories
    ... on stories_stories_Entry {
      subtitle
      image: storyPortrait {
        id
        title
        url
      }
    }

    # studies
    ... on studies_curriculum_Entry {
      description: studySummary
      image {
        id
        title
        url
      }
    }

  ... on series_sermon_Entry {
    videoEmbed
  }

  # articles
  ... on articles_article_Entry {
    articlePost {
      ... on articlePost_textBlock_BlockType {
        body
      }
    }
    excerpt
    hero {
      ... on hero_photoHero_BlockType {
        image {
          id
          title
          url
        }
      }
    }
  }

  ... on events_hasContentBuilder_Entry {
    hero {
      ... on hero_photoHero_BlockType {
        image {
          id
          title
          url
        }
      }
    }
    description:mobileAppContent
  }

  ... on pages_pages_Entry {
    hero {
      ... on hero_photoHero_BlockType {
        image {
          id
          title
          url
        }
      }
    }
    description:mobileAppContent
  }

  ... on nextSteps_nextStepDefault_Entry {
    description: mobileAppContent
    excerpt
    hero {
      ... on hero_photoHero_BlockType {
        image {
          url
          id
          title
        }
      }
    }
  }
  `;

  personaFragment = `
    ... on nextSteps_nextStepDefault_Entry {
      persona {
        id
      }
    }
    ... on series_series_Entry {
      persona {
        id
      }
    }
    ... on series_sermon_Entry {
      persona {
        id
      }
    }
    ... on articles_article_Entry {
      persona {
        id
      }
    }
    ... on stories_stories_Entry {
      persona {
        id
      }
    }
    ... on news_news_Entry {
      persona {
        id
      }
    }
    ... on events_events_Entry {
      persona {
        id
      }
    }

    ... on events_hasContentBuilder_Entry {
      persona {
        id
      }
    }
  `;

  // Override for: https://github.com/ApollosProject/apollos-apps/blob/master/packages/apollos-data-connector-rock/src/content-channels/resolver.js#L13
  // eslint-disable-next-line
  byContentChannelId({ source }, { after }) {
    if (source === 'CategoriesRoot') {
      return this.context.dataSources.Category.getCategories({ after });
    }
    if (source === 'EntryList') {
      return;
    }
    return [];
  }

  byContentChannelIds(contentChannelIds) {
    console.log(byContentChannelIds);
  }

  async getCraftPersonaIdsForUser() {
    let personas = [32210];
    try {
      const rockPersonas = await this.context.dataSources.Person.getPersonas({
        categoryId: ApollosConfig.ROCK_MAPPINGS.DATAVIEW_CATEGORIES.PersonaId,
      });
      const query = `
      query craftPersonas ($ids: [QueryArgument]){
        categories(personaId: $ids){
          id
          title
        }
      }
      `;
      const result = await this.query(query, {
        ids: rockPersonas.map(({ id }) => id),
      });

      if (result?.error)
        throw new ApolloError(result?.error?.message, result?.error?.code);

      const craftIds = (result?.data?.categories || []).map(({ id }) => id);
      personas = [...personas, ...craftIds];
    } catch (e) {
      console.log(e);
    }
    return personas;
  }

  async byTypeId(id, { after: cursor, first }) {
    let after = 0;
    if (cursor) {
      after = parseCursor(cursor);
    }

    const query = `query ($first: Int, $after: Int, $typeId: [QueryArgument]) {
        nodes: entries(
          limit: $first
          offset: $after
          typeId: $typeId
        ) { ${this.entryFragment} }
      }`;

    const result = await this.query(query, {
      typeId: [id],
      first: first || 20,
      after,
    });

    if (result?.error)
      throw new ApolloError(result?.error?.message, result?.error?.code);

    const results = result?.data?.nodes || [];
    return mapToEdgeNode(results, after + 1);
  }

  async byCategoryId(id, { after: cursor, first }) {
    let after = 0;
    if (cursor) {
      after = parseCursor(cursor);
    }

    const query = `query ($first: Int, $after: Int, $categories: [Int]) {
        nodes: entries(
          limit: $first
          offset: $after
          relatedTo: $categories
        ) { ${this.entryFragment} }
      }`;

    const result = await this.query(query, {
      categories: [id],
      first: first || 20,
      after,
    });

    if (result?.error)
      throw new ApolloError(result?.error?.message, result?.error?.code);

    const results = result?.data?.nodes || [];
    return mapToEdgeNode(results, after + 1);
  }

  async getBySection(section) {
    const query = `query ($section: [String]) {
        nodes: entries(
          section: $section
        ) {
        ... on appGrowingInFaith_appGrowingInFaith_Entry {
          children: growingInFaithEntries {
            ${this.entryFragment}
           ${this.personaFragment}
          }
        }
        ... on appChurchEvents_appChurchEvents_Entry {
          children: churchEventEntries {
            ${this.entryFragment}
           ${this.personaFragment}
          }
        }
        ... on appNextSteps_appNextSteps_Entry {
          children: nextStepsEntries {
           ${this.entryFragment}
           ${this.personaFragment}
          }
        }
      }
    }`;

    const result = await this.query(query, {
      section: [section],
    });

    if (result?.error)
      throw new ApolloError(result?.error?.message, result?.error?.code);

    const results = (result?.data?.nodes || []).flatMap(
      (node) => node.children
    );

    const userPersonas = await this.getCraftPersonaIdsForUser();

    const resultsWithPersonas = results.filter(({ persona }) => {
      if (!persona || persona.length === 0) {
        // Include items that don't have a persona or have no specific personas.
        return true;
      }
      if (
        (persona && intersection(persona.map(({ id }) => id)), userPersonas)
          .length
      ) {
        // Include items that share personas with the current user
        return true;
      }
      return false;
    });
    return resultsWithPersonas;
  }

  // Override: https://github.com/ApollosProject/apollos-apps/blob/master/packages/apollos-data-connector-rock/src/content-channels/data-source.js#L46
  async getFromId(id) {
    const query = `query ($id: [QueryArgument]) {
     node: entry(id: $id) { ${this.entryFragment} }
    }`;
    // if (typename === '???') { // Example of using a different query for a different type.
    //   query = `query ($id: [QueryArgument]) {
    //     node: entry(id: $id) ${this.entryFragment}
    //   }`;
    // } else if (typename === '???') {
    //   query = `query ($id: [QueryArgument]) {
    //     node: category(id: $id) ${this.categoryFragment}
    //   }`;
    // } else {
    //   query = `query ($id: [QueryArgument]) {
    //     node: entry(id: $id) ${this.entryFragment}
    //   }`;
    // }

    const result = await this.query(query, { id: [id] });
    if (result?.error)
      throw new ApolloError(result?.error?.message, result?.error?.code);

    const node = result?.data?.node;

    if (!node) {
      return null;
    }

    const __typename = this.resolveType(node);
    return { ...node, __typename };
  }

  async getUpNext({ id }) {
    const { Auth, Interactions } = this.context.dataSources;

    // Safely exit if we don't have a current user.
    try {
      await Auth.getCurrentPerson();
    } catch (e) {
      return null;
    }

    const childItemsOldestFirst = await this.getChildren(id, {
      after: null,
      first: null,
    });

    const childItems = childItemsOldestFirst.edges
      .map(({ node }) => node)
      .reverse();
    const childItemsWithApollosIds = childItems.map((childItem) => ({
      ...childItem,
      apollosId: createGlobalId(childItem.id, this.resolveType(childItem)),
    }));

    const interactions = await Interactions.getInteractionsForCurrentUserAndNodes(
      {
        nodeIds: childItemsWithApollosIds.map(({ apollosId }) => apollosId),
        actions: ['COMPLETE'],
      }
    );

    const apollosIdsWithInteractions = interactions.map(
      ({ foreignKey }) => foreignKey
    );

    const firstInteractedIndex = childItemsWithApollosIds.findIndex(
      ({ apollosId }) => apollosIdsWithInteractions.includes(apollosId)
    );

    if (firstInteractedIndex === -1) {
      // If you haven't completede anything, return the first (last in reversed array) item;
      return childItemsWithApollosIds[childItemsWithApollosIds.length - 1];
    }
    if (firstInteractedIndex === 0) {
      // If you have completed the last item, return null (no items left to read)
      return null;
    }
    // otherwise, return the item immediately following (before) the item you have already read
    return childItemsWithApollosIds[firstInteractedIndex - 1];
  }

  getFeatures = () => {};

  getVideos = ({ videoEmbed, title }) => {
    if (videoEmbed) {
      return [
        {
          __typename: 'VideoMedia',
          name: title,
          embedHtml: null,
          sources: [{ uri: videoEmbed }],
        },
      ];
    }
    return [];
  };

  getChildren = async (id, { after: cursor, first = 20 }) => {
    let after = 0;
    if (cursor) {
      after = parseCursor(cursor);
    }

    const query = `query ($id: [QueryArgument], $first: Int, $after: Int) {
     node: entry(id: $id) {
       children(limit: $first, offset: $after) {
        ${this.entryFragment}
       }
     }
    }`;

    const result = await this.query(query, {
      id: [id],
      first,
      after,
    });

    if (result?.error)
      throw new ApolloError(result?.error?.message, result?.error?.code);

    const results = result?.data?.node?.children;
    if (!results) {
      return null;
    }
    return mapToEdgeNode(results, after + 1);
  };

  getParent = async (id) => {
    const query = `query ($id: [QueryArgument]) {
     node: entry(id: $id) {
       parent {
        ${this.entryFragment}
       }
     }
    }`;

    const result = await this.query(query, {
      id: [id],
    });

    if (result?.error)
      throw new ApolloError(result?.error?.message, result?.error?.code);

    const parent = result?.data?.node?.parent;
    if (!parent) {
      return null;
    }
    return parent;
  };

  async getAppBarActions() {
    const query = `
      {
        entries(section: "appActionBar") {
          id
          title
          ... on appActionBar_appActionBar_Entry {
            actionBarIcon
            actionBarURL
            actionBarLabel
            usePersonId
          }
        }
      }
    `;

    const result = await this.query(query);
    const results = result?.data?.entries;

    return results.map(async (r) => {
      let url = r.actionBarURL;
      try {
        if (r.usePersonId) {
          const token = await this.context.dataSources.Auth.getAuthToken();
          url = new URL(r.actionBarURL);
          url.searchParams.append('rckipid', token);
          url = url.toString();
        }
      } catch (e) {
        console.log(e);
        // move on...
      }
      return {
        id: r.id,
        label: r.actionBarLabel,
        url,
        icon: kebabCase(r.actionBarIcon),
      };
    });
  }

  // Broken right now due to a craft bug!
  //   getSiblings = async (id, { after: cursor }) => {
  //     let after = 0;
  //     if (cursor) {
  //       after = parseCursor(cursor);
  //     }
  //
  //     const query = `query ($id: [QueryArgument], $first: Int, $after: Int) {
  //      node: entry(id: $id) {
  //        parent {
  //          children(limit: $first, offset: $after) {
  //            ${this.entryFragment}
  //          }
  //        }
  //      }
  //     }`;
  //
  //     const result = await this.query(query, {
  //       id: [id],
  //       first: 20,
  //       after,
  //     });
  //
  //     if (result?.error)
  //       throw new ApolloError(result?.error?.message, result?.error?.code);
  //
  //     const results = result?.data?.node?.parent?.children || [];
  //     return mapToEdgeNode(results, after + 1);
  //   };

  getMostRecentSermon = async () => {
    const query = `query {
      entries(section:"series", hasDescendants:true, limit:1) {
        children(orderBy:"postDate desc", limit:1) {
          ${this.entryFragment}
          parent {
            title
          }
        }
      }
    }`;

    const result = await this.query(query);

    if (result?.error)
      throw new ApolloError(result?.error?.message, result?.error?.code);

    return get(result, 'data.entries[0].children[0]');
  };

  getActiveLiveStreamContent = async () => {
    const { LiveStream } = this.context.dataSources;
    const { isLive } = await LiveStream.getLiveStream();
    // if there is no live stream, then there is no live content. Easy enough!
    if (!isLive) return [];

    const mostRecentSermon = await this.getMostRecentSermon();
    return [mostRecentSermon];
  };

  getByCampusId = async (campusId) => {
    const query = `query($campusRockId: [QueryArgument]){
    entries(section:"appCampusContent", hasDescendants:true, campusRockId: $campusRockId){
        children {
          __typename
          ... on appCampusContent_campusSchedule_Entry {
            campusContentEvents {
              ${this.entryFragment}
            }
          }
        }
      }
    }`;

    const result = await this.query(query, { campusId });

    if (result?.error)
      throw new ApolloError(result?.error?.message, result?.error?.code);

    return get(result, 'data.entries[0].children[0].campusContentEvents');
  };

  getParentHeroImage = async ({ parentId }) => {
    const query = `query ($id: [QueryArgument]) {
      entry(id: $id) {
        ... on series_series_Entry {
          hero {
            ... on hero_photoHero_BlockType {
              image { url, title, id }
            }
          }
        }
      }
    }`;

    const result = await this.query(query, { id: parentId });

    if (result?.error)
      throw new ApolloError(result?.error?.message, result?.error?.code);

    return get(result, 'data.entry.hero[0].image[0]');
  };

  createSummary = ({ craftType, ...entry }) => {
    switch (craftType) {
      case 'series_series_Entry': // sermons
      case 'studies_curriculum_Entry': // studies
      case 'bibleReading_bibleReadingPlan_Entry': // bible reading plan
      case 'news_news_Entry': // news
      case 'series_sermon_Entry': {
        // series
        return sanitize(entry.description, {
          allowedTags: ['p'],
          transformTags: {
            p() {
              return {};
            },
          },
        });
      }
      case 'stories_stories_Entry': {
        // stories
        return entry.subtitle;
      }
      case 'nextSteps_nextStepDefault_Entry':
      case 'articles_article_Entry': {
        // articles
        return entry.excerpt;
      }
      default: {
        return '';
      }
    }
  };

  getCoverImage = async ({ craftType, ...entry }) => {
    switch (craftType) {
      case 'series_series_Entry':
      case 'events_hasContentBuilder_Entry':
      case 'pages_pages_Entry':
      case 'nextSteps_nextStepDefault_Entry':
      case 'articles_article_Entry': {
        // articles
        return {
          __typename: 'ImageMedia',
          key: entry.hero?.[0]?.image?.[0]?.id,
          name: entry.hero?.[0]?.image?.[0]?.title,
          sources: [{ uri: entry.hero?.[0]?.image?.[0]?.url }],
        };
      }
      case 'series_sermon_Entry': {
        const { url, id, title } = await this.getParentHeroImage({
          parentId: entry.parent.id,
        });

        return {
          __typename: 'ImageMedia',
          key: id,
          name: title,
          sources: [{ uri: url }],
        };
      }
      case 'bibleReading_bibleReading_Entry': {
        return {
          __typename: 'ImageMedia',
          key: entry.parent?.image?.[0]?.id,
          name: entry.parent?.image?.[0]?.title,
          sources: [{ uri: entry.parent?.image?.[0]?.url }],
        };
      }
      case 'news_news_Entry': // news
      case 'bibleReading_bibleReadingPlan_Entry':
      case 'stories_stories_Entry': // stories
      case 'studies_curriculum_Entry': {
        // studies
        return {
          __typename: 'ImageMedia',
          key: entry.image?.[0]?.id,
          name: entry.image?.[0]?.title,
          sources: [{ uri: entry.image?.[0]?.url }],
        };
      }
      default: {
        return null;
      }
    }
  };

  createHyphenatedString =
    ContentItem.dataSource.prototype.createHyphenatedString;

  resolveType({ craftType, ...node }) {
    switch (craftType) {
      case 'bibleReading_bibleReading_Entry': {
        return 'DevotionalContentItem';
      }
      case 'series_sermon_Entry': {
        return 'MediaContentItem';
      }
      case 'bibleReading_bibleReadingPlan_Entry': // bible reading plan
      case 'series_series_Entry': {
        return 'ContentSeriesContentItem';
      }
      case 'articles_article_Entry':
      case 'news_news_Entry': // news
      case 'stories_stories_Entry': // stories
      case 'studies_curriculum_Entry':
      default: {
        return 'UniversalContentItem';
      }
    }
  }
}
