// import React, { useState } from 'react';
// import {
//   Alert,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { ArrowLeft, Eye, EyeOff, KeyRound, Lock, Mail } from 'lucide-react-native';

// import { COLORS, FONT_SIZE, FONTS, RADIUS, SPACING } from '../../constants';
// import AppText from '../../components/common/AppText';
// import { Header, Input } from '../../components';
// import AppButton from '../../components/common/Button/AppButton';
// import { authService } from '../../api/services/apiService';

// const OTP_LENGTH = 6;

// export default function ForgotPasswordScreen({ navigation }: any) {
//   const [step, setStep] = useState<1 | 2>(1);
//   const [email, setEmail] = useState('');
//   const [otp, setOtp] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   const normalizedEmail = email.trim().toLowerCase();

//   const validateEmail = () => {
//     const nextErrors: Record<string, string> = {};
//     if (!normalizedEmail) {
//       nextErrors.email = 'Email address is required';
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
//       nextErrors.email = 'Please enter a valid email address';
//     }
//     setErrors(nextErrors);
//     return Object.keys(nextErrors).length === 0;
//   };

//   const validateReset = () => {
//     const nextErrors: Record<string, string> = {};
//     if (otp.length !== OTP_LENGTH) {
//       nextErrors.otp = 'Enter the 6 digit OTP';
//     }
//     if (password.length < 6) {
//       nextErrors.password = 'Password must be at least 6 characters';
//     }
//     if (password !== confirmPassword) {
//       nextErrors.confirmPassword = 'Passwords do not match';
//     }
//     setErrors(nextErrors);
//     return Object.keys(nextErrors).length === 0;
//   };

//   const requestOtp = async () => {
//     if (!validateEmail()) return;

//     setLoading(true);
//     try {
//       const res = await authService.requestPasswordOtp(normalizedEmail);
//       setStep(2);
//       Alert.alert('OTP Sent', res.message || 'OTP sent to admin email.');
//     } catch (err: any) {
//       Alert.alert('Unable to Send OTP', err.message || 'Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetPassword = async () => {
//     if (!validateReset()) return;

//     setLoading(true);
//     try {
//       const res = await authService.resetPassword({
//         email: normalizedEmail,
//         otp,
//         password,
//       });
//       Alert.alert('Password Updated', res.message || 'Password changed successfully.', [
//         { text: 'Sign In', onPress: () => navigation.navigate('Login') },
//       ]);
//     } catch (err: any) {
//       Alert.alert('Reset Failed', err.message || 'Please verify the OTP and try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.safeContainer}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.keyboardContainer}>
//         <TouchableOpacity
//           activeOpacity={0.75}
//           onPress={() => navigation.goBack()}
//           style={styles.backButton}>
//           <ArrowLeft size={18} color={COLORS.textPrimary} />
//           <AppText style={styles.backText}>Back</AppText>
//         </TouchableOpacity>
//         <ScrollView
//           contentContainerStyle={styles.scrollContainer}
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}>


//           <View style={styles.headerContainer}>
//             <View style={styles.brandIconContainer}>
//               <KeyRound size={32} color={COLORS.primary} />
//             </View>
//             <AppText style={styles.title}>Forgot Password</AppText>
//             <AppText style={styles.subtitle}>
//               OTP will be sent to the admin email for verification.
//             </AppText>
//           </View>

//           <View style={styles.formContainer}>
//             <Input
//               label="Email Address"
//               placeholder="e.g. employee@example.com"
//               value={email}
//               onChangeText={(text) => {
//                 setEmail(text);
//                 if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
//               }}
//               autoCapitalize="none"
//               keyboardType="email-address"
//               error={errors.email}
//               disabled={step === 1}
//               leftIcon={<Mail size={20} color={COLORS.textLight} />}
//             />

//             {step === 2 ? (
//               <>
//                 <Input
//                   label="Admin OTP"
//                   placeholder="Enter 6 digit OTP"
//                   value={otp}
//                   onChangeText={(text) => {
//                     setOtp(text.replace(/\D/g, '').slice(0, OTP_LENGTH));
//                     if (errors.otp) setErrors((prev) => ({ ...prev, otp: '' }));
//                   }}
//                   keyboardType="number-pad"
//                   maxLength={OTP_LENGTH}
//                   error={errors.otp}
//                   disabled={true}
//                   leftIcon={<KeyRound size={20} color={COLORS.textLight} />}
//                 />

//                 <Input
//                   label="New Password"
//                   placeholder="Enter new password"
//                   value={password}
//                   onChangeText={(text) => {
//                     setPassword(text);
//                     if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
//                   }}
//                   autoCapitalize="none"
//                   secureTextEntry={!showPassword}
//                   error={errors.password}
//                   disabled={true}
//                   leftIcon={<Lock size={20} color={COLORS.textLight} />}
//                   rightIcon={
//                     showPassword ? (
//                       <EyeOff size={20} color={COLORS.textLight} />
//                     ) : (
//                       <Eye size={20} color={COLORS.textLight} />
//                     )
//                   }
//                   onRightIconPress={() => setShowPassword(!showPassword)}
//                 />

//                 <Input
//                   label="Confirm Password"
//                   placeholder="Re-enter new password"
//                   value={confirmPassword}
//                   onChangeText={(text) => {
//                     setConfirmPassword(text);
//                     if (errors.confirmPassword) {
//                       setErrors((prev) => ({ ...prev, confirmPassword: '' }));
//                     }
//                   }}
//                   autoCapitalize="none"
//                   secureTextEntry={!showPassword}
//                   error={errors.confirmPassword}
//                   disabled={true}
//                   leftIcon={<Lock size={20} color={COLORS.textLight} />}
//                 />
//               </>
//             ) : null}

//             <AppButton
//               title={step === 1 ? 'Send OTP to Admin' : 'Reset Password'}
//               isLoading={loading}
//               onPress={step === 1 ? requestOtp : resetPassword}
//               buttonStyle={styles.primaryButton}
//             />

//             {step === 2 ? (
//               <TouchableOpacity
//                 activeOpacity={0.75}
//                 onPress={requestOtp}
//                 disabled={loading}
//                 style={styles.linkButton}>
//                 <AppText style={styles.linkText}>Resend OTP</AppText>
//               </TouchableOpacity>
//             ) : null}
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   safeContainer: {
//     flex: 1,
//     backgroundColor: COLORS.background,
//   },
//   keyboardContainer: {
//     flex: 1,
//   },
//   scrollContainer: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     paddingHorizontal: SPACING.xxl,
//     paddingVertical: SPACING.xl,
//     paddingBottom: SPACING.xxxl
//   },
//   backButton: {
//     alignItems: 'center',
//     alignSelf: 'flex-start',
//     flexDirection: 'row',
//     gap: SPACING.xs,
//     marginBottom: SPACING.xl,
//     minHeight: 40,
//     paddingHorizontal: SPACING.xxl,
//     paddingVertical: SPACING.xl,
//   },
//   backText: {
//     color: COLORS.textPrimary,
//     fontFamily: FONTS.semiBold,
//     fontSize: FONT_SIZE.md,
//   },
//   headerContainer: {
//     alignItems: 'center',
//     marginBottom: SPACING.xxxl,
//   },
//   brandIconContainer: {
//     alignItems: 'center',
//     backgroundColor: `${COLORS.primary}15`,
//     borderRadius: RADIUS.lg,
//     height: 64,
//     justifyContent: 'center',
//     marginBottom: SPACING.md,
//     width: 64,
//   },
//   title: {
//     color: COLORS.textPrimary,
//     fontFamily: FONTS.bold,
//     fontSize: FONT_SIZE.heading,
//     marginBottom: SPACING.xs,
//     textAlign: 'center',
//   },
//   subtitle: {
//     color: COLORS.textSecondary,
//     fontFamily: FONTS.regular,
//     fontSize: FONT_SIZE.sm,
//     lineHeight: 18,
//     paddingHorizontal: SPACING.lg,
//     textAlign: 'center',
//   },
//   formContainer: {
//     width: '100%',
//   },
//   primaryButton: {
//     backgroundColor: COLORS.primary,
//     borderRadius: RADIUS.md,
//     height: 52,
//     marginTop: SPACING.md,
//   },
//   linkButton: {
//     alignItems: 'center',
//     minHeight: 44,
//     justifyContent: 'center',
//     marginTop: SPACING.md,
//   },
//   linkText: {
//     color: COLORS.primary,
//     fontFamily: FONTS.semiBold,
//     fontSize: FONT_SIZE.md,
//   },
// });


import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ArrowLeft, Mail, KeyRound } from 'lucide-react-native';
import { COLORS, FONT_SIZE, FONTS, RADIUS, SPACING } from '../../constants';
import AppButton from '../../components/common/Button/AppButton';
import { authService } from '../../api/services/apiService';
import { Input } from '../../components';
import AppText from '../../components/common/AppText';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await authService.requestPasswordOtp(email.trim().toLowerCase());
      // Navigate to OTP Screen with email as a param
      navigation.navigate('VerifyOTP', { email: email.trim().toLowerCase() });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Unable to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.safeContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <ArrowLeft size={20} color={COLORS.textPrimary} />
        <AppText style={styles.backText}>Back</AppText>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.brandIconContainer}>
            <KeyRound size={32} color={COLORS.primary} />
          </View>
          <AppText style={styles.title}>Forgot Password</AppText>
          <AppText style={styles.subtitle}>Enter your email to receive a 6-digit verification code.</AppText>
        </View>

        <Input
          label="Email Address"
          placeholder="e.g. name@example.com"
          value={email}
          onChangeText={(t) => { setEmail(t); setError(''); }}
          keyboardType="email-address"
          autoCapitalize="none"
          error={error}
          leftIcon={<Mail size={20} color={COLORS.textLight} />}
        />

        <AppButton
          title="Send Code"
          isLoading={loading}
          onPress={handleSendOtp}
          buttonStyle={styles.primaryButton}
        />
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.xl,
    paddingBottom: SPACING.xxxl
  },
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.xl,
    minHeight: 40,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.xl,
  },
  backText: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.md,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  brandIconContainer: {
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: RADIUS.lg,
    height: 64,
    justifyContent: 'center',
    marginBottom: SPACING.md,
    width: 64,
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.heading,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.sm,
    lineHeight: 18,
    paddingHorizontal: SPACING.lg,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    height: 52,
    marginTop: SPACING.md,
  },
  linkButton: {
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  linkText: {
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.md,
  },
});
