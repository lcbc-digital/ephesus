import { Linking } from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';

async function safeHandleUrl(url, { external = false } = {}) {
  try {
    if (url.startsWith('http') && !external && !url.includes('#external')) {
      // safe enough to use InAppBrowser
      return InAppBrowser.open(url);
    }

    const canWeOpenUrl = await Linking.canOpenURL(url);

    if (canWeOpenUrl) return Linking.openURL(url);
  } catch (e) {
    console.warn(e);
  }
  return false;
}

export default safeHandleUrl;
