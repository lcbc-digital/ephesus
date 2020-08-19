import React from 'react';
import { get } from 'lodash';
// import styleOverrides from './styleOverrides';
// import propOverrides from './propOverrides';
import {
  DefaultCard,
  HighlightCard,
  FeaturedCard,
} from '@apollosproject/ui-kit';
import ImageCard from '../ui/ImageCard';
import fontStack from './fontStack';

/* Add your custom theme definitions below. Anything that is supported in UI-Kit Theme can be
 overridden and/or customized here! */

/* Base colors.
 * These get used by theme types (see /types directory) to color
 * specific parts of the interface. For more control on how certain
 * elements are colored, go there. The next level of control comes
 * on a per-component basis with "overrides"
 */

const cardMapper = (props) => {
  // map typename to the the card we want to render.
  if (props.isFeatured) {
    return <FeaturedCard {...props} theme={{ ...props.relatedNode?.theme }} />;
  }
  switch (get(props, '__typename')) {
    case 'Url':
      if (!props.title && !props.subtitle) {
        return <ImageCard {...props} />;
      }
      return <HighlightCard {...props} />;

    case 'MediaContentItem':
    case 'WeekendContentItem':
    case 'ContentSeriesContentItem':
    case 'DevotionalContentItem':
      return (
        <HighlightCard {...props} theme={{ ...props.relatedNode?.theme }} />
      );
    default:
      return <DefaultCard {...props} />;
  }
};

const colors = {
  primary: '#008CD0',
  secondary: '#008CD0', // '#004F71',
  tertiary: '#313131',

  screen: '#F8FAFB',
  paper: '#FFFFFF',
  alert: '#C64F55',

  // Dark shades
  darkPrimary: '#313131',
  darkSecondary: '#505050',
  darkTertiary: '#B5C0C6',

  // Light shades
  lightPrimary: '#ECEFF0',
  lightSecondary: '#D5DCDF',
  lightTertiary: '#B5C0C6',

  // Statics
  wordOfChrist: '#8b0000', // only used in Scripture.
  // background: {
  //   accent: '#9BCBEB',
  // },
};

/* Base Typography sizing and fonts.
 * To control speicfic styles used on different type components (like H1, H2, etc), see "overrides"
 */
// const typography = {};

/* Responsive breakpoints */
// export const breakpoints = {};

/* Base sizing units. These are used to scale
 * space, and size components relatively to one another.
 */
export const sizing = {
  baseBorderRadius: 8,
};

/* Base alpha values. These are used to keep transparent values across the app consistant */
// export const alpha = {};

/* Base overlays. These are used as configuration for LinearGradients across the app */
// export const overlays = () => ({});

/* Overrides allow you to override the styles of any component styled using the `styled` HOC. You
 * can also override the props of any component using the `withTheme` HOC. See examples below:
 * ```const StyledComponent = styled({ margin: 10, padding: 20 }, 'StyledComponent');
 *    const PropsComponent = withTheme(({ theme }) => ({ fill: theme.colors.primary }), 'PropsComponent');
 * ```
 * These componnents can have their styles/props overriden by including the following overrides:
 * ```{
 *   overides: {
 *     StyledComponent: {
 *       margin: 5,
 *       padding: 15,
 *     },
 *     // #protip: you even have access 👇to component props! This applies to style overrides too 💥
 *     PropsComponent: () => ({ theme, isActive }) => ({
 *       fill: isActive ? theme.colors.secondary : theme.colors.primary,
 *     }),
 *   },
 * }
 * ```
 */
// const overrides = {
//   ...styleOverrides,
//   ...propOverrides,
// };

const overlays = {
  'no-overlay': () => () => ({
    colors: ['transparent', 'transparent'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
    locations: [0, 1],
  }),
};

export const typography = {
  ...fontStack,
};

const overrides = {
  'ui-connected.ContentCardConnected.ContentCardComponentMapper': {
    Component: () => cardMapper,
  },
  H1: {
    fontFamily: typography.sans.black.default,
  },
  H2: {
    fontFamily: typography.sans.black.default,
  },
  H3: {
    fontFamily: typography.sans.black.default,
  },
  H4: {
    fontFamily: typography.sans.black.default,
  },
  H5: {
    fontFamily: typography.sans.bold.default,
  },
  H6: {
    fontFamily: typography.sans.black.default,
  },
};

export default { colors, typography, sizing, overrides, overlays };
