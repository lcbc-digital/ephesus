import { ContentChannel } from '@apollosproject/data-connector-rock';
import CraftDataSource from './CraftDataSource';

export const { schema, resolver } = ContentChannel;

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
        id: 'entries:7', // Matches Entry.typeId, craft doesn't expose a query for this
        name: 'Sermons', // Is actually series
      },
      {
        id: 'entries:40',
        name: 'Bible Reading', // Is actually bible reading plan
      },
      {
        id: 'categories:1', // Made up internal ID for top level categories used at byContentChannelId
        name: 'Categories',
      },
      {
        id: 'entries:41',
        name: 'News',
      },
    ];
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

    console.log(node, id);
    if (!node) {
      return null;
    }

    const __typename = this.resolveType(node);
    return { ...node, __typename };
  }
}
