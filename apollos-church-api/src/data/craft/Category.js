import { ApolloError } from 'apollo-server';
import gql from 'graphql-tag';
import * as ContentItem from './ContentItem';
import CraftDataSource, { mapToEdgeNode } from './CraftDataSource';

export const schema = gql`
  type CategoryContentItem implements ContentItem & Node {
    id: ID!
    title(hyphenated: Boolean): String
    coverImage: ImageMedia
    htmlContent: String
    summary: String
    childContentItemsConnection(
      first: Int
      after: String
    ): ContentItemsConnection
    siblingContentItemsConnection(
      first: Int
      after: String
    ): ContentItemsConnection
    images: [ImageMedia]
    videos: [VideoMedia]
    audios: [AudioMedia]
    parentChannel: ContentChannel
    theme: Theme
  }
`;

export const resolver = {
  CategoryContentItem: {
    ...ContentItem.resolver.ContentItem,
  },
};

export class dataSource extends CraftDataSource {
  categoryFragment = `{
    id
    title
  }`;

  // Override for: https://github.com/ApollosProject/apollos-apps/blob/master/packages/apollos-data-connector-rock/src/content-channels/resolver.js#L6
  // eslint-disable-next-line

  async getCategories({ after }) {
    const query = `query ($first: Int, $after: Int) {
        nodes: categories(
          limit: $first
          offset: $after
          groupId: 9
          hasDescendants: true
        ) ${this.categoryFragment}
      }`;

    const result = await this.query(query, {
      first: 20,
      after,
    });

    if (result?.error)
      throw new ApolloError(result?.error?.message, result?.error?.code);

    const results = result?.data?.categories || [];
    return mapToEdgeNode(results, after + 1);
  }

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
}
