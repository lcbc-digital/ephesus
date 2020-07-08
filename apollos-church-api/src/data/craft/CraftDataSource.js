import { RESTDataSource } from 'apollo-datasource-rest';
import ApollosConfig from '@apollosproject/config';
import { ApolloError } from 'apollo-server';
import { createCursor, parseCursor } from '@apollosproject/server-core';

export const mapToEdgeNode = (nodes, initial = 0) => ({
  edges: nodes.map((node, i) => ({ node, cursor: createCursor(i + initial) })),
});

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

  // Override for: https://github.com/ApollosProject/apollos-apps/blob/master/packages/apollos-data-connector-rock/src/content-channels/resolver.js#L12
  async paginate(props) {
    const { cursor: __filter, args: { after, first = 20 } = {} } = props;

    const { __querySource: qs, ...filter } = __filter;
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

    let query;
    if (qs === 'entries') {
      query = `query ($limit: Int, $offset: Int, $orderBy: String, $inReverse: Boolean, $typeId: [QueryArgument]) {
        nodes: entries(
          limit: $limit
          offset: $offset
          orderBy: $orderBy
          inReverse: $inReverse
          typeId: $typeId
        ) { ${this.entryFragment} }
      }`;
    } else if (qs === 'categories') {
      query = `query ($limit: Int, $offset: Int, $orderBy: String, $inReverse: Boolean, $groupId: [QueryArgument], $hasDescendants: Boolean) {
        nodes: categories(
          limit: $limit
          offset: $offset
          orderBy: $orderBy
          inReverse: $inReverse
          groupId: $groupId
          hasDescendants: $hasDescendants
        ) ${this.categoryFragment}
      }`;
    }

    const result = await this.query(query, variables);

    if (!result || result.error)
      throw new ApolloError(result?.error?.message, result?.error?.code);

    // TODO: Might need REST API to get count but not necessary for UI
    const getTotalCount = () => 100;

    // build the edges - translate series to { edges: [{ node, cursor }] } format
    const edges = (result?.data?.nodes || []).map((node, i) => ({
      node: {
        ...node,
      },
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
}
