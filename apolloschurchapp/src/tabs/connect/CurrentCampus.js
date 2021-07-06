import React from 'react';
import { get } from 'lodash';

import {
  Button,
  ButtonLink,
  CardContent,
  CardImage,
  H2,
  H4,
  Icon,
  PaddedView,
  SideBySideView,
  ThemeMixin,
  styled,
  withIsLoading,
  withTheme,
  // GradientOverlayImage,
} from '@apollosproject/ui-kit';

import { useNavigation } from '@react-navigation/core';
import { View } from 'react-native';
// import Label from '../../ui/LabelText';

const StyledCard = withTheme(({ theme }) => ({
  borderRadius: theme.sizing.baseBorderRadius,
  cardColor: theme.colors.primary,
  marginBottom: theme.sizing.baseUnit * 2,
  overflow: 'hidden',
}))(View);

const stretchyStyle = {
  aspectRatio: 1,
  left: 0,
  position: 'absolute',
  top: 0,
  width: '100%',
};

const Image = withTheme(({ theme }) => ({
  overlayColor: theme.colors.primary,
  overlayType: 'gradient-bottom',
  style: stretchyStyle,
}))(CardImage);

const Content = styled(({ theme }) => ({
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  paddingHorizontal: theme.sizing.baseUnit * 1.5,
  paddingVertical: theme.sizing.baseUnit * 2,
}))(CardContent);

const StyledButtonLink = styled(({ theme }) => ({
  alignSelf: 'center',
  color: theme.colors.primary,
}))(ButtonLink);

const StyledCardTitle = styled(({ theme }) => ({
  color: theme.colors.text.primary,
}))(H2);

const Label = styled(({ theme }) => ({ color: theme.colors.darkPrimary }))(H4);

const CurrentCampus = withIsLoading(
  ({
    cardButtonText,
    cardTitle,
    coverImage,
    headerActionText,
    headerBackgroundColor,
    headerTintColor,
    headerTitleColor,
    isLoading,
    itemId,
    sectionTitle,
    theme,
  }) => {
    const navigation = useNavigation();

    const handleOnPressItem = () => {
      if (itemId) {
        navigation.push('AboutCampus', {
          itemId,
        });
      } else {
        navigation.navigate('Location', {
          headerBackgroundColor,
          headerTintColor,
          headerTitleColor,
        });
      }
    };
    return (
      <ThemeMixin
        mixin={{
          type: get(theme, 'type', 'dark').toLowerCase(), // not sure why we need toLowerCase
          colors: get(theme, 'colors', {}),
        }}
      >
        <PaddedView vertical={false}>
          <SideBySideView>
            <Label padded>{sectionTitle}</Label>
            <StyledButtonLink
              onPress={() => {
                navigation.navigate('Location', {
                  headerBackgroundColor,
                  headerTintColor,
                  headerTitleColor,
                });
              }}
            >
              {headerActionText}
            </StyledButtonLink>
          </SideBySideView>

          <StyledCard isLoading={isLoading}>
            <Image
              forceRatio={1}
              overlayType={'featured'}
              source={coverImage}
            />
            <Content>
              <StyledCardTitle numberOfLines={1}>{cardTitle}</StyledCardTitle>
              <Button
                onPress={() => handleOnPressItem()}
                loading={isLoading}
                type={'ghost'}
                pill={false}
                bordered
              >
                <H4>{cardButtonText}</H4>
                <Icon name="arrow-next" size={16} />
              </Button>
            </Content>
          </StyledCard>
        </PaddedView>
      </ThemeMixin>
    );
  }
);

export default CurrentCampus;
