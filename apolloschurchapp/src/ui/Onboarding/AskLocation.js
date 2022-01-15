import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

import {
  CampusCard,
  PaddedView,
  styled,
  Button,
  Touchable,
  H1,
} from '@apollosproject/ui-kit';

import { Slide } from '@apollosproject/ui-onboarding';
import { Wrapper, Underline, Intro, UnderlinedWord } from './Components';

const TitleWrapper = styled({ flexDirection: 'row', flexWrap: 'wrap' })(View);

const getCampusAddress = (campus) =>
  `${campus.street1}\n${campus.city}, ${campus.state} ${campus.postalCode}`;

const StyledCampusCard = styled(({ theme }) => ({
  marginBottom: theme.sizing.baseUnit,
}))(CampusCard);

const TitleContainer = styled({ flex: 1 })(View);

// memo = sfc PureComponent 💥
const LocationFinder = memo(
  ({
    BackgroundComponent,
    slideTitle,
    description,
    buttonText,
    onPressButton,
    campus,
    onPressPrimary,
    ...props
  }) => (
    <Slide
      onPressPrimary={onPressPrimary}
      {...props}
      alwaysBounceVertical={false}
    >
      {BackgroundComponent}
      <Wrapper>
        <TitleContainer>
          <TitleWrapper>
            <H1>{'Select your '}</H1>
            <UnderlinedWord>
              <Underline />
              <H1>{'local'}</H1>
            </UnderlinedWord>
            <H1> </H1>
            <UnderlinedWord>
              <Underline />
              <H1>{'LCBC'}</H1>
            </UnderlinedWord>
            <H1> </H1>
            <UnderlinedWord>
              <Underline />
              <H1>{'location'}</H1>
            </UnderlinedWord>
          </TitleWrapper>
          <Intro>
            {'Let us know how to keep you connected with LCBC each week.'}
          </Intro>
        </TitleContainer>
        {campus && onPressPrimary ? (
          <Touchable onPress={onPressButton}>
            <StyledCampusCard
              key={campus.id}
              title={campus.name}
              description={getCampusAddress(campus)}
              images={[campus.image]}
            />
          </Touchable>
        ) : (
          <PaddedView horizontal={false}>
            <Button title={buttonText} onPress={onPressButton} pill={false} />
          </PaddedView>
        )}
      </Wrapper>
    </Slide>
  )
);

LocationFinder.propTypes = {
  /* The `Swiper` component used in `<Onboarding>` looks for and hijacks the title prop of it's
   * children. Thus we have to use a more unique name.
   */
  BackgroundComponent: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  slideTitle: PropTypes.string,
  description: PropTypes.string,
  buttonText: PropTypes.string,
  onPressButton: PropTypes.func,
  onPressPrimary: PropTypes.func,
  campus: PropTypes.shape({
    image: PropTypes.shape({
      uri: PropTypes.string,
    }),
    distanceFromLocation: PropTypes.number,
    id: PropTypes.string,
    name: PropTypes.string,
  }),
};

LocationFinder.displayName = 'LocationFinder';

LocationFinder.defaultProps = {
  slideTitle: "Let's select your local campus",
  description:
    "We'll use your location to connect you with your nearby campus and community",
  buttonText: 'Yes, find my local campus',
};

export default LocationFinder;
