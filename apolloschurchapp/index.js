import './loadConfig';
import { AppRegistry } from 'react-native';
import Bugsnag from '@bugsnag/react-native';

Bugsnag.start();

const App = require('./src').default;

AppRegistry.registerComponent('LCBCChurch', () => App);
