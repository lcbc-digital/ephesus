import { ContentItem } from '@apollosproject/data-connector-rock';
import ApollosConfig from '@apollosproject/config';
import sanitizeHtml from '@apollosproject/data-connector-rock/lib/sanitize-html';
import { parseCursor } from '@apollosproject/server-core';
import sanitize from 'sanitize-html';
import { ApolloError } from 'apollo-server';
import CraftDataSource, { mapToEdgeNode } from './CraftDataSource';

export const { schema } = ContentItem;

const newResolvers = {
  htmlContent: ({ description }) => sanitizeHtml(description),
  childContentItemsConnection: ({ id }, args, context) =>
    console.log(args) || context.dataSources.ContentItem.getChildren(id, args),
  siblingContentItemsConnection: ({ id }, args, context) =>
    console.log(args) || context.dataSources.ContentItem.getSiblings(id, args),
  __resolveType: (root, { dataSources: { ContentItem } }) =>
    ContentItem.resolveType(root),
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

    # articles
    ... on articles_article_Entry {
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

  getVideos = () => [];

  getChildren = async (id, { after: cursor }) => {
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
      first: 20,
      after,
    });

    if (result?.error)
      throw new ApolloError(result?.error?.message, result?.error?.code);

    const results = result?.data?.node?.children || [];
    return mapToEdgeNode(results, after + 1);
  };

  getSiblings = async (id, { after: cursor }) => {
    let after = 0;
    if (cursor) {
      after = parseCursor(cursor);
    }

    const query = `query ($id: [QueryArgument], $first: Int, $after: Int) {
     node: entry(id: $id) {
       parent {
         children(limit: $first, offset: $after) {
           ${this.entryFragment}
         }
       }
     }
    }`;

    const result = await this.query(query, {
      id: [id],
      first: 20,
      after,
    });

    if (result?.error)
      throw new ApolloError(result?.error?.message, result?.error?.code);

    const results = result?.data?.node?.parent?.children || [];
    return mapToEdgeNode(results, after + 1);
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
      case 'articles_article_Entry': {
        // articles
        return entry.excerpt;
      }
      default: {
        return '';
      }
    }
  };

  getCoverImage = ({ craftType, ...entry }) => {
    switch (craftType) {
      case 'series_series_Entry':
      case 'articles_article_Entry': {
        // articles
        return {
          __typename: 'ImageMedia',
          key: entry.hero?.[0]?.image?.[0]?.id,
          name: entry.hero?.[0]?.image?.[0]?.title,
          sources: [{ uri: entry.hero?.[0]?.image?.[0]?.url }],
        };
      }
      case 'news_news_Entry': // news
      case 'bibleReading_bibleReadingPlan_Entry': // bible reading plan
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
      case 'series_series_Entry':
      case 'articles_article_Entry':
      case 'news_news_Entry': // news
      case 'bibleReading_bibleReadingPlan_Entry': // bible reading plan
      case 'stories_stories_Entry': // stories
      case 'studies_curriculum_Entry':
      default: {
        return 'UniversalContentItem';
      }
    }
  }
}
