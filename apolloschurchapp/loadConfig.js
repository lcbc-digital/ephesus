import ApollosConfig from '@apollosproject/config';
import FRAGMENTS from '@apollosproject/ui-fragments';
import gql from 'graphql-tag';
import fragmentTypes from './src/client/fragmentTypes.json';

const fragments = {
  ...FRAGMENTS,
  FEATURES_FRAGMENT: gql`
    fragment FeaturesFragment on Feature {
      id
      ...TextFeatureFragment
      ...ScriptureFeatureFragment
      ...WebviewFeatureFragment
      ... on ShareableImageFeature {
        id

        image {
          sources {
            uri
          }
        }
      }
    }
  `,

  CARD_FEATURES_FRAGMENT: gql`
    fragment CardFeaturesFragment on ContentItem {
      ... on ContentSeriesContentItem {
        features {
          ...FeaturesFragment
        }
      }
      ... on MediaContentItem {
        features {
          ...FeaturesFragment
        }
      }
      ... on WeekendContentItem {
        features {
          ...FeaturesFragment
        }
      }
    }
  `,
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
      # leader {
      #   id
      #   firstName
      #   lastName
      # }
      # serviceTimes
      # contactEmail
    }
  `,
  RELATED_NODE_FRAGMENT: gql`
    fragment RelatedFeatureNodeFragment on Node {
      id
      ... on Url {
        url
      }
      ... on ContentItem {
        theme {
          type
          colors {
            primary
            secondary
            screen
            paper
          }
        }
      }
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

// Create a map all the interfaces each type implements.
// If UniversalContentItem implements Node, Card, and ContentNode,
// our typemap would be { UniversalContentItem: ['Node', 'Card', 'ContentNode'] }
const TYPEMAP = fragmentTypes.__schema.types.reduce((acc, curr) => {
  const { name } = curr;
  const types = Object.fromEntries(
    curr.possibleTypes.map((type) => [type.name, name])
  );
  Object.keys(types).forEach((key) => {
    acc[key] = acc[key] ? [...acc[key], types[key]] : [types[key]];
  });
  return acc;
}, {});

ApollosConfig.loadJs({ FRAGMENTS: fragments, TYPEMAP });
