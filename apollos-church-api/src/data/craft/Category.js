import { ApolloError } from 'apollo-server';
import CraftDataSource from './CraftDataSource';

// export const schema = gql`
//   type CategoryContentItem implements ContentItem & Node {
//     id: ID!
//     title(hyphenated: Boolean): String
//     coverImage: ImageMedia
//     htmlContent: String
//     summary: String
//     childContentItemsConnection(
//       first: Int
//       after: String
//     ): ContentItemsConnection
//     siblingContentItemsConnection(
//       first: Int
//       after: String
//     ): ContentItemsConnection
//     images: [ImageMedia]
//     videos: [VideoMedia]
//     audios: [AudioMedia]
//     parentChannel: ContentChannel
//     theme: Theme
//   }
// `;

// export const resolver = {
//   CategoryContentItem: {
//     ...ContentItem.resolver.ContentItem,
//   },
// };

export class dataSource extends CraftDataSource {
  categoryFragment = `{
    id
    title
  }`;

  // Override for: https://github.com/ApollosProject/apollos-apps/blob/master/packages/apollos-data-connector-rock/src/content-channels/resolver.js#L6
  // eslint-disable-next-line

  async getRootCategories() {
    const query = `query {
        categories(
          groupId: 9
          hasDescendants: true
        ) ${this.categoryFragment}
      }`;

    const result = await this.query(query);

    console.log(result);

    if (result?.error)
      throw new ApolloError(result?.error?.message, result?.error?.code);

    return result?.data?.categories || [];
  }
}
