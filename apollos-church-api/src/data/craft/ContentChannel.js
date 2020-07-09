import { ContentChannel } from '@apollosproject/data-connector-rock';
import { createGlobalId } from '@apollosproject/server-core';
import CraftDataSource from './CraftDataSource';

export const resolver = {
  ...ContentChannel.resolver,
  ContentChannel: {
    ...ContentChannel.resolver.ContentChannel,
    id: ({ id }, args, context, { parentType }) =>
      createGlobalId(JSON.stringify(id), parentType.name),
    childContentItemsConnection: async ({ id }, args, { dataSources }) =>
      dataSources.ContentChannel.byChildren(id, args),
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

  async byChildren(id, args) {
    if (id.source === 'EntryList') {
      return this.context.dataSources.ContentItem.byTypeId(id.typeId, args);
    }
    if (id.source === 'CategoryChildren') {
      return this.context.dataSources.ContentItem.byCategoryId(
        id.categoryId,
        args
      );
    }
  }

  async getRootChannels() {
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
      ...(await this.context.dataSources.Category.getRootCategories()).map(
        (c) => ({
          name: c.title,
          id: {
            source: 'CategoryChildren',
            categoryId: c.id,
          },
        })
      ),
      {
        id: {
          typeId: '41',
          source: 'EntryList',
        },
        name: 'News',
      },
    ];
  }

  async getFromId(id) {
    try {
      const parsedId = JSON.parse(id);
      return { id: parsedId };
    } catch (e) {
      return null;
    }
  }
}
