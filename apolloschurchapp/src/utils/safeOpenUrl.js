import { Linking } from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn';

async function safeHandleUrl(url, { external = false, browserFunc } = {}) {
  try {
    if (url.startsWith('http') && !external && !url.includes('#external')) {
      // safe enough to use InAppBrowser
      return browserFunc ? browserFunc(url) : InAppBrowser.open(url);
    }

    const canWeOpenUrl = await Linking.canOpenURL(url);

    if (canWeOpenUrl) return Linking.openURL(url);
  } catch (e) {
    console.warn(e);
  }
  return false;
}

export default safeHandleUrl;
