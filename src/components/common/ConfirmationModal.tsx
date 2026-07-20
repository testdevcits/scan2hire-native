import React from 'react';
import {
  Modal,
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  ViewStyle,
} from 'react-native';
import { LucideIcon, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react-native';
import { COLORS, FONT_SIZE, FONTS, ICON_SIZE, RADIUS, SPACING } from '../../constants';
import AppText from './AppText';


export type ModalType = 'danger' | 'success' | 'info' | 'warning';

interface ConfirmationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: ModalType;
  Icon?: LucideIcon; // Custom icon from Lucide
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  Icon,
  isLoading = false,
}) => {

  // Map colors and default icons based on type
  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return { color: COLORS.error, bg: '#FEF2F2', DefaultIcon: AlertTriangle };
      case 'success':
        return { color: COLORS.success, bg: '#F0FDF4', DefaultIcon: CheckCircle2 };
      case 'warning':
        return { color: COLORS.warning, bg: '#FFFBEB', DefaultIcon: AlertTriangle };
      default:
        return { color: COLORS.primary, bg: '#EFF6FF', DefaultIcon: Info };
    }
  };

  const theme = getTypeStyles();
  const ModalIcon = Icon || theme.DefaultIcon;

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={ICON_SIZE.md} color={COLORS.grey400} />
          </TouchableOpacity>

          {/* Icon Header */}
          <View style={[styles.iconContainer, { backgroundColor: theme.bg }]}>
            <ModalIcon size={ICON_SIZE.xl} color={theme.color} strokeWidth={2.5} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <AppText style={styles.title}>{title}</AppText>
            <AppText style={styles.description}>{description}</AppText>
          </View>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isLoading}
            >
              <AppText style={styles.cancelText}>{cancelText}</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: type === 'danger' ? COLORS.error : COLORS.primary }
              ]}
              onPress={onConfirm}
              disabled={isLoading}
            >
              <AppText style={styles.confirmText}>
                {isLoading ? 'Processing...' : confirmText}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  container: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxl,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    right: SPACING.lg,
    top: SPACING.lg,
    zIndex: 1,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  content: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.grey100,
  },
  confirmButton: {
    // Background color is dynamic
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelText: {
    fontFamily: FONTS.medium,
    color: COLORS.grey700,
  },
  confirmText: {
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
});

export default ConfirmationModal;