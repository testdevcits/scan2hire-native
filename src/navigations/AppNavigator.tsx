// src/navigation/AppNavigator.js
import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector, useDispatch } from 'react-redux';

import LoginScreen from '../screens/login/Login';
import { checkStoredToken } from '../redux/slices/authSlice';
import TabsNavigation from './TabsNavigation';
import SplashScreen from '../screens/splash/Splash';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const dispatch = useDispatch();
  const { token, loading } = useSelector((state) => state.auth);

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
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <Stack.Screen name="Main" component={TabsNavigation} />
      )}
    </Stack.Navigator>
  );
}