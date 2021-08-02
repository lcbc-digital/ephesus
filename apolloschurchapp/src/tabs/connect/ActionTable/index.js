import React from 'react';
import { View } from 'react-native';

import {
  TableView,
  Cell,
  CellIcon,
  CellText,
  Divider,
  Touchable,
  styled,
  PaddedView,
  H4,
} from '@apollosproject/ui-kit';
import { RockAuthedWebBrowser } from '@apollosproject/ui-connected';

const RowHeader = styled(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: theme.sizing.baseUnit,
}))(PaddedView);

const Name = styled({
  flexGrow: 1,
})(View);

const ActionTable = () => (
  <RockAuthedWebBrowser>
    {(openUrlFunc) => {
      const openUrl = (url) => openUrlFunc(url, {}, { useRockToken: true });
      return (
        <View>
          <RowHeader>
            <Name>
              <H4>{'Connect with LCBC'}</H4>
            </Name>
          </RowHeader>
          <TableView>
            <Touchable
              onPress={() =>
                openUrl('https://lcbcchurch.com/next-steps/groups')
              }
            >
              <Cell>
                <CellText>Join A Group</CellText>
                <CellIcon name="arrow-next" />
              </Cell>
            </Touchable>
            <Divider />
            <Touchable
              onPress={() => openUrl('https://lcbcchurch.com/next-steps/serve')}
            >
              <Cell>
                <CellText>Find a Serving Opportunity</CellText>
                <CellIcon name="arrow-next" />
              </Cell>
            </Touchable>
            <Divider />
            <Touchable
              onPress={() => openUrl('https://lcbcchurch.com/locations')}
            >
              <Cell>
                <CellText>LCBC Locations & Times</CellText>
                <CellIcon name="arrow-next" />
              </Cell>
            </Touchable>
            <Divider />
            <Touchable
              onPress={() => openUrl('https://app.lcbcchurch.com/contact-us')}
            >
              <Cell>
                <CellText>Contact Us</CellText>
                <CellIcon name="arrow-next" />
              </Cell>
            </Touchable>
            <Divider />
            <Touchable
              onPress={() => openUrl('https://app.lcbcchurch.com/bugreport')}
            >
              <Cell>
                <CellText>Report A Bug</CellText>
                <CellIcon name="arrow-next" />
              </Cell>
            </Touchable>
            {/* <Touchable */}
            {/*   onPress={() => navigation.navigate('TestingControlPanel')} */}
            {/* > */}
            {/*   <Cell> */}
            {/*     <CellText>Open Testing Panel</CellText> */}
            {/*     <CellIcon name="arrow-next" /> */}
            {/*   </Cell> */}
            {/* </Touchable> */}
          </TableView>
        </View>
      );
    }}
  </RockAuthedWebBrowser>
);

const StyledActionTable = styled(({ theme }) => ({
  paddingBottom: theme.sizing.baseUnit * 100,
}))(ActionTable);

export default StyledActionTable;
