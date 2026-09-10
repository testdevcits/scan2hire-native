import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react-native';
import Animated, {
  FadeInUp,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

// Using your provided constants
import { COLORS, FONT_SIZE, FONTS, SPACING, RADIUS } from '../../constants';
import { loginUser } from '../../redux/slices/authSlice';
import AppText from '../../components/common/AppText';
import { Button, Input } from '../../components';
import { requestAppPermissions } from '../../utils/permissionUtils';

export default function LoginScreen({ navigation }: any) {
  const dispatch = useDispatch<any>();
  const { loading, error: serverError } = useSelector(
    (state: any) => state.auth,
  );

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Animation Shared Value for Shake Effect
  const shakeOffset = useSharedValue(0);

  const triggerShake = useCallback(() => {
    shakeOffset.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  }, [shakeOffset]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeOffset.value }],
  }));

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) {
      triggerShake();
      return;
    }

    const resultAction = await dispatch(
      loginUser({ email: email.trim(), password: password.trim() }),
    );

    if (loginUser.fulfilled.match(resultAction)) {
      await requestAppPermissions();
    } else {
      triggerShake();
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(600)}
            style={styles.header}
          >
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <AppText style={styles.title}>Welcome Back</AppText>
            <AppText style={styles.subtitle}>
              Sign in to manage your workspace attendance and daily activities.
            </AppText>
          </Animated.View>

          {/* Login Card */}
          <Animated.View entering={FadeInDown.delay(400).duration(600)}>
            <Animated.View style={[styles.card, animatedCardStyle]}>
              {/* Server Error Card */}
              {serverError && (
                <Animated.View entering={FadeInUp} style={styles.errorCard}>
                  <AlertCircle size={18} color={COLORS.error} />
                  <AppText style={styles.errorCardText}>{serverError}</AppText>
                </Animated.View>
              )}

              {/* Email Input */}
              <Input
                label="Email Address"
                placeholder="employee@example.com"
                value={email}
                onChangeText={t => {
                  setEmail(t);
                  setErrors({ ...errors, email: '' });
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                error={errors.email}
                leftIcon={<Mail size={20} color={COLORS.grey400} />}
              />

              {/* Password Input */}
              <Input
                label="Password"
                placeholder="••••••••"
                value={password}
                onChangeText={t => {
                  setPassword(t);
                  setErrors({ ...errors, password: '' });
                }}
                isPassword
                error={errors.password}
                leftIcon={<Lock size={20} color={COLORS.grey400} />}
                rightIcon={
                  isPasswordVisible ? (
                    <EyeOff size={20} color={COLORS.grey400} />
                  ) : (
                    <Eye size={20} color={COLORS.grey400} />
                  )
                }
                onRightIconPress={() =>
                  setIsPasswordVisible(!isPasswordVisible)
                }
              />

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.forgotPassword}
              >
                <AppText style={styles.forgotText}>Forgot Password?</AppText>
              </TouchableOpacity>

              <Button
                title="Sign In"
                isLoading={loading}
                onPress={handleLogin}
              />
            </Animated.View>
          </Animated.View>

          {/* Footer Section */}
          <View style={styles.footer}>
            <AppText style={styles.footerText}>
              Conative Attendance System
            </AppText>
            <AppText style={styles.versionText}>
              © {new Date().getFullYear()} • Version 1.0.0
            </AppText>
          </View>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logo: {
    height: 80,
    width: 130,
    marginBottom: SPACING.md,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.heading,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
    lineHeight: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    // Premium Shadow
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  inputWrapper: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    marginLeft: 4,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grey50,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.grey200,
  },
  inputBoxError: {
    borderColor: COLORS.error,
    backgroundColor: '#FFF1F0',
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
    marginTop: 6,
    marginLeft: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.xl,
  },
  forgotText: {
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.md,
  },

  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F0',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: '#FFA39E',
  },
  errorCardText: {
    color: COLORS.error,
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.sm,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.xxxl,
  },
  footerText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  versionText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
  },
});
