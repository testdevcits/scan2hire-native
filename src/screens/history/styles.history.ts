import { StyleSheet } from "react-native";
import { COLORS, FONT_SIZE, FONTS, RADIUS, SPACING } from "../../constants";

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
        padding: SPACING.md,
    },
    header: {
        marginBottom: SPACING.md,
    },
    titleText: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZE.title,
        color: COLORS.textPrimary,
    },
    subtitleText: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    filterBar: {
        flexDirection: 'row',
        backgroundColor: COLORS.grey100,
        borderRadius: RADIUS.round,
        padding: 4,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    filterTab: {
        flex: 1,
        paddingVertical: SPACING.sm,
        alignItems: 'center',
        borderRadius: RADIUS.round,
    },
    filterTabActive: {
        backgroundColor: COLORS.surface,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    filterTabText: {
        fontFamily: FONTS.medium,
        fontSize: 10,
        color: COLORS.textSecondary,
        letterSpacing: 0.5,
    },
    filterTabTextActive: {
        fontFamily: FONTS.bold,
        color: COLORS.primary,
    },
    listContent: {
        paddingBottom:150,
    },

    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZE.sm,
        color: COLORS.textSecondary,
        marginTop: SPACING.sm,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: SPACING.xxxl,
    },
    emptyText: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZE.md,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.xs,
    },
    emptySubText: {
        fontFamily: FONTS.regular,
        fontSize: FONT_SIZE.xs,
        color: COLORS.textLight,
        textAlign: 'center',
        paddingHorizontal: SPACING.lg,
    },
});

export default styles