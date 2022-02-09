import { get } from 'lodash';
import { Text, Linking } from 'react-native';
import {
  AddPrayerScreenConnected,
  ConfirmationDialogScreen,
} from '@apollosproject/ui-prayer/src/screens';
import {
  DefaultCard,
  HighlightCard,
  FeaturedCard,
  BodyText,
  H3,
  H6,
  HorizontalDefaultCard,
  HorizontalHighlightCard,
  PaddedView,
} from '@apollosproject/ui-kit';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import ImageCard from '../ui/ImageCard';
import ShareableImageFeature from '../ui/ShareableImageFeature';

import fontStack from './fontStack';

const safeHandleUrl = async (url) => {
  try {
    if (url.startsWith('http') && !url.includes('#external')) {
      // safe enough to use InAppBrowser
      return InAppBrowser.open(url);
    }

    const canWeOpenUrl = await Linking.canOpenURL(url);

    if (canWeOpenUrl) {
      return Linking.openURL(url);
    }
  } catch (e) {
    console.warn(e);
  }
  return false;
};

const cardMapper = (props) => {
  // map typename to the the card we want to render.
  if (props.isFeatured) {
    return <FeaturedCard {...props} theme={{ ...props.relatedNode?.theme }} />;
  }
  switch (get(props, '__typename')) {
    case 'Url':
      if (!props.title && !props.subtitle) {
        return <ImageCard {...props} />;
      }
      return <HighlightCard {...props} />;

    case 'MediaContentItem':
    case 'WeekendContentItem':
      return (
        <HighlightCard {...props} theme={{ ...props.relatedNode?.theme }} />
      );
    default:
      return <DefaultCard {...props} />;
  }
};

const horizontalCardMapper = ({ title, hyphenatedTitle, ...props }) => {
  // map typename to the the card we want to render.
  switch (get(props, '__typename')) {
    case 'MediaContentItem':
    case 'WeekendContentItem':
      return <HorizontalHighlightCard title={hyphenatedTitle} {...props} />;
    case 'Message':
      return (
        <PaddedView>
          {title ? <H3>{title}</H3> : null}
          {props.subtitle ? <H6>{props.subtitle}</H6> : null}
          {props.relatedNode?.message ? (
            <BodyText>{props.relatedNode?.message}</BodyText>
          ) : null}
        </PaddedView>
      );
    default:
      return <HorizontalDefaultCard title={title} {...props} />;
  }
};

const colors = {
  primary: '#008CD0',
  secondary: '#008CD0', // '#004F71',
  tertiary: '#313131',
};

export const sizing = {
  baseBorderRadius: 8,
};

export const buttons = () => ({
  secondary: {
    fill: '#313131',
    accent: '#ffffff',
  },
});

const overlays = {
  'no-overlay': () => () => ({
    colors: ['transparent', 'transparent'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
    locations: [0, 1],
  }),
};

export const typography = {
  ...fontStack,
};

export const overrides = {
  'ui-onboarding.Landing.BrandIcon': {
    size: 120,
  },
  'ui-connected.ContentCardConnected.ContentCardComponentMapper': {
    Component: () => cardMapper,
  },
  'ui-connected.SuggestedFollowListConnected': { Component: () => () => null },
  'ui-connected.HorizontalContentCardConnected.HorizontalContentCardComponentMapper':
    {
      Component: () => horizontalCardMapper,
    },
  'ui-connected.FeaturesFeedConnected': {
    additionalFeatures: { ShareableImageFeature: () => ShareableImageFeature },
  },
  'ui-kit.FeaturedCard.Label': {
    type: 'secondary',
  },
  'ui-kit.HighlightCard.Label': {
    type: 'secondary',
  },
  H1: {
    fontFamily: typography.sans.black.default,
  },
  H2: {
    fontFamily: typography.sans.black.default,
  },
  H3: {
    fontFamily: typography.sans.black.default,
  },
  H4: {
    fontFamily: typography.sans.black.default,
  },
  H5: {
    fontFamily: typography.sans.bold.default,
  },
  H6: {
    fontFamily: typography.sans.black.default,
  },
  'ui-prayer.PrayerExperience': () => ({
    AddPrayerComponent: (props) => (
      <AddPrayerScreenConnected
        {...props}
        AddedPrayerComponent={(props) => (
          <ConfirmationDialogScreen
            {...props}
            title={
              'Thanks for giving our community the opportunity to pray for you!'
            }
            body={
              <Text>
                <BodyText>
                  In addition to our prayer community here on the LCBC App, your
                  request has also been sent to the LCBC Ministry Team and a
                  small trusted team of volunteers.
                </BodyText>
                {'\n\n'}
                <BodyText>
                  We hope you feel encouraged by God’s presence in your life and
                  his love for you today!
                </BodyText>
              </Text>
            }
          />
        )}
      />
    ),
  }),
  'ui-prayer.PrayerCard.StyledCard': {
    cardColor: colors.darkSecondary,
  },
  HTMLView: {
    onPressAnchor: () => (url) => {
      safeHandleUrl(url);
    },
  },
};

export default { colors, typography, sizing, overrides, overlays, buttons };
