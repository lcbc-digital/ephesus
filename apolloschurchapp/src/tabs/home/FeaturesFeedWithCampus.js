import React from 'react';
import gql from 'graphql-tag';
import { get } from 'lodash';
import { Query } from 'react-apollo';
import ApollosConfig from '@apollosproject/config';
import { FeedView } from '@apollosproject/ui-kit';
import { FeaturesFeedConnected } from '@apollosproject/ui-connected';
import GET_USER_PROFILE from '../connect/UserAvatarHeader/getUserProfile';

const GET_FEED_FEATURES = gql`
  query getFeedFeatures($campusId: ID) {
    userFeedFeaturesWithCampus(campusId: $campusId) {
      ...FeedFeaturesFragment
    }
  }
  ${ApollosConfig.FRAGMENTS.FEED_FEATURES_FRAGMENT}
`;

class FeaturesFeedWithCampus extends FeaturesFeedConnected {
  render() {
    const { Component, onPressActionItem, ...props } = this.props;
    return (
      <Query query={GET_USER_PROFILE}>
        {({ data: campusData, loading: userCampusLoading }) => {
          const campusId = get(campusData, 'currentUser.profile.campus.id');
          return (
            <Query
              query={GET_FEED_FEATURES}
              fetchPolicy="cache-and-network"
              variables={{ campusId }}
            >
              {({ error, data, loading, refetch }) => {
                const features = get(data, 'userFeedFeaturesWithCampus', []);
                this.refetchRef({ refetch, id: 'feed' });
                return (
                  <FeedView
                    error={error}
                    content={features}
                    loadingStateData={this.loadingStateData}
                    renderItem={this.renderFeatures}
                    loading={loading || userCampusLoading}
                    refetch={this.refetch}
                    numColumns={1}
                    {...props}
                  />
                );
              }}
            </Query>
          );
        }}
      </Query>
    );
  }
}
export default FeaturesFeedWithCampus;
