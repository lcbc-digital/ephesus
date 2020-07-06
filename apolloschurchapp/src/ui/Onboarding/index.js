import React from 'react';
import { Image } from 'react-native';
import {
  checkNotifications,
  openSettings,
  requestNotifications,
  RESULTS,
} from 'react-native-permissions';
import {
  GradientOverlayImage,
  styled,
  NavigationService,
} from '@apollosproject/ui-kit';
import {
  AskNotificationsConnected,
  AskNameConnected,
  FeaturesConnected,
  AboutYouConnected,
  LocationFinderConnected,
  OnboardingSwiper,
} from '@apollosproject/ui-onboarding';

const FullscreenBackgroundView = styled({
  position: 'absolute',
  width: '100%',
  height: '100%',
})((props) => <Image {...props} src={'./background.png'} />);

const StyledGradient = styled({
  maxHeight: '40%',
})(GradientOverlayImage);

function Onboarding({ navigation }) {
  return (
    <>
      <FullscreenBackgroundView />
      <OnboardingSwiper>
        {({ swipeForward }) => (
          <>
            <AskNameConnected onPressPrimary={swipeForward} />
            <FeaturesConnected
              onPressPrimary={swipeForward}
            />
            <AboutYouConnected
              onPressPrimary={swipeForward}
            />
            <LocationFinderConnected
              onPressPrimary={swipeForward}
              onNavigate={() => {
                navigation.navigate('Location');
              }}
              
            />
            <AskNotificationsConnected
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
              onPressPrimary={() =>
                navigation.dispatch(
                  NavigationService.resetAction({
                    navigatorName: 'Tabs',
                    routeName: 'Home',
                  })
                )
              }
              primaryNavText={'Finish'}
              BackgroundComponent={
                <StyledGradient
                  source={'https://picsum.photos/640/640/?random'}
                />
              }
            />
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
