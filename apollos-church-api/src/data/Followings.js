import { Followings } from '@apollosproject/data-connector-rock';

const { schema, dataSource } = Followings;

const resolver = {
  ...Followings.resolver,
  Query: {
    ...Followings.resolver.Query,
    // they don't have liked content
    likedContent: () => ({ edges: [] }),
  },
};

export { schema, resolver, dataSource };
