import React, { PureComponent } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import PropTypes from 'prop-types';
import { Query } from 'react-apollo';
import { get } from 'lodash';

// import { HorizontalLikedContentFeedConnected } from '@apollosproject/ui-connected';
import { BackgroundView } from '@apollosproject/ui-kit';

import ActionTable from './ActionTable';
import ActionBar from './ActionBar';
import UserAvatarHeader from './UserAvatarHeader';
import GET_USER_PROFILE from './UserAvatarHeader/getUserProfile';
import CurrentCampus from './CurrentCampus';

class Connect extends PureComponent {
  static navigationOptions = () => ({
    title: 'Connect',
    header: null,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }),
    screenProps: PropTypes.shape({
      headerBackgroundColor: PropTypes.string,
      headerTintColor: PropTypes.string,
      headerTitleStyle: PropTypes.shape({ color: PropTypes.string }),
    }),
  };

  render() {
    const { navigation, screenProps } = this.props;
    return (
      <BackgroundView>
        <SafeAreaView>
          <ScrollView>
            <UserAvatarHeader />
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
                    headerBackgroundColor={screenProps.headerBackgroundColor}
                    headerTintColor={screenProps.headerTintColor}
                    headerTitleColor={screenProps.headerTitleStyle.color}
                    itemId={userCampus.id}
                    navigation={navigation}
                    sectionTitle={'Your Campus'}
                  />
                ) : (
                  <CurrentCampus
                    cardButtonText={'Select a Campus'}
                    cardTitle={'No location'}
                    headerActionText={'Select a Campus'}
                    navigation={navigation}
                    sectionTitle={'Your Campus'}
                    headerBackgroundColor={screenProps.headerBackgroundColor}
                    headerTintColor={screenProps.headerTintColor}
                    headerTitleColor={screenProps.headerTitleStyle.color}
                  />
                );
              }}
            </Query>
            <ActionTable />
          </ScrollView>
        </SafeAreaView>
      </BackgroundView>
    );
  }
}

export default Connect;
