// Button.styles.ts
import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE, FONTS, RADIUS, SPACING } from '../../../constants';

 

export default StyleSheet.create({
  button: {
    // height: 52,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    // marginHorizontal: SPACING.lg
  },

  disabledButton: {
    backgroundColor: COLORS.buttonDisabled,
  },

  title: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.lg,
    marginHorizontal: SPACING.sm,
  },
});