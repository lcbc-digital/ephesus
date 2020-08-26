import React from 'react';
import { Share } from 'react-native';
import RNFetchBlob, { fs } from 'rn-fetch-blob';
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
    const base64Data = await resp.readFile('base64');
    const base64DataUrl = `data:image/png;base64,${base64Data}`;
    // here's base64 encoded image
    await Share.share({ url: base64DataUrl });
    // remove the file from storage
    fs.unlink(imagePath);
  } catch (e) {
    console.warn(e);
  }
};

const ShareableImageFeature = ({ image }) => (
  <PaddedView>
    <Touchable onPress={() => shareImage({ url: image.sources[0].uri })}>
      <ConnectedImage source={image.sources} maintainAspectRatio />
      <PaddedView horizontal={false}>
        <ButtonLink>{'Download'}</ButtonLink>
      </PaddedView>
    </Touchable>
  </PaddedView>
);

ShareableImageFeature.propTypes = {
  image: ImageSourceType,
};

export default ShareableImageFeature;
