import React from 'react';
import { Image } from 'react-native';
import { styled } from '@apollosproject/ui-kit';

import ApollosLandingScreen from './ui/LandingScreen';

const FullScreenImage = styled({
  resizeMode: 'cover',
  position: 'absolute',
})(Image);

const LandingScreen = ({ navigation }) => (
  <ApollosLandingScreen
    onPressPrimary={() => navigation.push('Auth')}
    textColor={'white'}
    BackgroundComponent={
      <FullScreenImage source={require('./ui/LandingScreen/background.png')} />
    }
    primaryNavText={"Let's go!"}
  />
);

LandingScreen.navigationOptions = {
  header: null,
};

export default LandingScreen;
