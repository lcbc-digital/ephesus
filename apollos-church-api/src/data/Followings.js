import { Followings } from '@apollosproject/data-connector-rock';

const { schema, dataSource } = Followings;

const resolver = {
  ...Followings.resolver,
  Mutation: {
    ...Followings.resolver.Mutation,
    updateLikeNode: async (
      root,
      { input: { nodeId, operation } },
      { dataSources },
      resolveInfo
    ) =>
      dataSources.Followings.updateLikeNode({
        //
        // custom
        nodeId: `ContentItem:${nodeId.split(':')[1]}`,
        //
        //
        operation,
        resolveInfo,
      }),
  },
  Query: {
    ...Followings.resolver.Query,
    likedContent: async (root, { after, first }, { dataSources }) => {
      const followingsPaginated = await dataSources.Followings.paginatedGetFollowingsForCurrentUser(
        { type: 'ContentItem', after, first }
      );
      const followings = await followingsPaginated.edges;
      const ids = followings.map((f) => f.node.entityId);
      //
      // custom
      const contentItems = await dataSources.ContentItem.getFromIds(ids);
      //
      //
      const contentItemEdges = contentItems.map((contentItem) => ({
        node: { ...contentItem, isLiked: true },
        //
        // custom
        following: followings.find(
          (f) => f.node.entityId.toString() === contentItem.id
        ).node,
        cursor: followings.find(
          (f) => f.node.entityId.toString() === contentItem.id
        ).cursor,
        //
        //
      }));
      const sortedContentItemEdges = contentItemEdges.sort(
        (a, b) =>
          new Date(a.following.createdDateTime) <
          new Date(b.following.createdDateTime)
      );

      return { edges: sortedContentItemEdges };
    },
  },
};

export { schema, resolver, dataSource };
