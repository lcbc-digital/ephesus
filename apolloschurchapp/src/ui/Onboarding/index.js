import React from 'react';
import { Image } from 'react-native';
import { Query } from 'react-apollo';
import {
  checkNotifications,
  openSettings,
  requestNotifications,
  RESULTS,
} from 'react-native-permissions';
import { styled, NavigationService } from '@apollosproject/ui-kit';
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
})((props) => <Image {...props} src={'./background.png'} />);

function Onboarding({ navigation }) {
  return (
    <>
      <FullscreenBackgroundView />
      <OnboardingSwiper>
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
            <Query query={WITH_USER_ID} fetchPolicy="network-only">
              {({
                data: { currentUser: { id } = { currentUser: { id: null } } },
              }) => (
                <AskNotificationsConnected
                  Component={AskNotifications}
                  onPressPrimary={() => {
                    onboardingComplete({ userId: id });
                    navigation.dispatch(
                      NavigationService.resetAction({
                        navigatorName: 'Tabs',
                        routeName: 'Home',
                      })
                    );
                  }}
                  onRequestPushPermissions={(update) => {
                    checkNotifications().then((checkRes) => {
                      if (checkRes.status === RESULTS.DENIED) {
                        requestNotifications(['alert', 'badge', 'sound']).then(
                          () => {
                            update();
                          }
                        );
                      } else {
                        openSettings();
                      }
                    });
                  }}
                  primaryNavText={'Finish'}
                />
              )}
            </Query>
          </>
        )}
      </OnboardingSwiper>
    </>
  );
}

Onboarding.navigationOptions = {
  title: 'Onboarding',
  header: null,
  gesturesEnabled: false,
};

export default Onboarding;
