// src/navigation/AppNavigator.js
import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';

import LoginScreen from '../screens/login/Login';
import ForgotPasswordScreen from '../screens/login/ForgotPassword';
import { checkStoredToken } from '../redux/slices/authSlice';
import TabsNavigation from './TabsNavigation';
import SplashScreen from '../screens/splash/Splash';
import ProfileSettingsScreen from '../screens/settings/ProfileSettingsScreen';

const Stack = createNativeStackNavigator();

type RootState = {
  auth: {
    token: string | null;
    loading: boolean;
  };
};

export default function AppNavigator() {
  const dispatch = useDispatch<any>();
  const { token, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(checkStoredToken());
  }, [dispatch]);

  // 2. Render the custom splash screen while checking authentication status
  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token === null ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={TabsNavigation} />
          <Stack.Screen name="Settings" component={ProfileSettingsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
