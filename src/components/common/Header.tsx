// src/components/Header.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Modal,
    Pressable,
} from 'react-native';
import { User, MoreVertical, RefreshCw, LogOut, Settings } from 'lucide-react-native';

import { COLORS, FONT_SIZE, FONTS, RADIUS, SPACING } from '../../constants';
import { UserProfile } from '../../types/user';

interface HeaderProps {
    user: UserProfile | null;
    onLogout?: () => void;
    onRefresh?: () => void;
    onSettingsPress?: () => void;
}

const Header = ({
    user,
    onLogout,
    onRefresh,
    onSettingsPress,
}: HeaderProps) => {
    const [menuVisible, setMenuVisible] = useState<boolean>(false);

    const toggleMenu = () => setMenuVisible(!menuVisible);

    const handleMenuAction = (action: () => void) => {
        setMenuVisible(false);
        action();
    };

    const profileUrl = user?.profileImage;

    return (
        <View style={styles.container}>
            {/* Left: Avatar & User Information */}
            <View style={styles.profileSection}>
                {profileUrl && profileUrl.trim() !== '' ? (
                    <Image source={{ uri: profileUrl }} style={styles.avatarImage} />
                ) : (
                    <View style={styles.avatarFallback}>
                        <User size={22} color={COLORS.primary} />
                    </View>
                )}

                <View style={styles.userInfo}>
                    <Text style={styles.nameText} numberOfLines={1}>
                        {user?.name}
                    </Text>
                    <Text style={styles.empIdText}>
                        ID: {user?.employeeId || 'N/A'}
                    </Text>
                </View>
            </View>

            {/* Right: Three Dots Menu Icon */}
            <TouchableOpacity
                style={styles.menuIconButton}
                onPress={toggleMenu}
                hitSlop={8}
            >
                <MoreVertical size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>

            {/* WhatsApp Style Dropdown Popup */}
            <Modal
                visible={menuVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                {/* Full screen backdrop dismiss block */}
                <Pressable
                    style={styles.modalBackdrop}
                    onPress={() => setMenuVisible(false)}
                >
                    <View style={styles.dropdownMenu}>
                        {onRefresh && (
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => handleMenuAction(onRefresh)}
                            >
                                <RefreshCw size={16} color={COLORS.textPrimary} style={styles.menuItemIcon} />
                                <Text style={styles.menuItemText}>Refresh Status</Text>
                            </TouchableOpacity>
                        )}

                        {onSettingsPress && (
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => handleMenuAction(onSettingsPress)}
                            >
                                <Settings size={16} color={COLORS.textPrimary} style={styles.menuItemIcon} />
                                <Text style={styles.menuItemText}>Settings</Text>
                            </TouchableOpacity>
                        )}

                        {/* Divider line before critical actions */}
                        {(onRefresh || onSettingsPress) && <View style={styles.menuDivider} />}

                        <TouchableOpacity
                            style={[styles.menuItem]}
                            onPress={() => handleMenuAction(onLogout)}
                        >
                            <LogOut size={16} color={COLORS.error} style={styles.menuItemIcon} />
                            <Text style={[styles.menuItemText, { color: COLORS.error }]}>Log Out</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

export default Header;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.background,
        marginHorizontal: SPACING.md
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarImage: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.round,
        backgroundColor: COLORS.grey200,
    },
    avatarFallback: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.round,
        backgroundColor: `${COLORS.primary}15`, // Light primary background tint
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: `${COLORS.primary}30`,
    },
    userInfo: {
        marginLeft: SPACING.md,
        flex: 1,
    },
    nameText: {
        fontFamily: FONTS.bold,
        fontSize: FONT_SIZE.md,
        color: COLORS.textPrimary,
    },
    empIdText: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZE.xs,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    menuIconButton: {
        padding: SPACING.xs,
        borderRadius: RADIUS.round,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: COLORS.transparent,
    },
    dropdownMenu: {
        position: 'absolute',
        top: 50, // Matches down-offset below the header line
        right: SPACING.lg,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.sm,
        width: 160,
        paddingVertical: SPACING.xs,
        // Native Card Shadows
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
    },
    menuItemIcon: {
        marginRight: SPACING.sm,
    },
    menuItemText: {
        fontFamily: FONTS.medium,
        fontSize: FONT_SIZE.sm,
        color: COLORS.textPrimary,
    },
    menuDivider: {
        height: 1,
        backgroundColor: COLORS.divider,
        marginVertical: 4,
    },
});