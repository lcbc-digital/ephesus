import { ContentChannel } from '@apollosproject/data-connector-rock';
import CraftDataSource from './CraftDataSource';

export const resolver = {
  ...ContentChannel.resolver,
  ContentChannel: {
    ...ContentChannel.resolver.ContentChannel,
    childContentItemsConnection: ({ id }, args, { dataSources }) =>
      dataSources.ContentItem.byContentChannelId(id, args),
  },
};

export const { schema } = ContentChannel;

export class dataSource extends CraftDataSource {
  categoryFragment = `{
    id
    title
  }`;

  // Override for: https://github.com/ApollosProject/apollos-apps/blob/master/packages/apollos-data-connector-rock/src/content-channels/resolver.js#L6
  // eslint-disable-next-line
  getRootChannels() {
    return [
      {
        name: 'Sermons', // Is actually series
        id: {
          typeId: '7',
          source: 'EntryList',
        },
      },
      {
        name: 'Bible Reading', // Is actually bible reading plan
        id: {
          typeId: '40',
          source: 'EntryList',
        },
      },
      {
        id: { source: 'CategoriesRoot' }, // Made up internal ID for top level categories used at byContentChannelId
        name: 'Categories',
      },
      {
        id: {
          typeId: '41',
          source: 'EntryList',
        },
        name: 'News',
      },
    ];
  }

  async getCategories({ after }) {}

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
