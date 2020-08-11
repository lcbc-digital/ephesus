import { gql } from 'apollo-server';

import { createApolloServerConfig } from '@apollosproject/server-core';

import * as Analytics from '@apollosproject/data-connector-analytics';
import * as Scripture from '@apollosproject/data-connector-bible';
// import * as LiveStream from '@apollosproject/data-connector-church-online';
import * as Cloudinary from '@apollosproject/data-connector-cloudinary';
import * as OneSignal from '@apollosproject/data-connector-onesignal';
// import * as Search from '@apollosproject/data-connector-algolia-search';
import * as Pass from '@apollosproject/data-connector-passes';
import * as Cache from '@apollosproject/data-connector-redis-cache';
import * as Sms from '@apollosproject/data-connector-twilio';
import {
  // Followings,
  // Interactions,
  RockConstants,
  // Person,
  // ContentItem,
  // ContentChannel,
  Sharable,
  Auth,
  PersonalDevice,
  Template,
  // AuthSms,
  // Campus,
  Group,
  BinaryFiles,
  Event,
  PrayerRequest,
} from '@apollosproject/data-connector-rock';
import * as Search from './Algolia';
import * as Theme from './theme';

// This module is used to attach Rock User updating to the OneSignal module.
// This module includes a Resolver that overides a resolver defined in `OneSignal`
import * as OneSignalWithRock from './oneSignalWithRock';
import * as LiveStream from './ChurchOnline';
import { ContentChannel, ContentItem, Category, CraftCampus } from './craft';
import * as Feature from './Feature';
import * as Vimeo from './Vimeo';
import * as Wistia from './Wistia';
import * as Interactions from './Interaction';
import * as Person from './Person';
import * as Campus from './Campus';
import * as AuthSms from './AuthSms';

const data = {
  // Followings,
  ContentChannel,
  ContentItem,
  Category,
  Person,
  Cloudinary,
  Auth,
  AuthSms,
  Sms,
  LiveStream,
  Theme,
  Scripture,
  Interactions,
  RockConstants,
  Sharable,
  Analytics,
  OneSignal,
  PersonalDevice,
  OneSignalWithRock,
  Pass,
  Search,
  Template,
  Campus,
  Group,
  BinaryFiles,
  Feature,
  Event,
  Cache,
  PrayerRequest,
  Vimeo,
  Wistia,
  CraftCampus,
};

const {
  dataSources,
  resolvers,
  schema,
  context,
  applyServerMiddleware,
  setupJobs,
} = createApolloServerConfig(data);

export {
  dataSources,
  resolvers,
  schema,
  context,
  applyServerMiddleware,
  setupJobs,
};

// the upload Scalar is added
export const testSchema = [
  gql`
    scalar Upload
  `,
  ...schema,
];
