import React from 'react';
import { Image } from 'react-native';
import { styled, withTheme } from '@apollosproject/ui-kit';

import ApollosLandingScreen from './ui/LandingScreen';

// BackgroundComponent={
//   <FullScreenImage source={require('./ui/LandingScreen/background.png')} />
// }

const LandingScreen = withTheme(({ theme }) => ({
  textColor: theme.colors.text.primary,
}))(({ navigation, textColor }) => (
  <ApollosLandingScreen
    onPressPrimary={() => navigation.push('Auth')}
    textColor={textColor}
    primaryNavText={"Let's go!"}
  />
));

LandingScreen.navigationOptions = {
  header: null,
};

export default LandingScreen;
