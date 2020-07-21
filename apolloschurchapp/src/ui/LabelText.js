import { styled, H2 } from '@apollosproject/ui-kit';

const LabelText = styled(
  ({ theme, padded }) => ({
    fontSize: theme.helpers.rem(1.5),
    lineHeight: theme.helpers.verticalRhythm(1.5, 1.15),
    fontFamily: theme.typography.sans.black.default,
    color: theme.colors.text.primary,
    ...(padded
      ? {
          paddingTop: theme.helpers.verticalRhythm(1.125),
          paddingBottom: theme.helpers.verticalRhythm(0.75),
        }
      : {}),
  }),
  'LabelText'
)(H2);

export default LabelText;
