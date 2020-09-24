import React from 'react';
import { View, Platform } from 'react-native';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import {
  ConnectedImage,
  ImageSourceType,
  Touchable,
  PaddedView,
  ButtonLink,
} from '@apollosproject/ui-kit';

export const shareImage = async ({ url }) => {
  try {
    let imagePath = null;
    const resp = await RNFetchBlob.config({
      fileCache: true,
    }).fetch('GET', url);

    imagePath = resp.path();
    // console.log(imagePath);
    const base64Data = await resp.readFile('base64');
    // console.log(base64Data);
    const base64DataUrl = `data:image/png;base64,${base64Data}`;
    // here's base64 encoded image
    await Share.open({ url: base64DataUrl, title: 'Wallpaper' });
    // remove the file from storage
    if (Platform.OS !== 'android') {
      RNFetchBlob.fs.unlink(imagePath);
    }
  } catch (e) {
    console.warn(e);
  }
};

const ShareableImageFeature = ({ image }) => (
  <PaddedView>
    <Touchable onPress={() => shareImage({ url: image.sources[0].uri })}>
      <View>
        <ConnectedImage source={image.sources} maintainAspectRatio />
        <PaddedView horizontal={false}>
          <ButtonLink>{'Download'}</ButtonLink>
        </PaddedView>
      </View>
    </Touchable>
  </PaddedView>
);

ShareableImageFeature.propTypes = {
  image: ImageSourceType,
};

export default ShareableImageFeature;
