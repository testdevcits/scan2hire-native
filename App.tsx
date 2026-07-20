// App.js
import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { store } from './src/app/store';
import AppNavigator from './src/navigations/AppNavigator';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { COLORS } from './src/constants';

export default function App() {
  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <StatusBar barStyle={'light-content'} backgroundColor={COLORS.primary}/>
      <SafeAreaView style={{ flex: 1 }}>
        <Provider store={store}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </Provider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}