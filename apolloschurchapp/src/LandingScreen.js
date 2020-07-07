import React from 'react';
import { Image } from 'react-native';
import { styled, withTheme } from '@apollosproject/ui-kit';

import ApollosLandingScreen from './ui/LandingScreen';

const LandingScreen = withTheme(({ theme }) => ({
  textColor: theme.colors.text.primary,
}))(({ navigation, textColor }) => (
  <ApollosLandingScreen
    onPressPrimary={() => navigation.push('Auth')}
    textColor={textColor}
    // BackgroundComponent={
    //   <FullScreenImage source={require('./ui/LandingScreen/background.png')} />
    // }
    primaryNavText={"Let's go!"}
  />
));

LandingScreen.navigationOptions = {
  header: null,
};

export default LandingScreen;
