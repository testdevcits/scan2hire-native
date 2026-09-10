import React, { useEffect, Suspense, lazy } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';

import LoginScreen from '../screens/login/Login';
import SplashScreen from '../screens/splash/Splash';
import { checkStoredToken } from '../redux/slices/authSlice';
import { COLORS } from '../constants';

// Lazy load secondary auth and main app screens to optimize bundle evaluation & launch speed
const ForgotPasswordScreen = lazy(
  () => import('../screens/login/ForgotPassword'),
);
const VerifyOTPScreen = lazy(
  () => import('../screens/verifyotpscreen/VerifyOTPScreen'),
);
const ResetPasswordScreen = lazy(
  () => import('../screens/resetpassword/ResetPassword'),
);
const TabsNavigation = lazy(() => import('./TabsNavigation'));
const ProfileSettingsScreen = lazy(
  () => import('../screens/settings/ProfileSettingsScreen'),
);

const Stack = createNativeStackNavigator();

type RootState = {
  auth: {
    token: string | null;
    loading: boolean;
  };
};

const SuspenseFallback = () => (
  <View style={styles.fallbackContainer}>
    <ActivityIndicator size="large" color={COLORS.primary} />
  </View>
);

export default function AppNavigator() {
  const dispatch = useDispatch<any>();
  const { token, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(checkStoredToken());
  }, [dispatch]);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token === null ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />
            <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={TabsNavigation} />
            <Stack.Screen name="Settings" component={ProfileSettingsScreen} />
          </>
        )}
      </Stack.Navigator>
    </Suspense>
  );
}

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
