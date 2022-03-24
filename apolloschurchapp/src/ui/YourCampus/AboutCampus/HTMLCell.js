import React from 'react';
import HTMLViewCore from '@apollosproject/ui-htmlview';
import { styled } from '@apollosproject/ui-kit';
import { View } from 'react-native';

const CellText = styled(({ theme }) => ({
  flexGrow: 1,
  flexShrink: 1,
  paddingLeft: theme.sizing.baseUnit / 2,
  paddingRight: theme.sizing.baseUnit / 2,
}))(View);

class HTMLCell extends HTMLViewCore {
  render() {
    return <CellText>{this.state.parsed}</CellText>;
  }
}

export default HTMLCell;
