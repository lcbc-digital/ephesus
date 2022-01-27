import React from 'react';
import { Linking } from 'react-native';
import { ActionBar, ActionBarItem } from '@apollosproject/ui-kit';
import { RockAuthedWebBrowser } from '@apollosproject/ui-connected';

const Toolbar = () => (
  <RockAuthedWebBrowser>
    {(openUrl) => (
      <ActionBar>
        <ActionBarItem
          onPress={() => openUrl('https://www.chaseoaks.org/groups')}
          icon="badge"
          label="Check In"
        />
        <ActionBarItem
          onPress={() => Linking.openURL('https://www.chaseoaks.org/givenow')}
          icon="give"
          label="Give"
        />

        <ActionBarItem
          onPress={() => openUrl('https://www.chaseoaks.org/serve')}
          icon="pray"
          label="Prayer"
        />
      </ActionBar>
    )}
  </RockAuthedWebBrowser>
);

export default Toolbar;
