import React from 'react';

import { View, Image } from 'react-native';
import { Query } from '@apollo/client/react/components';
import PropTypes from 'prop-types';
import { requestPermissions } from '@apollosproject/ui-notifications';
import {
  styled,
  BackgroundView,
  NavigationService,
} from '@apollosproject/ui-kit';

import {
  AskNotificationsConnected,
  FeaturesConnected,
  LocationFinderConnected,
  OnboardingSwiper,
  onboardingComplete,
  WITH_USER_ID,
} from '@apollosproject/ui-onboarding';

import WelcomeSlide from './WelcomeSlide';
import AskLocation from './AskLocation';
import AskNotifications from './AskNotifications';

const FullscreenBackgroundView = styled({
  position: 'absolute',
  width: '100%',
  height: '100%',
})(BackgroundView);

// Represents the current version of onboarding.
// Some slides will be "older", they shouldn't be shown to existing users.
// Some slides will be the same version as teh current onboarding version.
// Those slides will be shown to any user with an older version than the version of those slides.
export const ONBOARDING_VERSION = 1;

function Onboarding({ navigation, route }) {
  const userVersion = route?.params?.userVersion || 0;
  return (
    <Query query={WITH_USER_ID} fetchPolicy="network-only">
      {({ data }) => (
        <>
          <FullscreenBackgroundView />
          <OnboardingSwiper
            navigation={navigation}
            userVersion={userVersion}
            onComplete={() => {
              onboardingComplete({
                userId: data?.currentUser?.id,
                version: ONBOARDING_VERSION,
              });
              navigation.dispatch(
                NavigationService.resetAction({
                  navigatorName: 'Tabs',
                  routeName: 'Home',
                })
              );
            }}
          >
            {({ swipeForward }) => (
              <>
                <FeaturesConnected
                  onPressPrimary={swipeForward}
                  Component={WelcomeSlide}
                />
                <LocationFinderConnected
                  onPressPrimary={swipeForward}
                  Component={AskLocation}
                  onNavigate={() => {
                    navigation.navigate('Location');
                  }}
                />
                <AskNotificationsConnected
                  Component={AskNotifications}
                  onPressPrimary={swipeForward}
                  onRequestPushPermissions={requestPermissions}
                  primaryNavText={'Finish'}
                />
              </>
            )}
          </OnboardingSwiper>
        </>
      )}
    </Query>
  );
}

Onboarding.propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      userVersion: PropTypes.number,
    }),
  }),
};

export default Onboarding;
