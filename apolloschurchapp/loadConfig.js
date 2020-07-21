import ApollosConfig from '@apollosproject/config';
import FRAGMENTS from '@apollosproject/ui-fragments';
import gql from 'graphql-tag';

const fragments = {
  ...FRAGMENTS,
  CAMPUS_PARTS_FRAGMENT: gql`
    fragment CampusParts on Campus {
      id
      name
      description
      latitude
      longitude
      street1
      street2
      city
      state
      postalCode
      image {
        uri
      }
      leader {
        id
        firstName
        lastName
      }
      serviceTimes
      contactEmail
    }
  `,
  LIVE_STREAM_FRAGMENT: gql`
    fragment LiveStreamFragment on LiveStream {
      isLive
      eventStartTime
      media {
        sources {
          uri
        }
      }
      webViewUrl

      contentItem {
        ... on WeekendContentItem {
          id
        }
        ... on MediaContentItem {
          id
        }
      }
    }
  `,
};

ApollosConfig.loadJs({ FRAGMENTS: fragments });
