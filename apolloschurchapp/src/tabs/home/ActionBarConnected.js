import React from 'react';
import {
  ActionBar,
  ActionBarItem,
  H4,
  styled,
  PaddedView,
} from '@apollosproject/ui-kit';
import { withNavigation } from 'react-navigation';
import PropTypes from 'prop-types';
import { RockAuthedWebBrowser } from '@apollosproject/ui-connected';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

const ActionBarHeader = styled({
  flexDirection: 'row',
  justifyContent: 'center',
})(PaddedView);

const ActionsBar = ({ navigation, actions, title }) => (
  <RockAuthedWebBrowser>
    {(openUrl) => (
      <>
        {title && (
          <ActionBarHeader vertical={false}>
            <H4>{title}</H4>
          </ActionBarHeader>
        )}
        <ActionBar>
          {actions.map(({ icon, label, url }) => (
            <ActionBarItem
              key={url}
              onPress={() => openUrl(url)}
              // icon={icon}
              label={label}
            />
          ))}
        </ActionBar>
      </>
    )}
  </RockAuthedWebBrowser>
);

ActionsBar.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
  title: PropTypes,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string,
      label: PropTypes.string,
      icon: PropTypes.string,
    })
  ),
};

const ActionBarWithNavigation = withNavigation(ActionsBar);

const GET_ACTION_BAR_FEATURE = gql`
  query getVerticalCardListFeature($featureId: ID!) {
    node(id: $featureId) {
      ... on ActionBarFeature {
        id
        title
        actions {
          id
          url
          label
          icon
        }
      }
    }
  }
`;

const ActionBarConnected = ({ featureId, refetchRef }) =>
  console.warn(featureId) || (
    <Query
      query={GET_ACTION_BAR_FEATURE}
      variables={{ featureId }}
      fetchPolicy="cache-and-network"
    >
      {({ data, refetch }) => {
        if (featureId && refetch && refetchRef)
          refetchRef({ refetch, id: featureId });
        const node = data.node || {};
        return (
          <ActionBarWithNavigation
            actions={node.actions || []}
            title={node.title}
          />
        );
      }}
    </Query>
  );

ActionBarConnected.propTypes = {
  refetchRef: PropTypes.func,
  featureId: PropTypes.string,
};

export default ActionBarConnected;
