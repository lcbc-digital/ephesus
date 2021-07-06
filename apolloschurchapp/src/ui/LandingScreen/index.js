import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import {
  styled,
  withTheme,
  Icon,
  H1,
  H5,
  PaddedView,
  BackgroundView,
} from '@apollosproject/ui-kit';

import { Slide } from '@apollosproject/ui-onboarding';
import { Underline, UnderlinedWord } from '../Onboarding/Components';

const Content = styled({
  flex: 1,
  justifyContent: 'center',
})(PaddedView);

const BrandIcon = withTheme(({ theme }) => ({
  name: 'brand-icon',
  size: theme.sizing.baseUnit * 7,
  fill: theme.colors.primary,
  style: {
    marginBottom: theme.sizing.baseUnit,
  },
}))(Icon);

const TitleWrapper = styled({ flexDirection: 'row', flexWrap: 'wrap' })(View);

const LandingScreen = ({
  slideTitle,
  description,
  textColor,
  BackgroundComponent,
  ...props
}) =>
  // eslint-disable-next-line no-console
  console.warn(props) || (
    <BackgroundView>
      <Slide {...props} scrollEnabled={false}>
        {BackgroundComponent}
        <Content>
          <BrandIcon />
          <TitleWrapper>
            <H1>{'We are '}</H1>
            <UnderlinedWord>
              <Underline />
              <H1>{`Lives`}</H1>
            </UnderlinedWord>
            <H1>{` `}</H1>
            <UnderlinedWord>
              <Underline />
              <H1>{`Changed`}</H1>
            </UnderlinedWord>
            <H1>{` `}</H1>
            <UnderlinedWord>
              <Underline />
              <H1>{`By`}</H1>
            </UnderlinedWord>
            <H1>{` `}</H1>
            <UnderlinedWord>
              <Underline />
              <H1>{`Christ`}</H1>
            </UnderlinedWord>
          </TitleWrapper>
          <PaddedView horizontal={false}>
            <H5>
              {`Welcome to LCBC—we’re so glad you're here! No matter who you are, what you believe, or
what experiences you've had with church,
you're welcome.`}
            </H5>
          </PaddedView>
        </Content>
      </Slide>
    </BackgroundView>
  );

LandingScreen.propTypes = {
  /* The `Swiper` component used in `<onBoarding>` looks for and hijacks the title prop of it's
   * children. Thus we have to use more unique name.
   */
  slideTitle: PropTypes.string,
  description: PropTypes.string,
  textColor: PropTypes.string, // Use for custom text and `BrandIcon` color when overlaying text on an image or video needs more clarity. Defaults to theme driven colors.
  /* Recommended usage:
   * - `Image` (react-native)
   * - `GradientOverlayImage` (@apollosproject/ui-kit) for increased readability
   * - `Video` (react-native-video) because moving pictures!
   */
  BackgroundComponent: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

LandingScreen.defaultProps = {
  slideTitle: "We're glad you're here.",
  description:
    "We're not just a building you go to, but a family to belong to.",
};

LandingScreen.navigationOptions = {
  header: null,
};

export default LandingScreen;
