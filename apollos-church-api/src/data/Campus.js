import { Campus } from '@apollosproject/data-connector-rock';
import gql from 'graphql-tag';
import { resolverMerge } from '@apollosproject/server-core';
import sanitizeHtmlNode from 'sanitize-html';
import { unescape } from 'lodash';

const { schema: CoreSchema, dataSource: CampusDataSource } = Campus;

const schema = gql`
  ${CoreSchema}
  extend type Campus {
    description: String
    leader: Person
    serviceTimes: String
    contactEmail: String
    childContentItemsConnection(
      first: Int
      after: String
    ): ContentItemsConnection
  }
`;

const resolver = resolverMerge(
  {
    Campus: {
      // eslint-disable-next-line
      childContentItemsConnection: async ({ id }, args, { dataSources }) =>
        null,
      //         const cursor = await dataSources.ContentItem.byRockCampus({
      //           campusId: id,
      //         });
      //
      //         return dataSources.ContentItem.paginate({
      //           cursor,
      //           args,
      //         });
      street1: ({ location }) => location.street1 || 'No locations near you. ',
      city: ({ location }) => location.city || "When there's one",
      state: ({ location }) => location.state || "we'll let you know!",
      postalCode: ({ location }) => location.postalCode || '',
      description: (root, args, { dataSources }) =>
        dataSources.Campus.getWithCraft(
          root,
          ({ craftCampus }) => craftCampus.campusWelcome
        ),

      leader: ({ leaderPersonAliasId }, args, { dataSources }) =>
        dataSources.Person.getFromAliasId(leaderPersonAliasId),
      serviceTimes: (root, args, { dataSources }) =>
        dataSources.Campus.getWithCraft(root, ({ craftCampus }) =>
          unescape(
            sanitizeHtmlNode(
              craftCampus.serviceTimes.replace(/<br +\/+>/, '\n'),
              {
                allowedTags: [],
                allowedAttributes: [],
              }
            )
          )
        ),
      contactEmail: (root, args, { dataSources }) =>
        dataSources.Campus.getWithCraft(
          root,
          ({ craftCampus }) => craftCampus.emailAddress
        ),
    },
  },
  Campus
);

class dataSource extends CampusDataSource {
  _getFromId = this.getFromId;

  getFromId = async (id) => {
    const campus = await this._getFromId(id);
    if (!campus) return null;

    const craftCampus = await this.context.dataSources.CraftCampus.getFromRockId(
      id
    );

    return { ...campus, craftCampus };
  };

  getWithCraft = async (root, func) => {
    if (root.craftCampus) {
      return func(root);
    }
    const craftCampus = await this.context.dataSources.CraftCampus.getFromRockId(
      root.id
    );
    // eslint-disable-next-line
    root.craftCampus = craftCampus;
    return func(root);
  };
}

export { schema, resolver, dataSource };
