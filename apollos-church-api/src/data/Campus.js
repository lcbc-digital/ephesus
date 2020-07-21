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
            sanitizeHtmlNode(craftCampus.serviceTimes, {
              allowedTags: [],
              allowedAttributes: [],
            })
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

// copied from core
export const latLonDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }
  const radlat1 = (Math.PI * lat1) / 180;
  const radlat2 = (Math.PI * lat2) / 180;
  const theta = lon1 - lon2;
  const radtheta = (Math.PI * theta) / 180;
  let dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) {
    dist = 1;
  }
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  return dist;
};

class dataSource extends CampusDataSource {
  _getFromId = (
    id // Why is this not in core 😭
  ) =>
    this.request()
      .filter(`Id eq ${id}`)
      .expand('Location')
      .expand('Location/Image')
      .first();

  expanded = true;

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
    root.craftCampus = craftCampus;
    return func(root);
  };

  getByLocation = async ({ latitude, longitude } = {}) => {
    let campuses = await this.getAll();

    const onlineCampuses = campuses
      .filter(({ campusTypeValue }) => campusTypeValue?.value === 'Online')
      .map((campus) => ({
        ...campus,
        location: {
          ...campus.location,
          street1: 'No locations near you. ',
          city: "When there's one",
          state: "we'll let you know!",
          postalCode: '',
        },
      }));
    campuses = campuses.filter(
      ({ campusTypeValue }) => campusTypeValue?.value !== 'Online'
    );

    campuses = campuses.map((campus) => ({
      ...campus,
      distanceFromLocation: latLonDistance(
        latitude,
        longitude,
        campus.location.latitude,
        campus.location.longitude
      ),
    }));

    campuses = campuses.sort(
      (a, b) => a.distanceFromLocation - b.distanceFromLocation
    );

    if (
      campuses.every(({ distanceFromLocation }) => distanceFromLocation > 50)
    ) {
      campuses = [...onlineCampuses, ...campuses];
    } else {
      campuses = [...campuses, ...onlineCampuses];
    }

    return campuses;
  };
}

export { schema, resolver, dataSource };
