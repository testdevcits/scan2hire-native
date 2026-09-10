import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  FadeInUp,
  FadeInDown,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {
  LockKeyhole,
  Eye,
  EyeOff,
  CheckCircle2,
  Circle,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react-native';

import { COLORS, SPACING, FONTS, FONT_SIZE, RADIUS } from '../../constants';
import AppText from '../../components/common/AppText';
import { Button, Input } from '../../components';
import { authService } from '../../api/services/apiService';

export default function ResetPasswordScreen({ navigation, route }: any) {
  const { email, resetToken } = route.params || { email: '', resetToken: '' };

  // --- Form State ---
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // --- UI State ---
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // --- Password Strength & Validation Rules ---
  const getValidation = () => {
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    const isMatch = password === confirmPassword && confirmPassword !== '';

    return {
      hasLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSymbol,
      isMatch,
    };
  };

  const validation = getValidation();

  // Dynamic Strength Calculator
  const getStrength = () => {
    let score = 0;
    if (validation.hasLength) score++;
    if (validation.hasUpper && validation.hasLower) score++;
    if (validation.hasNumber) score++;
    if (validation.hasSymbol) score++;

    switch (score) {
      case 0:
      case 1:
        return { label: 'Weak', color: COLORS.error, percent: 25 };
      case 2:
        return { label: 'Fair', color: '#F59E0B', percent: 50 };
      case 3:
        return { label: 'Good', color: '#3B82F6', percent: 75 };
      case 4:
        return { label: 'Strong', color: COLORS.success, percent: 100 };
      default:
        return { label: 'Weak', color: COLORS.error, percent: 0 };
    }
  };

  const strength = getStrength();

  const isFormValid =
    validation.hasLength &&
    validation.hasUpper &&
    validation.hasLower &&
    validation.hasNumber &&
    validation.hasSymbol &&
    validation.isMatch;

  // --- Reanimated Style for Password Strength Bar ---
  const strengthBarStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(`${strength.percent}%`, { duration: 300 }),
      backgroundColor: strength.color,
    };
  });

  // --- Submit Handler ---
  const handleReset = async () => {
    if (!isFormValid) return;

    setIsLoading(true);
    setServerError(null);

    try {
      await authService.resetPassword({
        email,
        resetToken,
        password,
      });

      setIsSuccess(true);
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    } catch (err: any) {
      setServerError(
        err.message || 'Failed to reset password. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) return <SuccessOverlay />;

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View
            entering={FadeInUp.duration(600)}
            style={styles.header}
          >
            <View style={styles.iconCircle}>
              <LockKeyhole size={32} color={COLORS.primary} strokeWidth={1.5} />
            </View>
            <AppText style={styles.title}>Create New Password</AppText>
            <AppText style={styles.subtitle}>
              Set a strong password to secure your account.
            </AppText>
          </Animated.View>

          <View style={styles.form}>
            {/* New Password */}
            <Input
              label="New Password"
              placeholder="Enter new password"
              value={password}
              onChangeText={t => {
                setPassword(t);
                setServerError(null);
              }}
              isPassword
              secureTextEntry={!showPassword}
              leftIcon={<LockKeyhole size={20} color={COLORS.textLight} />}
              rightIcon={
                showPassword ? (
                  <EyeOff size={20} color={COLORS.textLight} />
                ) : (
                  <Eye size={20} color={COLORS.textLight} />
                )
              }
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            {/* Strength Meter */}
            {password.length > 0 && (
              <Animated.View
                entering={FadeInDown}
                style={styles.strengthContainer}
              >
                <View style={styles.strengthHeader}>
                  <AppText
                    style={[styles.strengthText, { color: strength.color }]}
                  >
                    Strength: {strength.label}
                  </AppText>
                </View>
                <View style={styles.strengthTrack}>
                  <Animated.View
                    style={[styles.strengthBar, strengthBarStyle]}
                  />
                </View>
              </Animated.View>
            )}

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              secureTextEntry={!showPassword}
              error={
                !validation.isMatch && confirmPassword.length > 0
                  ? 'Passwords do not match'
                  : undefined
              }
              leftIcon={<ShieldCheck size={20} color={COLORS.textLight} />}
              rightIcon={
                showPassword ? (
                  <EyeOff size={20} color={COLORS.textLight} />
                ) : (
                  <Eye size={20} color={COLORS.textLight} />
                )
              }
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            {/* Requirements Checklist */}
            <View style={styles.requirementsCard}>
              <RequirementItem
                label="8+ characters"
                met={validation.hasLength}
              />
              <RequirementItem
                label="Uppercase & Lowercase"
                met={validation.hasUpper && validation.hasLower}
              />
              <RequirementItem
                label="At least one number"
                met={validation.hasNumber}
              />
              <RequirementItem
                label="One special character"
                met={validation.hasSymbol}
              />
            </View>

            {serverError && (
              <View style={styles.serverErrorCard}>
                <AlertCircle size={18} color={COLORS.error} />
                <AppText style={styles.serverErrorText}>{serverError}</AppText>
              </View>
            )}

            <Button
              title="Update Password"
              onPress={handleReset}
              isLoading={isLoading}
              disabled={!isFormValid}
              buttonStyle={styles.submitBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// --- Internal Sub-Components ---

const RequirementItem = ({ label, met }: { label: string; met: boolean }) => (
  <View style={styles.requirementRow}>
    {met ? (
      <CheckCircle2 size={16} color={COLORS.success} />
    ) : (
      <Circle size={16} color={COLORS.grey300} />
    )}
    <AppText style={[styles.requirementText, met && styles.requirementMet]}>
      {label}
    </AppText>
  </View>
);

const SuccessOverlay = () => (
  <View style={styles.successContainer}>
    <Animated.View entering={FadeInUp} style={styles.successCard}>
      <View style={styles.successIconWrapper}>
        <CheckCircle2 size={80} color={COLORS.success} strokeWidth={1.5} />
      </View>
      <AppText style={styles.successTitle}>Password Updated!</AppText>
      <AppText style={styles.successSubtitle}>
        Your password has been changed successfully. Navigating to login...
      </AppText>
    </Animated.View>
  </View>
);

// --- Styles ---

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: {
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.xxxl,
  },
  header: { alignItems: 'center', marginBottom: SPACING.xxxl },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.title,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  form: { width: '100%' },
  inputWrapper: { marginBottom: SPACING.lg },
  label: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grey50,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.grey200,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: `${COLORS.error}05`,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
  errorText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.error,
    fontFamily: FONTS.medium,
    marginTop: 4,
    marginLeft: 4,
  },
  strengthContainer: { marginBottom: SPACING.lg },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  strengthText: { fontSize: FONT_SIZE.xs, fontFamily: FONTS.bold },
  strengthTrack: {
    height: 6,
    backgroundColor: COLORS.grey200,
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthBar: { height: '100%', borderRadius: 3 },
  requirementsCard: {
    backgroundColor: COLORS.grey50,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.grey100,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  requirementText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
  },
  requirementMet: { color: COLORS.textPrimary, fontFamily: FONTS.medium },
  serverErrorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.error}10`,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  serverErrorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.medium,
    flex: 1,
  },
  submitBtn: { height: 58, borderRadius: 16, backgroundColor: COLORS.primary },
  successContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  successCard: { alignItems: 'center', width: '100%' },
  successIconWrapper: { marginBottom: SPACING.xl },
  successTitle: {
    fontSize: FONT_SIZE.title,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  successSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
