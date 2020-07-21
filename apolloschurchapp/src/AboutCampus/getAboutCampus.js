import gql from 'graphql-tag';
import ApollosConfig from '@apollosproject/config';

export default gql`
  query CurrentAboutCampus($itemId: ID!) {
    node(id: $itemId) {
      ...CampusParts
    }
  }
  ${ApollosConfig.FRAGMENTS.CAMPUS_PARTS_FRAGMENT}
`;
