import ApollosConfig from '@apollosproject/config';
import FRAGMENTS from '@apollosproject/ui-fragments';
import gql from 'graphql-tag';

const fragments = {
  ...FRAGMENTS,
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
