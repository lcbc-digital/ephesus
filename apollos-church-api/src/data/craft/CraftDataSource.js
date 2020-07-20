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
  async paginate({ cursor, args: { after, first = 20 } = {} }) {
    // console.log(cursor);
    let skip = 0;
    if (after) {
      const parsed = parseCursor(after);
      if (parsed && Object.hasOwnProperty.call(parsed, 'position')) {
        skip = parsed.position + 1;
      } else {
        throw new Error(`An invalid 'after' cursor was provided: ${after}`);
      }
    }

    // temporarily store the select parameter to
    // put back after "Id" is selected for the count
    const edges = cursor
      ? cursor
          .top(first)
          .skip(skip)
          .transform(
            (result) =>
              console.log(result) ||
              result.map((node, i) => ({
                node,
                cursor: createCursor({ position: i + skip }),
              }))
          )
          .get()
      : [];

    return {
      getTotalCount: cursor.count,
      edges,
    };
  }
}
