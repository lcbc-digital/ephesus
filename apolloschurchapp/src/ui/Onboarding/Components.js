import { SafeAreaView } from 'react-navigation';
import { View } from 'react-native';
import { styled, H5 } from '@apollosproject/ui-kit';

const Wrapper = styled(({ theme }) => ({
  paddingTop: theme.sizing.baseUnit * 12,
  paddingHorizontal: theme.sizing.baseUnit,
  marginBottom: theme.sizing.baseUnit * 5,
  flex: 1,
}))(SafeAreaView);

const Intro = styled(({ theme }) => ({ fontSize: theme.sizing.baseUnit }))(H5);

const Underline = styled(({ theme }) => ({
  backgroundColor: theme.colors.darkTertiary,
  height: theme.sizing.baseUnit * 0.5,
  position: 'absolute',
  bottom: theme.sizing.baseUnit * 0.75,
  left: -theme.sizing.baseUnit * 0.2,
  right: -theme.sizing.baseUnit * 0.2,
}))(View);

const UnderlinedWord = styled(() => ({
  // marginRight: theme.sizing.baseUnit * 0.5,
}))(View);

export { Underline, Intro, Wrapper, UnderlinedWord };
