import React from 'react';
import Svg, { Path } from 'react-native-svg';
import PropTypes from 'prop-types';
import { makeIcon } from '@apollosproject/ui-kit';

const Icon = makeIcon(
  ({ size = 24, fill, secondaryFill, ...otherProps } = {}) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...otherProps}>
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M4 2C2.89543 2 2 2.89543 2 4V9C2 10.1046 2.89543 11 4 11H9C10.1046 11 11 10.1046 11 9V4C11 2.89543 10.1046 2 9 2H4ZM15 2C13.8954 2 13 2.89543 13 4V9C13 10.1046 13.8954 11 15 11H20C21.1046 11 22 10.1046 22 9V4C22 2.89543 21.1046 2 20 2H15ZM2 15C2 13.8954 2.89543 13 4 13H9C10.1046 13 11 13.8954 11 15V20C11 21.1046 10.1046 22 9 22H4C2.89543 22 2 21.1046 2 20V15ZM15 13C13.8954 13 13 13.8954 13 15V20C13 21.1046 13.8954 22 15 22H20C21.1046 22 22 21.1046 22 20V15C22 13.8954 21.1046 13 20 13H15Z"
        fill={fill}
      />
    </Svg>
  )
);

Icon.propTypes = {
  size: PropTypes.number,
  fill: PropTypes.string,
};

export default Icon;
