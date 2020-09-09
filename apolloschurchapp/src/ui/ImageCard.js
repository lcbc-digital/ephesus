import React from 'react';
import { get } from 'lodash';
import PropTypes from 'prop-types';

import {
  styled,
  withIsLoading,
  ImageSourceType,
  withTheme,
  ThemeMixin,
  Card,
  CardImage,
  CardLabel,
  CardContent,
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

const Content = styled(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  width: '100%',
  alignItems: 'flex-start', // needed to make `Label` display as an "inline" element
  paddingHorizontal: theme.sizing.baseUnit * 1.5, // TODO: refactor CardContent to have this be the default
  paddingBottom: theme.sizing.baseUnit * 2, // TODO: refactor CardContent to have this be the default
}))(CardContent);

const Label = withTheme(({ customTheme, labelText }) => ({
  title: labelText,
  theme: { colors: get(customTheme, 'colors', {}) },
  type: 'secondary',
}))(CardLabel);

const HighlightCard = withIsLoading(
  ({ coverImage, isLoading, theme, labelText }) => (
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
        <Content>
          <Label
            customTheme={theme}
            labelText={labelText}
            isLive={false}
            IconComponent={null}
          />
        </Content>
      </StyledCard>
    </ThemeMixin>
  )
);

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
