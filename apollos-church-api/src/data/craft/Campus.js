import { ApolloError } from 'apollo-server';
import CraftDataSource from './CraftDataSource';

class CraftCampus extends CraftDataSource {
  async getFromRockId(rockId) {
    const campuses = await this.getFromRockIds({ ids: [rockId] });
    if (campuses && campuses.length) {
      return campuses[0];
    }
    return null;
  }

  async getFromRockIds({ ids }) {
    const result = await this.query(
      `
query campus($rockIds: [QueryArgument]) {
  entries(campusRockId: $rockIds, section:"campuses") {
    craftType: __typename
    ... on campuses_campus_Entry {
      emailAddress
      serviceTimes
      campusRockId
      campusStaff {
        id
        __typename
        ... on team_teamMember_Entry {
          id
          jobTitle
          firstName
          lastName
          teamPhoto {
            url
          }
        }
      }
      campusWelcome
    }
  }
}
      `,
      { rockIds: ids }
    );

    if (result?.error)
      throw new ApolloError(result?.error?.message, result?.error?.code);

    return result?.data?.entries || [];
  }
}

export { CraftCampus as dataSource };
