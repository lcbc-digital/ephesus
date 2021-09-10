import React from 'react';
import { ActionBar, ActionBarItem } from '@apollosproject/ui-kit';
import PropTypes from 'prop-types';
import { RockAuthedWebBrowser } from '@apollosproject/ui-connected';

const Toolbar = () => (
  <RockAuthedWebBrowser>
    {(openUrl) => (
      <ActionBar>
        <ActionBarItem
          onPress={() =>
            openUrl(
              'https://app.lcbcchurch.com/AppCheckin/',
              {},
              { useRockToken: true }
            )
          }
          icon="check-in"
          label="Check-In"
        />
        <ActionBarItem
          onPress={() =>
            openUrl('https://pushpay.com/g/lcbcchurch?src=app#external', {
              externalBrowser: true,
            })
          }
          icon="give"
          label="Give"
        />
        <ActionBarItem
          onPress={() =>
            openUrl(
              'https://app.lcbcchurch.com/prayer-request',
              {},
              { useRockToken: true }
            )
          }
          icon="pray"
          label="Prayer"
        />
      </ActionBar>
    )}
  </RockAuthedWebBrowser>
);

Toolbar.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default Toolbar;
