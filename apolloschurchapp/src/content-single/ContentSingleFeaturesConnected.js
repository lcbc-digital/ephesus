import React from 'react';
import {
  ContentSingleFeaturesConnected,
  ContentSingleFeatures,
  TextFeature,
  ScriptureFeature,
  WebviewFeature,
} from '@apollosproject/ui-connected';
import ShareableImageFeature from './ShareableImageFeature';

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
