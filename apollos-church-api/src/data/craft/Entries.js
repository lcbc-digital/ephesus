import gql from 'graphql-tag';

export dataSource from './CraftDataSource';

export const schema = gql`
  extend type Query {
    entries: [Entry]
  }
  type Entry {
    id: ID
    title: String
  }
`;

export const resolver = {
  Query: {
    async entries(root, props, context) {
      const craft = context?.dataSources?.Entries;
      const result = await craft.query(`
        query {
          entries {
            id
            title
          }
        }
      `);

      return result?.data?.entries;
    },
  },
  Event: {},
};
