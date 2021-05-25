import React from 'react';
import { Animated, Platform, Linking } from 'react-native';
import { Query } from '@apollo/client/react/components';
import {
  styled,
  GradientOverlayImage,
  PaddedView,
  H1,
  BackgroundView,
  StretchyView,
  withTheme,
  ModalView,
  TableView,
  Cell,
  CellText,
  CellIcon,
  Divider,
  ButtonLink,
  Touchable,
  FlexedView,
  ThemeMixin,
} from '@apollosproject/ui-kit';

import HTMLView from '@apollosproject/ui-htmlview';

import GET_ABOUT_CAMPUS from './getAboutCampus';

const FlexedScrollView = styled({ flex: 1 })(Animated.ScrollView);

const ThemedCellIcon = withTheme(({ theme }) => ({
  fill: theme.colors.darkTertiary,
}))(CellIcon);

const Header = styled(({ theme }) => ({
  backgroundColor: theme.colors.primary,
  paddingVertical: 0,
}))(PaddedView);

const HeaderImage = withTheme(({ theme }) => ({
  overlayType: 'featured',
  overlayColor: theme.colors.primary,
  style: { width: '100%' },
  imageStyle: { width: '100%' },
}))(GradientOverlayImage);

const openMaps = ({ street1, street2, city, state, postalCode }) => {
  if (Platform.OS === 'ios') {
    Linking.openURL(
      `http://maps.apple.com/?daddr=${encodeURIComponent(
        [street1, street2, city, state, postalCode].join(', ')
      )}`
    );
  } else {
    Linking.openURL(
      `http://maps.google.com/maps?daddr=${encodeURIComponent(
        [street1, street2, city, state, postalCode].join(', ')
      )}`
    );
  }
};

const AboutCampus = ({ route, navigation }) => {
  const itemId = route.params.itemId
  return (
    <ModalView navigation={navigation} onClose={() => navigation.goBack()}>
      <BackgroundView>
        <Query
          query={GET_ABOUT_CAMPUS}
          variables={{ itemId }}
          fetchPolicy="cache-and-network"
        >
          {({
            data: {
              node: {
                name,
                description,
                image,
                leader = {},
                serviceTimes = '',
                contactEmail = '',
                street1 = '',
                street2 = '',
                city = '',
                state = '',
                postalCode = '',
              } = {},
            } = {},
          }) => (
            <StretchyView>
              {({ Stretchy, ...scrollViewProps }) => (
                <FlexedScrollView {...scrollViewProps}>
                  {image ? (
                    <Stretchy>
                      <HeaderImage source={image} maintainAspectRatio />
                    </Stretchy>
                  ) : null}
                  <FlexedView>
                    <Header>
                      <ThemeMixin
                        mixin={{
                          type: 'dark',
                        }}
                      >
                        <H1>{name}</H1>
                        <HTMLView>{description}</HTMLView>
                      </ThemeMixin>
                    </Header>
                    <TableView>
                      {serviceTimes ? (
                        <>
                          <Cell>
                            <ThemedCellIcon name="time" />
                            <CellText>{serviceTimes}</CellText>
                          </Cell>
                          <Divider />
                        </>
                      ) : null}

                      {street1 ? (
                        <>
                          <Touchable
                            onPress={() =>
                              openMaps({
                                street1,
                                street2,
                                city,
                                state,
                                postalCode,
                              })
                            }
                          >
                            <Cell>
                              <ThemedCellIcon name="pin" />
                              <CellText>
                                {`${street1}\n${
                                  street2 ? `${street2}\n` : ''
                                }${city}, ${state} ${postalCode}\n`}
                                <ButtonLink>Directions</ButtonLink>
                              </CellText>
                              <CellIcon name="arrow-next" />
                            </Cell>
                          </Touchable>
                          <Divider />
                        </>
                      ) : null}

                      {leader?.firstName ? (
                        <>
                          <Touchable
                            onPress={() => {
                              const emailUrl = `mailto:${contactEmail}`;
                              Linking.openURL(emailUrl);
                            }}
                          >
                            <Cell>
                              <ThemedCellIcon name="profile" />
                              <CellText>
                                {leader?.firstName} {leader?.lastName}
                                {'\n'}
                                <ButtonLink>Send email</ButtonLink>
                              </CellText>
                              <CellIcon name="arrow-next" />
                            </Cell>
                          </Touchable>
                          <Divider />
                        </>
                      ) : null}
                    </TableView>
                    {/* <ChildContentFeed contentId={id} /> */}
                  </FlexedView>
                </FlexedScrollView>
              )}
            </StretchyView>
          )}
        </Query>
      </BackgroundView>
    </ModalView>
  );
};

AboutCampus.navigationOptions = {
  header: null,
};

export default AboutCampus;
