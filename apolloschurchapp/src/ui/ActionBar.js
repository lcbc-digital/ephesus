import React from 'react';
import { Linking } from 'react-native';
import { ActionBar, ActionBarItem } from '@apollosproject/ui-kit';
import { RockAuthedWebBrowser } from '@apollosproject/ui-connected';

const Toolbar = () => (
  <RockAuthedWebBrowser>
    {(openUrl) => (
      <ActionBar>
        <ActionBarItem
          onPress={() => openUrl('https://app.lcbcchurch.com/AppCheckin')}
          icon="badge"
          label="Check In"
        />
        <ActionBarItem
          onPress={() =>
            Linking.openURL('https://pushpay.com/g/lcbcchurch?src=app')
          }
          icon="give"
          label="Give"
        />

        <ActionBarItem
          onPress={() => openUrl('https://my.lcbcchurch.com/prayer')}
          icon="pray"
          label="Prayer"
        />
      </ActionBar>
    )}
  </RockAuthedWebBrowser>
);

export default Toolbar;
