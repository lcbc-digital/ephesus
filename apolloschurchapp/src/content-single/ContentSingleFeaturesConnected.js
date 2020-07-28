import React from 'react';
import { Image } from 'react-native';
import {
  ContentSingleFeaturesConnected,
  ContentSingleFeatures,
  TextFeature,
  ScriptureFeature,
  WebviewFeature,
} from '@apollosproject/ui-connected';
import { ConnectedImage } from '@apollosproject/ui-kit';

const ShareableImageFeature = ({ image }) =>
  console.warn(image) || (
    <ConnectedImage
      width={400}
      source={image.sources}
      style={{ backgroundColor: 'red' }}
    />
  );

const FEATURE_MAP = {
  TextFeature,
  ScriptureFeature,
  WebviewFeature,
  ShareableImageFeature,
};

const ContentSingleFeaturesWithExtras = (props) => (
  <ContentSingleFeatures {...props} featureMap={FEATURE_MAP} />
);

export default (props) => (
  <ContentSingleFeaturesConnected
    {...props}
    Component={ContentSingleFeaturesWithExtras}
  />
);
