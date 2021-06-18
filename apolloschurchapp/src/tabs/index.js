import React, { useEffect } from 'react';
import { Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { withTheme, NavigationService } from '@apollosproject/ui-kit';
import { useApolloClient } from '@apollo/client';
import {
  createFeatureFeedTab,
  CampusTabComponent,
} from '@apollosproject/ui-connected';
import { checkOnboardingStatusAndNavigate } from '@apollosproject/ui-onboarding';
import { SearchButton } from '../ui/Search';
import { ONBOARDING_VERSION } from '../ui/Onboarding';
import Connect from './connect';
import tabBarIcon from './tabBarIcon';

const HeaderLogo = withTheme(({ theme }) => ({
  style: {
    height: theme.sizing.baseUnit * 2.5,
    width: '70%',
    resizeMode: 'contain',
  },
  source:
    theme.type === 'light'
      ? require('./wordmark.png')
      : require('./wordmark.png'),
}))(Image);

const HeaderCenter = () => <HeaderLogo source={require('./wordmark.png')} />;
const HeaderRight = () => {
  const navigation = useNavigation();
  return <SearchButton onPress={() => navigation.navigate('Search')} />;
};

// we nest stack inside of tabs so we can use all the fancy native header features
const HomeTab = createFeatureFeedTab({
  screenOptions: {
    headerHideShadow: true,
    headerCenter: HeaderCenter,
    headerRight: HeaderRight,
    headerLargeTitle: false,
    headerTopInsetEnabled: false,
  },
  tabName: 'Home',
  feedName: 'HOME',
  TabComponent: CampusTabComponent,
});

const ReadTab = createFeatureFeedTab({
  tabName: 'Discover',
  feedName: 'READ',
  headerTopInsetEnabled: false,
});

// const WatchTab = createFeatureFeedTab({
//   tabName: 'Watch',
//   feedName: 'WATCH',
// });
//
// const PrayTab = createFeatureFeedTab({
//   tabName: 'Pray',
//   feedName: 'PRAY',
// });

const { Navigator, Screen } = createBottomTabNavigator();

const TabNavigator = () => {
  const client = useApolloClient();
  // this is only used by the tab loaded first
  // if there is a new version of the onboarding flow,
  // we'll navigate there first to show new screens
  useEffect(
    () => {
      checkOnboardingStatusAndNavigate({
        client,
        navigation: NavigationService,
        latestOnboardingVersion: ONBOARDING_VERSION,
        navigateHome: false,
      });
    },
    [client]
  );
  return (
    <Navigator lazy>
      <Screen
        name="Home"
        component={HomeTab}
        options={{ tabBarIcon: tabBarIcon('home') }}
      />
      <Screen
        name="Discover"
        component={ReadTab}
        options={{ tabBarIcon: tabBarIcon('sections') }}
      />
      {/* <Screen */}
      {/*   name="Watch" */}
      {/*   component={WatchTab} */}
      {/*   options={{ tabBarIcon: tabBarIcon('video') }} */}
      {/* /> */}
      {/* <Screen */}
      {/*   name="Pray" */}
      {/*   component={PrayTab} */}
      {/*   options={{ tabBarIcon: tabBarIcon('like') }} */}
      {/* /> */}
      <Screen
        name="Connect"
        component={Connect}
        options={{ tabBarIcon: tabBarIcon('profile') }}
      />
    </Navigator>
  );
};

export default TabNavigator;
