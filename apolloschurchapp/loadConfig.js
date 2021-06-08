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
  LITE_FEATURES_FRAGMENT: gql`
    fragment LiteFeaturesFragment on Feature {
      id
      __typename
      ... on ShareableImageFeature {
        id

        image {
          sources {
            uri
          }
        }
      }
      ... on VerticalCardListFeature {
        isFeatured
        title
        subtitle
      }
      ... on HorizontalCardListFeature {
        title
        subtitle
      }
      ... on ActionListFeature {
        title
        subtitle
      }
      ... on HeroListFeature {
        title
        subtitle
      }
      ... on PrayerListFeature {
        title
        subtitle
        isCard
      }
      ... on VerticalPrayerListFeature {
        title
        subtitle
      }
      ... on TextFeature {
        # The whole fragment is currently included b/c these nodes don't fetch their own content.
        title
        body
        sharing {
          message
        }
      }
      ... on ScriptureFeature {
        # The whole fragment is currently included b/c these nodes don't fetch their own content.
        title
        sharing {
          message
        }
        scriptures {
          id
          html
          reference
          copyright
          version
        }
      }
      ... on WebviewFeature {
        # The whole fragment is currently included b/c these nodes don't fetch their own content.
        linkText
        title
        url
      }
      ... on ButtonFeature {
        # The whole fragment is currently included b/c these nodes don't fetch their own content.
        action {
          title
          action
          relatedNode {
            id
            ... on Url {
              url
            }
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
