import React from 'react';
import ApollosConfig from '@apollosproject/config';
import { NavigationService } from '@apollosproject/ui-kit';
import { AuthProvider } from '@apollosproject/ui-auth';
import { AnalyticsProvider } from '@apollosproject/ui-analytics';
import { NotificationsProvider } from '@apollosproject/ui-notifications';
import {
  LiveProvider,
  ACCEPT_FOLLOW_REQUEST,
} from '@apollosproject/ui-connected';
import { checkOnboardingStatusAndNavigate } from '@apollosproject/ui-onboarding';
import { track, identify } from './amplitude';

import ClientProvider, { client } from './client';

const AppProviders = (props) => (
  <ClientProvider {...props}>
    <NotificationsProvider
      oneSignalKey={ApollosConfig.ONE_SIGNAL_KEY}
      // TODO deprecated prop
      navigate={NavigationService.navigate}
      handleExternalLink={(url) => {
        const path = url.split('app-link/')[1];
        const [route, location] = path.split('/');

        // Handles the deep links currently generated.
        // Can eventually be turned off.
        if (path.startsWith('ContentSingle')) {
          const itemId = path.split('itemId=')[1];
          NavigationService.navigate('ContentSingle', { itemId });
        }
        if (route === 'content')
          NavigationService.navigate('ContentSingle', { itemId: location });
        if (route === 'nav')
          NavigationService.navigate(
            // turns "home" into "Home"
            location[0].toUpperCase() + location.substring(1)
          );
      }}
      actionMap={{
        // accept a follow request when someone taps "accept" in a follow request push notification
        acceptFollowRequest: ({ requestPersonId }) =>
          client.mutate({
            mutation: ACCEPT_FOLLOW_REQUEST,
            variables: { personId: requestPersonId },
          }),
      }}
    >
      <AuthProvider
        navigateToAuth={() => NavigationService.navigate('Auth')}
        navigate={NavigationService.navigate}
        closeAuth={() =>
          checkOnboardingStatusAndNavigate({
            client,
            navigation: NavigationService,
          })
        }
      >
        <AnalyticsProvider
          trackFunctions={[track]}
          identifyFunctions={[identify]}
          useServerAnalytics={false}
        >
          <LiveProvider>
            <LiveProvider>{props.children}</LiveProvider>
          </LiveProvider>
        </AnalyticsProvider>
      </AuthProvider>
    </NotificationsProvider>
  </ClientProvider>
);

export default AppProviders;
