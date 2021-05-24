import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Query } from 'react-apollo';
import { get } from 'lodash';

import {
  ConnectScreenConnected,
  GET_USER_PROFILE,
} from '@apollosproject/ui-connected';
import ActionTable from './ActionTable';
import ActionBar from './ActionBar';
import CurrentCampus from './CurrentCampus';

class Connect extends PureComponent {
  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func,
    }),
  };

  render() {
    return (
      <ConnectScreenConnected
        ActionTable={ActionTable}
        ActionBar={() => (
          <>
            <ActionBar />
            <Query query={GET_USER_PROFILE}>
              {({ data: campusData, loading: userCampusLoading }) => {
                const userCampus = get(
                  campusData,
                  'currentUser.profile.campus'
                );
                return userCampus ? (
                  <CurrentCampus
                    cardButtonText={'Campus Details'}
                    cardTitle={userCampus.name}
                    coverImage={userCampus.image}
                    headerActionText={'Change'}
                    // headerBackgroundColor={screenProps.headerBackgroundColor}
                    // headerTintColor={screenProps.headerTintColor}
                    // headerTitleColor={screenProps.headerTitleStyle.color}
                    itemId={userCampus.id}
                    // navigation={navigation}
                    sectionTitle={'Your Campus'}
                    isLoading={userCampusLoading}
                  />
                ) : (
                  <CurrentCampus
                    cardButtonText={'Select a Campus'}
                    cardTitle={'No location'}
                    headerActionText={'Select a Campus'}
                    // navigation={navigation}
                    sectionTitle={'Your Campus'}
                    // headerBackgroundColor={screenProps.headerBackgroundColor}
                    // headerTintColor={screenProps.headerTintColor}
                    // headerTitleColor={screenProps.headerTitleStyle.color}
                    isLoading={userCampusLoading}
                  />
                );
              }}
            </Query>
          </>
        )}
      />
    );
  }
}

export default Connect;
