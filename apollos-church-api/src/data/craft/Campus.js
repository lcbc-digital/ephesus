import { ApolloError } from 'apollo-server';
import CraftDataSource from './CraftDataSource';

class CraftCampus extends CraftDataSource {
  async getFromRockId(rockId) {
    const result = await this.query(
      `
query campus($rockId: [QueryArgument]) {
  entry(campusRockId: $rockId, section:"campuses") {
    craftType: __typename
    ... on campuses_campus_Entry {
      emailAddress
      serviceTimes
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
      { rockId }
    );

    if (result?.error)
      throw new ApolloError(result?.error?.message, result?.error?.code);

    return result?.data?.entry;
  }
}

export { CraftCampus as dataSource };
