import './loadConfig';
import { AppRegistry, YellowBox } from 'react-native';
import ApollosConfig from '@apollosproject/config';
import Bugsnag from '@bugsnag/react-native';
import Storybook from './storybook';

Bugsnag.start();
const useStorybook = ApollosConfig.STORYBOOK === 'true';

const MainApp = require('./src').default;

let App = MainApp;
if (useStorybook) {
  App = Storybook;
}

YellowBox.ignoreWarnings([
  'Warning: isMounted(...) is deprecated',
  'Module RCTImageLoader',
]);

AppRegistry.registerComponent('LCBCChurch', () => App);
