import { RESTDataSource } from 'apollo-datasource-rest';
import ApollosConfig from '@apollosproject/config';
import { ApolloError } from 'apollo-server';
import { createCursor, parseCursor } from '@apollosproject/server-core';

export default class Craft extends RESTDataSource {
  baseURL = ApollosConfig.CRAFT.URL;

  willSendRequest = (request) => {
    request.headers.set('Authorization', ApollosConfig.CRAFT.GRAPH_TOKEN);
    request.headers.set('Content-Type', 'application/json');
  };

  // NOTE: Craft Integration
  query = (query, variables) =>
    this.post(
      '/',
      JSON.stringify({
        query,
        variables,
      })
    );

  entryFragment = `{
    id
    title
  }`;

  // Override for: https://github.com/ApollosProject/apollos-apps/blob/master/packages/apollos-data-connector-rock/src/content-channels/resolver.js#L6
  // eslint-disable-next-line
  getRootChannels() {
    return [
      {
        id: 7, // Matches Entry.typeId, craft doesn't expose a query for this
        name: 'Series',
      },
      {
        id: 29,
        name: 'Stories',
      },
      {
        id: 43,
        name: 'Studies',
      },
      {
        id: 15,
        name: 'Articles',
      },
    ];
  }

  // Override for: https://github.com/ApollosProject/apollos-apps/blob/master/packages/apollos-data-connector-rock/src/content-channels/resolver.js#L13
  // eslint-disable-next-line
  byContentChannelId(typeId) {
    return { typeId };
  }

  // Override: https://github.com/ApollosProject/apollos-apps/blob/master/packages/apollos-data-connector-rock/src/content-channels/data-source.js#L46
  async getFromId(id) {
    const result = await this.query(
      `query ($id: [QueryArgument]) {
        entry(id: $id) ${this.entryFragment}
      }`,
      { id }
    );
    if (result?.error)
      throw new ApolloError(result?.error?.message, result?.error?.code);
    return result?.data?.entry;
  }

  // Override for: https://github.com/ApollosProject/apollos-apps/blob/master/packages/apollos-data-connector-rock/src/content-channels/resolver.js#L12
  async paginate(props) {
    const { cursor: filter, args: { after, first = 20 } = {} } = props;

    let cursor = {};
    if (after) {
      cursor = parseCursor(after);
      if (!cursor && typeof cursor !== 'object') {
        throw new Error(`An invalid 'after' cursor was provided: ${after}`);
      }
    }

    const variables = {
      limit: first,
      offset: 0,
      orderBy: 'dateCreated',
      inReverse: true,
      ...cursor,
      ...filter,
    };

    const result = await this.query(
      `query ($limit: Int, $offset: Int, $orderBy: String, $inReverse: Boolean, $typeId: [QueryArgument]) {
        entries(
          limit: $limit
          offset: $offset
          orderBy: $orderBy
          inReverse: $inReverse
          typeId: $typeId
        ) ${this.entryFragment}
      }`,
      variables
    );
    console.log(result);

    if (!result || result.error)
      throw new ApolloError(result?.error?.message, result?.error?.code);

    // Might need REST API to get count
    const getTotalCount = () => 100;

    // build the edges - translate series to { edges: [{ node, cursor }] } format
    const edges = (result?.data?.entries || []).map((node, i) => ({
      node,
      cursor: createCursor({
        ...variables,
        offset: variables.offset + i + 1,
      }),
    }));

    return {
      edges,
      getTotalCount,
    };
  }

  // ContentItem
  attributeIsImage = ({ key }) =>
    key.toLowerCase().includes('image') ||
    key.toLowerCase().includes('photo') ||
    key.toLowerCase().includes('img');

  attributeIsVideo = ({ key }) =>
    ['videoLink', 'wistiaVideo', 'storyVideo', 'videoEmbed'].includes(key);

  attributeIsAudio = ({ key, attributeValues }) =>
    attributeValues?.[key]?.value?.endsWith?.('.mp3');

  // NOTE: Left off here
}
