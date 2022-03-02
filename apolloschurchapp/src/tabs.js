import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Image, View } from 'react-native';
import { useApolloClient } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  NavigationService,
  useTheme,
  Icon,
  Touchable,
} from '@apollosproject/ui-kit';
import {
  createFeatureFeedTab,
  UserAvatarConnected,
  ConnectScreenConnected,
  CampusTabComponent,
  FeatureFeedTabConnected,
} from '@apollosproject/ui-connected';
import { checkOnboardingStatusAndNavigate } from '@apollosproject/ui-onboarding';
import CampusCard from './ui/CampusCard';
import ActionBar from './ui/ActionBar';

const HeaderLogo = () => {
  const theme = useTheme();
  return (
    <Icon
      name="brand-icon"
      size={theme.sizing.baseUnit * 3}
      fill={theme.colors.primary}
    />
  );
};

const ProfileButton = () => {
  const navigation = useNavigation();
  return (
    <Touchable
      onPress={() => {
        navigation.navigate('UserSettingsNavigator');
      }}
    >
      <View>
        <UserAvatarConnected size="xsmall" />
      </View>
    </Touchable>
  );
};

const SearchButton = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  return (
    <Touchable
      onPress={() => {
        navigation.navigate('Search');
      }}
    >
      <View>
        <Icon
          name="search"
          size={theme.sizing.baseUnit * 1.5}
          fill={theme.colors.primary}
        />
      </View>
    </Touchable>
  );
};

const tabBarIcon = (name) => {
  function TabBarIcon({ color }) {
    return <Icon name={name} fill={color} size={24} />;
  }
  TabBarIcon.propTypes = {
    color: PropTypes.string,
  };
  return TabBarIcon;
};

// we nest stack inside of tabs so we can use all the fancy native header features
const HomeTab = createFeatureFeedTab({
  screenOptions: {
    headerHideShadow: true,
    headerCenter: HeaderLogo,
    headerRight: SearchButton,
    headerLeft: ProfileButton,
    headerLargeTitle: false,
    headerTopInsetEnabled: false,
  },
  tabName: 'Home',
  feedName: 'HOME',
  TabComponent: CampusTabComponent,
});

const ReadTab = createFeatureFeedTab({
  options: { headerLeft: ProfileButton },
  tabName: 'Discover',
  feedName: 'READ',
  headerTopInsetEnabled: false,
});

const ConnectTabComponent = ({ feedName, ...props }) => (
  <>
    <CampusCard />
    <ActionBar />
    <FeatureFeedTabConnected tab={feedName} {...props} />
  </>
);

const ConnectTab = createFeatureFeedTab({
  options: {
    headerLeft: ProfileButton,
  },
  tabName: 'Connect',
  feedName: 'CONNECT',
  TabComponent: ConnectTabComponent,
});

const { Navigator, Screen } = createBottomTabNavigator();

const TabNavigator = () => {
  const client = useApolloClient();
  // this is only used by the tab loaded first
  // if there is a new version of the onboarding flow,
  // we'll navigate there first to show new screens
  useEffect(() => {
    checkOnboardingStatusAndNavigate({
      client,
      navigation: NavigationService,
      navigateHome: false,
    });
  }, [client]);
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
      <Screen
        name="Connect"
        component={ConnectTab}
        options={{ tabBarIcon: tabBarIcon('profile') }}
      />
    </Navigator>
  );
};

export default TabNavigator;
