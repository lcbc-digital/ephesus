import React from 'react';
import { ActionBar, ActionBarItem } from '@apollosproject/ui-kit';
import { withNavigation } from 'react-navigation';
import PropTypes from 'prop-types';
import { RockAuthedWebBrowser } from '@apollosproject/ui-connected';

const Toolbar = ({ navigation }) => (
  <RockAuthedWebBrowser>
    {(openUrl) => (
      <ActionBar>
        <ActionBarItem
          onPress={() => openUrl('https://app.lcbcchurch.com/AppCheckin/')}
          icon="check"
          label="Check-In"
        />
        <ActionBarItem
          onPress={() =>
            openUrl('https://pushpay.com/g/lcbcchurch?src=app#external', {
              externalBrowser: true,
            })
          }
          icon="download"
          label="Give"
        />
        <ActionBarItem
          onPress={() => openUrl('https://my.lcbcchurch.com/Prayer')}
          icon="information"
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

export default withNavigation(Toolbar);
