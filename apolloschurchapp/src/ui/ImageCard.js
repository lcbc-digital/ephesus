import React from 'react';
import { get } from 'lodash';
import PropTypes from 'prop-types';

import {
  withIsLoading,
  ImageSourceType,
  withTheme,
  ThemeMixin,
  Card,
  CardImage,
} from '@apollosproject/ui-kit';

const StyledCard = withTheme(({ theme }) => ({
  cardColor: theme.colors.primary,
}))(Card);

const Image = withTheme(({ theme, customTheme }) => ({
  maxAspectRatio: 1.2,
  minAspectRatio: 0.75,
  maintainAspectRatio: true,
  overlayColor: get(customTheme, 'colors.primary', theme.colors.black),
}))(CardImage);

const HighlightCard = withIsLoading(({ coverImage, isLoading, theme }) => (
  <ThemeMixin
    mixin={{
      type: get(theme, 'type', 'dark').toLowerCase(), // not sure why we need toLowerCase
      colors: get(theme, 'colors', {}),
    }}
  >
    <StyledCard isLoading={isLoading}>
      <Image
        overlayType={'no-overlay'}
        customTheme={theme}
        source={coverImage}
      />
    </StyledCard>
  </ThemeMixin>
));

HighlightCard.propTypes = {
  coverImage: PropTypes.oneOfType([
    PropTypes.arrayOf(ImageSourceType),
    ImageSourceType,
  ]).isRequired,
  title: PropTypes.string.isRequired,
  actionIcon: PropTypes.string,
  hasAction: PropTypes.bool,
  isLiked: PropTypes.bool,
  LabelComponent: PropTypes.element,
  labelText: PropTypes.string,
  summary: PropTypes.string,
  theme: PropTypes.shape({
    type: PropTypes.string,
    colors: PropTypes.shape({}),
  }),
};

HighlightCard.defaultProps = {
  actionIcon: 'play-opaque',
};

export default HighlightCard;
