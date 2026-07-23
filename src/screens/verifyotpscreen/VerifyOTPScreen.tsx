import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { ShieldCheck, ArrowLeft, TriangleAlert } from 'lucide-react-native';
import Animated, {
  FadeInUp,
  FadeInDown,
  useSharedValue,
  withSequence,
  withTiming
} from 'react-native-reanimated';

import { COLORS, FONT_SIZE, FONTS, RADIUS, SPACING } from '../../constants';
import AppText from '../../components/common/AppText';
import AppButton from '../../components/common/Button/AppButton';
import { authService } from '../../api/services/apiService';

const OTP_LENGTH = 6;
const TIMER_INITIAL = 45;

export default function VerifyOTPScreen({ navigation, route }: any) {
  const { email } = route.params || { email: null };

  // State
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(TIMER_INITIAL);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs & Animation
  const inputRef = useRef<TextInput>(null);
  const shakeOffset = useSharedValue(0);

  // Countdown Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (codeToVerify?: string) => {
    const finalCode = codeToVerify || otp;
    if (finalCode.length !== 6) return;

    setIsLoading(true);
    try {
      // Calling the new verifyOtp API
      const response = await authService.verifyOtp(email, finalCode);

      console.log("====response=", response)

      // If successful, navigate to ResetPassword
      navigation.navigate('ResetPassword', { email, resetToken: response?.data?.resetToken });
    } catch (err: any) {
      setError(err.message || 'Incorrect verification code');
      // Shake animation logic here...
    } finally {
      setIsLoading(false);
    }
  };

  const onOtpChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    setOtp(cleaned);
    if (cleaned.length === OTP_LENGTH) {
      handleVerify(cleaned);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setIsLoading(true);
    try {
      await authService.requestPasswordOtp(email);
      setTimer(TIMER_INITIAL);
      setError(null);
      setOtp('');
      Alert.alert('Code Resent', 'A new verification code has been sent to your email.');
    } catch (err: any) {
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Action */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {/* Illustration Section */}
          <Animated.View entering={FadeInUp.delay(200)} style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <ShieldCheck size={40} color={COLORS.primary} strokeWidth={1.5} />
            </View>
          </Animated.View>

          {/* Text Section */}
          <Animated.View entering={FadeInUp.delay(300)} style={styles.textSection}>
            <AppText style={styles.title}>Verify Your Email</AppText>
            <AppText style={styles.subtitle}>
              Enter the 6-digit verification code sent to{' '}
              <AppText style={styles.emailHighlight}>{email}</AppText>
            </AppText>
          </Animated.View>

          {/* OTP Input Section */}
          <Animated.View entering={FadeInUp.delay(400)} style={styles.otpSection}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => inputRef.current?.focus()}
              style={styles.otpInputsRow}
            >
              {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.otpBox,
                    otp.length === i && styles.otpBoxActive,
                    otp[i] !== undefined && styles.otpBoxFilled,
                    error && styles.otpBoxError
                  ]}
                >
                  <AppText style={styles.otpText}>{otp[i] || ''}</AppText>
                </View>
              ))}
            </TouchableOpacity>

            <TextInput
              ref={inputRef}
              value={otp}
              onChangeText={onOtpChange}
              maxLength={OTP_LENGTH}
              keyboardType="number-pad"
              autoFocus
              style={styles.hiddenInput}
              textContentType="oneTimeCode"
            />
          </Animated.View>

          {/* Error Message */}
          {error && (
            <Animated.View entering={FadeInDown} style={styles.errorCard}>
              <TriangleAlert size={18} color={COLORS.error} />
              <AppText style={styles.errorText}>{error}</AppText>
            </Animated.View>
          )}

          {/* Timer Section */}
          <Animated.View entering={FadeInUp.delay(500)} style={styles.resendContainer}>
            <AppText style={styles.resendLabel}>Didn't receive the code?</AppText>
            {timer > 0 ? (
              <AppText style={styles.timerText}>
                Resend in 00:{timer < 10 ? `0${timer}` : timer}
              </AppText>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <AppText style={styles.resendLink}>Resend Code</AppText>
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* Footer Action */}
          <Animated.View entering={FadeInUp.delay(600)} style={styles.footer}>
            <AppButton
              title="Verify Code"
              onPress={() => handleVerify()}
              isLoading={isLoading}
              disabled={otp.length !== OTP_LENGTH}
              buttonStyle={styles.verifyBtn}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.loginLink}
            >
              <AppText style={styles.loginLinkText}>Back to Login</AppText>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xxxl,
  },
  backButton: {
    marginTop: Platform.OS === 'ios' ? 10 : 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  title: {
    fontSize: FONT_SIZE.title,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailHighlight: {
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
  },
  otpSection: {
    marginBottom: SPACING.xl,
  },
  otpInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  otpBox: {
    width: 50,
    height: 60,
    borderRadius: 16,
    backgroundColor: COLORS.grey50,
    borderWidth: 1.5,
    borderColor: COLORS.grey200,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  otpBoxActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    borderWidth: 2,
  },
  otpBoxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  otpBoxError: {
    borderColor: COLORS.error,
  },
  otpText: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  hiddenInput: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F0',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  errorText: {
    color: COLORS.error,
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.sm,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  resendLabel: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  timerText: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  resendLink: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  footer: {
    marginTop: 'auto',
  },
  verifyBtn: {
    borderRadius: 16,
    height: 58,
    backgroundColor: COLORS.primary,
  },
  loginLink: {
    marginTop: SPACING.lg,
    alignItems: 'center',
    padding: SPACING.sm,
  },
  loginLinkText: {
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
  },
});
