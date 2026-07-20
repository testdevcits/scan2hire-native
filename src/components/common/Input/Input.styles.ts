import {StyleSheet} from 'react-native';
import { COLORS, FONT_SIZE, FONTS, RADIUS, SPACING } from '../../../constants';

 
export default StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },

  label: {
    marginBottom: SPACING.sm,
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },

  leftIconContainer: {
  marginRight: 10, // Gives spacing between the icon and the typed text
  justifyContent: 'center',
  alignItems: 'center',
},

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: COLORS.border,

    borderRadius: RADIUS.md,

    paddingHorizontal: SPACING.lg,
    height: 52,

    backgroundColor: COLORS.white,
  },

  focusedBorder: {
    borderColor: COLORS.primary,
  },

  errorBorder: {
    borderColor: COLORS.error,
  },

  input: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },

  error: {
    marginTop: 5,
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.regular,
  },

  disabledBorder: {
    backgroundColor: COLORS.grey100,
    borderColor: COLORS.grey300,
  },
});