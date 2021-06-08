import https from 'https';
import { RESTDataSource } from 'apollo-datasource-rest';
import ApollosConfig from '@apollosproject/config';
import { createCursor, parseCursor } from '@apollosproject/server-core';

export const mapToEdgeNode = (nodes, initial = 0) => ({
  edges: nodes.map((node, i) => ({ node, cursor: createCursor(i + initial) })),
});

const CRAFT_AGENT = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 1500,
  maxSockets: 70,
});

export default class Craft extends RESTDataSource {
  baseURL = ApollosConfig.CRAFT.URL;

  callCount = 0;

  calls = {};

  willSendRequest = (request) => {
    this.callCount += 1;
    const query = JSON.parse(request.body).query.replace(/(\r\n|\n|\r)/gm, '');
    if (!this.calls[query]) {
      this.calls[query] = 0;
    }
    this.calls[query] += 1;

    request.headers.set('Authorization', ApollosConfig.CRAFT.GRAPH_TOKEN);
    request.headers.set('Content-Type', 'application/json');

    request.agent = CRAFT_AGENT;
  };

  // NOTE: Craft Integration
  query(query, variables) {
    return this.post(
      '/',
      JSON.stringify({
        query,
        variables,
      })
    );
  }

  // Override for: https://github.com/ApollosProject/apollos-apps/blob/master/packages/apollos-data-connector-rock/src/content-channels/resolver.js#L12
  // eslint-disable-next-line class-methods-use-this
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
          .transform((result) =>
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
