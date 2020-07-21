import React from 'react';
import { Animated, View, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import { Query } from 'react-apollo';
import Color from 'color';
import {
  styled,
  GradientOverlayImage,
  PaddedView,
  H1,
  H2,
  H4,
  H6,
  BackgroundView,
  StretchyView,
  withTheme,
  BodyText,
  ModalView,
  TableView,
  Cell,
  CellText,
  CellIcon,
  Divider,
  CellContent,
  ButtonLink,
  Touchable,
  FlexedView,
  Icon,
  ThemeMixin,
} from '@apollosproject/ui-kit';

import HTMLView from '@apollosproject/ui-htmlview';
import HTMLCell from './HTMLCell';
// import BackgroundTextureAngled from '../ui/BackgroundTextureAngled';
// import ChildContentFeed from './ChildContent';

import GET_ABOUT_CAMPUS from './getAboutCampus';

const FlexedScrollView = styled({ flex: 1 })(Animated.ScrollView);

const Content = styled(({ theme }) => ({
  marginTop: theme.sizing.baseUnit * 4,
}))(View);

const Header = styled(({ theme }) => ({
  width: '80%',
  minHeight: theme.sizing.baseUnit * 16,
  justifyContent: 'flex-end',
}))(View);

const ThemedCellIcon = withTheme(({ theme }) => ({
  fill: theme.colors.darkTertiary,
}))(CellIcon);

const StyledH6 = styled(({ theme: { colors, sizing } }) => ({
  color: colors.lightPrimary,
  fontSize: sizing.baseUnit * 0.875,
  marginBottom: sizing.baseUnit,
}))(H6);

const StyledH1 = styled(({ theme: { colors } }) => ({
  // color: colors.lightPrimary,
}))(H1);

const stretchyStyle = {
  aspectRatio: 1,
  left: 0,
  position: 'absolute',
  top: 0,
  width: '100%',
};

const HeaderImage = withTheme(({ theme }) => ({
  overlayType: 'featured',
  overlayColor: Color(theme.colors.darkPrimary)
    .alpha(theme.alpha.high)
    .string(),
  style: stretchyStyle,
  imageStyle: stretchyStyle,
}))(GradientOverlayImage);

const ServiceTimes = styled(({ theme }) => ({
  paddingLeft: theme.sizing.baseUnit / 2,
  paddingRight: theme.sizing.baseUnit / 2,
}))(View);

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

const HorizontalView = styled(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
  paddingBottom: theme.sizing.baseUnit * 2,
}))(View);

const SocialIcon = styled(({ theme }) => ({
  width: 50,
  height: 50,
  borderRadius: 50,
  backgroundColor: theme.colors.darkPrimary,
  justifyContent: 'center',
  alignItems: 'center',
}))(View);

const AboutCampus = ({ navigation }) => {
  const itemId = navigation.getParam('itemId', []);
  console.warn(itemId);
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
                id,
                leader = {},
                serviceTimes = '',
                contactEmail = '',
                social = [],
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
                    <Stretchy style={stretchyStyle}>
                      <HeaderImage
                        forceRatio={1}
                        source={image}
                        maintainAspectRatio={false}
                      />
                    </Stretchy>
                  ) : null}
                  <FlexedView>
                    <Content>
                      {/* fixes text/navigation spacing by adding vertical padding if we dont have an image */}
                      <PaddedView>
                        <Header>
                          <StyledH1>{name}</StyledH1>
                          <ThemeMixin
                            mixin={{
                              type: 'dark',
                            }}
                          >
                            <HTMLView padded>{description}</HTMLView>
                          </ThemeMixin>
                        </Header>
                      </PaddedView>
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
                    </Content>
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
