import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import { styled, H1 } from '@apollosproject/ui-kit';
import { Slide } from '@apollosproject/ui-onboarding';
import { Wrapper, Underline, Intro } from './Components';

const WelcomeWrapper = styled(() => ({ flexDirection: 'row' }))(View);

const Features = memo(
  ({ firstName, description, BackgroundComponent, ...props }) => (
    <Slide {...props} alwaysBounceVertical={false}>
      {BackgroundComponent}
      <Wrapper>
        <WelcomeWrapper>
          <H1>{`Hi `}</H1>
          <View>
            <Underline />
            <H1>{`${firstName || 'friend'}!`}</H1>
          </View>
        </WelcomeWrapper>
        <Intro>
          {'Let us know how to keep you connected with LCBC each week.'}
        </Intro>
      </Wrapper>
    </Slide>
  )
);

Features.displayName = 'Features';

Features.propTypes = {
  /* The `Swiper` component used in `<onBoarding>` looks for and hijacks the title prop of it's
   * children. Thus we have to use more unique name.
   */
  firstName: PropTypes.string,
  description: PropTypes.string,
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

Features.defaultProps = {
  description:
    "We'd like to help personalize your mobile experience so we can help you with every step on your journey.",
};

export default Features;
