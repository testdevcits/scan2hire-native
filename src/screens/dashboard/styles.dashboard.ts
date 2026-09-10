import { StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE, FONTS, RADIUS, SPACING } from '../../constants';

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SPACING.md,
    paddingBottom: 112,
    flexGrow: 1,
  },
  warningBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  warningTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.md,
    color: COLORS.error,
  },
  warningText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.sm,
    color: COLORS.grey700,
    lineHeight: 18,
  },

  controlCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.divider,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  controlTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.lg,
    color: COLORS.slateDark,
    marginBottom: SPACING.xs,
  },
  controlSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.xs,
    color: COLORS.slateSubtle,
    marginBottom: SPACING.xl,
  },
  actionNotice: {
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  actionNotice_info: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  actionNotice_success: {
    backgroundColor: '#ECFDF5',
    borderColor: '#BBF7D0',
  },
  actionNotice_warning: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  actionNotice_error: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  actionNoticeText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textPrimary,
    lineHeight: 17,
  },
  clockInContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  attendanceActionsBlock: {
    marginTop: 0,
  },
  primaryClockOutBtn: {
    backgroundColor: COLORS.accentOrange,
    paddingVertical: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accentOrange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
    width: '100%',
  },
  primaryBtnText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.md,
    color: COLORS.white,
  },
  btnIcon: {
    marginRight: SPACING.sm,
  },
  chooseBreakTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.sm,
    color: COLORS.slateMuted,
    marginTop: 22,
    marginBottom: SPACING.md,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  breakChipsContainer: {
    flexDirection: 'row',
    marginBottom: 18,
    paddingVertical: 2,
  },
  breakChip: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakChipActive: {
    backgroundColor: COLORS.accentOrange,
  },
  breakChipInactive: {
    backgroundColor: COLORS.divider,
  },
  breakChipText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.sm,
  },
  breakChipTextActive: {
    color: COLORS.white,
  },
  breakChipTextInactive: {
    color: COLORS.slateText,
  },
  secondaryBreakBtn: {
    backgroundColor: COLORS.orangeLight,
    borderWidth: 1.5,
    borderColor: COLORS.orangeBorder,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  secondaryBreakBtnActive: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  secondaryBtnText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.md,
    color: COLORS.orangeText,
  },

  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.xl,
  },
  logoutBtnText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.md,
    color: COLORS.error,
  },
});

export default styles;
