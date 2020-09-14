import gql from 'graphql-tag';
import ApollosConfig from '@apollosproject/config';

export default gql`
  query CurrentAboutCampus($itemId: ID!) {
    node(id: $itemId) {
      ...CampusParts
      ... on Campus {
        serviceTimes
        contactEmail
      }
    }
  }
  ${ApollosConfig.FRAGMENTS.CAMPUS_PARTS_FRAGMENT}
`;
