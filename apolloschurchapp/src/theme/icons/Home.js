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
        d="M11.2201 2.25523C11.5999 1.91492 12.1749 1.91492 12.5547 2.25523L22.4401 11.1125C23.1235 11.7248 22.6904 12.8573 21.7728 12.8573H20.9176C20.3653 12.8573 19.9176 13.305 19.9176 13.8573V21.6573C19.9176 22.2096 19.4699 22.6573 18.9176 22.6573H14.5641V16.6573C14.5641 16.105 14.1164 15.6573 13.5641 15.6573H10.2107C9.65839 15.6573 9.21068 16.105 9.21068 16.6573V22.6573H4.85723C4.30494 22.6573 3.85723 22.2096 3.85723 21.6573V13.8573C3.85723 13.305 3.40951 12.8573 2.85723 12.8573H2.00201C1.08444 12.8573 0.651311 11.7248 1.33469 11.1125L11.2201 2.25523Z"
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
