// // src/screens/LoginScreen.tsx
// import React, { useState } from 'react';
// import {
//   StyleSheet,
//   View,
//   Alert,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,

//   StatusBar,
// } from 'react-native';
// import { useDispatch, useSelector } from 'react-redux';
// import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

// import { COLORS, FONT_SIZE, FONTS, SPACING, RADIUS } from '../../constants';
// import { loginUser } from '../../redux/slices/authSlice';
// import AppText from '../../components/common/AppText';
// import { Input } from '../../components';
// import AppButton from '../../components/common/Button/AppButton';

// // State Typing
// interface AuthState {
//   loading: boolean;
//   error: string | null;
// }

// interface RootState {
//   auth: AuthState;
// }

// export default function LoginScreen() {
//   const dispatch = useDispatch<any>();
//   const { loading } = useSelector((state: RootState) => state.auth);

//   const [email, setEmail] = useState<string>('');
//   const [password, setPassword] = useState<string>('');

//   // Validation Error States
//   const [emailError, setEmailError] = useState<string>('');
//   const [passwordError, setPasswordError] = useState<string>('');

//   // Password Visibility State (controls the icon displayed on screen)
//   const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

//   const validateForm = (): boolean => {
//     let isValid = true;
//     setEmailError('');
//     setPasswordError('');

//     // Basic Email validation
//     if (!email.trim()) {
//       setEmailError('Email address is required');
//       isValid = false;
//     } else {
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (!emailRegex.test(email.trim())) {
//         setEmailError('Please enter a valid email address');
//         isValid = false;
//       }
//     }

//     // Password validation
//     if (!password) {
//       setPasswordError('Password is required');
//       isValid = false;
//     } else if (password.length < 6) {
//       setPasswordError('Password must be at least 6 characters');
//       isValid = false;
//     }

//     return isValid;
//   };

//   const handleLogin = async () => {
//     if (!validateForm()) return;

//     const resultAction = await dispatch(
//       loginUser({ email: email.trim(), password })
//     );

//     if (loginUser.rejected.match(resultAction)) {
//       Alert.alert(
//         'Login Failed',
//         resultAction.payload || 'An unknown authentication error occurred'
//       );
//     }
//   };

//   return (
//     < View style={styles.safeContainer}>
//       <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.keyboardContainer}
//       >
//         <ScrollView
//           contentContainerStyle={styles.scrollContainer}
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//         >
//           {/* Header Branding Panel */}
//           <View style={styles.headerContainer}>
//             <View style={styles.brandIconContainer}>
//               <Lock size={32} color={COLORS.primary} />
//             </View>
//             <AppText style={styles.title}>Scan2Hire</AppText>
//             <AppText style={styles.subtitle}>
//               Sign in to manage your daily workspace attendance.
//             </AppText>
//           </View>

//           {/* Form Controls Wrapper */}
//           <View style={styles.formContainer}>
//             <Input
//               label="Email Address"
//               placeholder="e.g. employee@example.com"
//               value={email}
//               onChangeText={(text) => {
//                 setEmail(text);
//                 if (emailError) setEmailError('');
//               }}
//               autoCapitalize="none"
//               keyboardType="email-address"
//               error={emailError}
//               disabled={true} // In your custom Input code, editable={disabled} is evaluated. Pass true so it remains editable.
//               leftIcon={<Mail size={20} color={COLORS.textLight} />}
//             />

//             <Input
//               label="Password"
//               placeholder="••••••••"
//               value={password}
//               onChangeText={(text) => {
//                 setPassword(text);
//                 if (passwordError) setPasswordError('');
//               }}
//               autoCapitalize="none"
//               secureTextEntry={!isPasswordVisible}
//               error={passwordError}
//               disabled={true} // Pass true to enable editing based on your Input implementation wrapper.
//               leftIcon={<Lock size={20} color={COLORS.textLight} />}
//               rightIcon={
//                 isPasswordVisible ? (
//                   <EyeOff size={20} color={COLORS.textLight} />
//                 ) : (
//                   <Eye size={20} color={COLORS.textLight} />
//                 )
//               }
//               onRightIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
//             />

//             {/* Action Submit Trigger */}
//             <AppButton
//               title="Sign In"
//               isLoading={loading}
//               onPress={handleLogin}
//               buttonStyle={styles.loginButton}
//             />
//           </View>

//           {/* Footer Metadata */}
//           <View style={styles.footer}>
//             <AppText style={styles.footerText}>
//               Scan2Hire Attendance System © {new Date().getFullYear()}
//             </AppText>
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
//   },
//   headerContainer: {
//     alignItems: 'center',
//     marginBottom: SPACING.xxxl,
//   },
//   brandIconContainer: {
//     width: 64,
//     height: 64,
//     borderRadius: RADIUS.lg,
//     backgroundColor: `${COLORS.primary}15`, // Light primary opacity tint
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: SPACING.md,
//   },
//   title: {
//     fontFamily: FONTS.bold,
//     fontSize: FONT_SIZE.heading,
//     color: COLORS.textPrimary,
//     textAlign: 'center',
//     marginBottom: SPACING.xs,
//   },
//   subtitle: {
//     fontFamily: FONTS.regular,
//     fontSize: FONT_SIZE.sm,
//     color: COLORS.textSecondary,
//     textAlign: 'center',
//     paddingHorizontal: SPACING.lg,
//     lineHeight: 18,
//   },
//   formContainer: {
//     width: '100%',
//   },
//   loginButton: {
//     backgroundColor: COLORS.primary,
//     marginTop: SPACING.md,
//     borderRadius: RADIUS.md,
//     height: 52,
//   },
//   footer: {
//     alignItems: 'center',
//     marginTop: SPACING.xxxl,
//   },
//   footerText: {
//     fontFamily: FONTS.regular,
//     fontSize: FONT_SIZE.xs,
//     color: COLORS.textLight,
//   },
// });


// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

import { COLORS, FONT_SIZE, FONTS, SPACING, RADIUS } from '../../constants';
import { loginUser } from '../../redux/slices/authSlice';
import AppText from '../../components/common/AppText';
import { Input } from '../../components';
import AppButton from '../../components/common/Button/AppButton';
import { requestAppPermissions } from '../../utils/permissionUtils'; // Import the new utility

interface AuthState {
  loading: boolean;
  error: string | null;
}

interface RootState {
  auth: AuthState;
}

export default function LoginScreen() {
  const dispatch = useDispatch<any>();
  const { loading } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Email address is required');
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setEmailError('Please enter a valid email address');
        isValid = false;
      }
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    // 1. Dispatch the login attempt
    const resultAction = await dispatch(
      loginUser({ email: email.trim(), password })
    );

    if (loginUser.fulfilled.match(resultAction)) {
      // 2. Prompt Permissions sequentially immediately after login completes successfully
      const permissionsGranted = await requestAppPermissions();
      if (!permissionsGranted) {
        Alert.alert(
          'Permissions Pending',
          'Please configure system permissions under your device settings to guarantee location accuracy.'
        );
      }
    } else if (loginUser.rejected.match(resultAction)) {
      Alert.alert(
        'Login Failed',
        resultAction.payload || 'An unknown authentication error occurred'
      );
    }
  };

  return (
    <View style={styles.safeContainer}>
      {/* <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} /> */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <View style={styles.brandIconContainer}>
              <Lock size={32} color={COLORS.primary} />
            </View>
            <AppText style={styles.title}>Scan2Hire</AppText>
            <AppText style={styles.subtitle}>
              Sign in to manage your daily workspace attendance.
            </AppText>
          </View>

          <View style={styles.formContainer}>
            <Input
              label="Email Address"
              placeholder="e.g. employee@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              error={emailError}
              disabled={true}
              leftIcon={<Mail size={20} color={COLORS.textLight} />}
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError('');
              }}
              autoCapitalize="none"
              secureTextEntry={!isPasswordVisible}
              error={passwordError}
              disabled={true}
              leftIcon={<Lock size={20} color={COLORS.textLight} />}
              rightIcon={
                isPasswordVisible ? (
                  <EyeOff size={20} color={COLORS.textLight} />
                ) : (
                  <Eye size={20} color={COLORS.textLight} />
                )
              }
              onRightIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
            />

            <AppButton
              title="Sign In"
              isLoading={loading}
              onPress={handleLogin}
              buttonStyle={styles.loginButton}
            />
          </View>

          <View style={styles.footer}>
            <AppText style={styles.footerText}>
              Scan2Hire Attendance System © {new Date().getFullYear()}
            </AppText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  brandIconContainer: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
    lineHeight: 18,
  },
  formContainer: {
    width: '100%',
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    marginTop: SPACING.md,
    borderRadius: RADIUS.md,
    height: 52,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.xxxl,
  },
  footerText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
  },
});