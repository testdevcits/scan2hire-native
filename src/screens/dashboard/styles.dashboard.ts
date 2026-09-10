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
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  controlTitle: {
    fontFamily: FONTS.bold,
    fontSize: 19,
    color: '#0F172A',
    marginBottom: 4,
  },
  controlSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 20,
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
    backgroundColor: '#F25C05',
    paddingVertical: 15,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F25C05',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  btnIcon: {
    marginRight: 8,
  },
  chooseBreakTitle: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#64748B',
    marginTop: 22,
    marginBottom: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  breakChipsContainer: {
    flexDirection: 'row',
    marginBottom: 18,
    paddingVertical: 2,
  },
  breakChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakChipActive: {
    backgroundColor: '#F25C05',
  },
  breakChipInactive: {
    backgroundColor: '#F1F5F9',
  },
  breakChipText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  breakChipTextActive: {
    color: '#FFFFFF',
  },
  breakChipTextInactive: {
    color: '#334155',
  },
  secondaryBreakBtn: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FFD6C0',
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBreakBtnActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  secondaryBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: '#C84C00',
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
