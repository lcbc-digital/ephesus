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
  styled,
  withIsLoading,
  withTheme,
} from '@apollosproject/ui-kit';

import { useNavigation } from '@react-navigation/core';
import { View } from 'react-native';

const StyledCard = withTheme(({ theme }) => ({
  borderRadius: theme.sizing.baseBorderRadius,
  marginBottom: theme.sizing.baseUnit * 2,
  overflow: 'hidden',
}))(View);

const Image = withTheme(({ theme }) => ({
  style: {
    aspectRatio: 1,
    left: 0,
    position: 'absolute',
    top: 0,
    width: '100%',
    opacity: 0.5,
  },
}))(CardImage);

const Content = styled(({ theme }) => ({
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  paddingHorizontal: theme.sizing.baseUnit * 1.5,
  paddingVertical: theme.sizing.baseUnit * 2,
}))(CardContent);

const StyledButtonLink = styled(({ theme }) => ({
  alignSelf: 'center',
}))(ButtonLink);

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
    campusId,
    sectionTitle,
    theme,
  }) => {
    const navigation = useNavigation();

    const handleOnPressItem = () => {
      if (campusId) {
        navigation.push('AboutCampus', {
          campusId,
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
      <PaddedView vertical={false}>
        <SideBySideView>
          <H4 padded>{sectionTitle}</H4>
          <StyledButtonLink
            onPress={() => {
              navigation.navigate('Location', {
                headerBackgroundColor,
                headerTintColor,
                headerTitleColor,
              });
            }}
          >
            {!isLoading ? headerActionText : ''}
          </StyledButtonLink>
        </SideBySideView>
        <StyledCard isLoading={isLoading}>
          <Image forceRatio={1} overlayType={'featured'} source={coverImage} />
          <Content>
            <H2 numberOfLines={1}>{cardTitle}</H2>
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
    );
  }
);

export default CurrentCampus;
