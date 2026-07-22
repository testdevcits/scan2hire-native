import { StyleSheet } from "react-native";
import { COLORS ,SPACING,FONTS,FONT_SIZE,RADIUS} from "../../constants";

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grey50,
    marginRight: SPACING.sm,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.xl,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  photoSection: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.primary}12`,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  photoButtonText: {
    marginLeft: 6,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.sm,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    color: COLORS.textPrimary,
    fontFamily: FONTS.regular,
    marginBottom: SPACING.md,
  },
  readOnlyLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  readOnlyValue: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  saveButton: {
    height: 52,
    borderRadius: RADIUS.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    marginLeft: 8,
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.md,
  },
});

export default styles