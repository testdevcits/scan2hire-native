import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { store } from './src/app/store';
import AppNavigator from './src/navigations/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, View } from 'react-native';
import { COLORS } from './src/constants';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/components/common/ToastConfig';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

export default function App() {
  return (
    // 1. Absolute Root
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* 2. Redux Provider high up so all components (Sheets, Toasts) can access it */}
      <Provider store={store}>
        {/* 3. Context for Safe Area calculations */}
        <SafeAreaProvider>
          {/* 4. Context for Bottom Sheet Modals */}
          <BottomSheetModalProvider>
            
            <StatusBar barStyle={'light-content'} backgroundColor={COLORS.primary} />
            {/* 
               REMOVED SafeAreaView from here. 
               Handle safe areas inside screens so background colors/images look premium.
            */}
            <View style={{ flex: 1, backgroundColor: COLORS.background }}>
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
            </View>

            {/* 5. Toast stays at the very bottom of the JSX tree to stay on top */}
            <Toast config={toastConfig} />
            
          </BottomSheetModalProvider>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}