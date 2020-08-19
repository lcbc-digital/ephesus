import React from 'react';
import Svg, { Path } from 'react-native-svg';
import PropTypes from 'prop-types';
import { makeIcon } from '@apollosproject/ui-kit';

const Icon = makeIcon(({ size = 24, fill, ...otherProps } = {}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    {...otherProps}
  >
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.5355 12.4503C15.7859 11.7995 17.4286 9.7549 17.4286 7.33333C17.4286 4.38781 14.9981 2 12 2C9.00188 2 6.57143 4.38781 6.57143 7.33333C6.57143 9.7549 8.21412 11.7995 10.4644 12.4503C5.94792 13.1457 2.5 16.8581 2.5 21.3333C2.5 21.7099 2.8164 22 3.19298 22H20.807C21.1836 22 21.5 21.7099 21.5 21.3333C21.5 16.8581 18.0521 13.1457 13.5355 12.4503Z"
      fill={fill}
    />
  </Svg>
));

Icon.propTypes = {
  size: PropTypes.number,
  fill: PropTypes.string,
};

export default Icon;
