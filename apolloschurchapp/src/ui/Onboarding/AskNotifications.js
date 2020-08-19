import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { styled, PaddedView, Button, H1 } from '@apollosproject/ui-kit';

import { Slide } from '@apollosproject/ui-onboarding';
import { Wrapper, Underline, Intro, UnderlinedWord } from './Components';

const TitleWrapper = styled({ flexDirection: 'row', flexWrap: 'wrap' })(View);
const TitleContainer = styled({ flex: 1 })(View);

// memo = sfc PureComponent 💥
// eslint-disable-next-line react/display-name
const AskNotifications = memo(
  ({
    BackgroundComponent,
    slideTitle,
    description,
    buttonText,
    buttonDisabled,
    onPressButton,
    isLoading,
    ...props
  }) => (
    <Slide {...props} alwaysBounceVertical={false}>
      {BackgroundComponent}
      <Wrapper>
        <TitleContainer>
          <TitleWrapper>
            <H1>{`Stay `}</H1>
            <UnderlinedWord>
              <Underline />
              <H1>{`up-to-date`}</H1>
            </UnderlinedWord>
          </TitleWrapper>
          <Intro>
            {
              'Never miss an update—turn on notifications to stay in the loop with what’s going on around our church.'
            }
          </Intro>
        </TitleContainer>
        {buttonDisabled || onPressButton ? (
          <PaddedView horizontal={false}>
            <Button
              title={buttonText}
              onPress={onPressButton}
              disabled={buttonDisabled || isLoading}
              pill={false}
            />
          </PaddedView>
        ) : null}
      </Wrapper>
    </Slide>
  )
);

AskNotifications.displayName = 'AskNotifications';

AskNotifications.propTypes = {
  BackgroundComponent: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  /* The `Swiper` component used in `<onBoarding>` looks for and hijacks the title prop of it's
   * children. Thus we have to use a more unique name.
   */
  slideTitle: PropTypes.string,
  description: PropTypes.string,
  buttonText: PropTypes.string,
  buttonDisabled: PropTypes.bool,
  onPressButton: PropTypes.func,
  isLoading: PropTypes.bool,
};

AskNotifications.defaultProps = {
  slideTitle: 'Can we keep you informed?',
  description:
    "We'll let you know when important things are happening and keep you in the loop",
  buttonText: 'Yes, enable notifications',
  buttonDisabled: false,
};

export default AskNotifications;
