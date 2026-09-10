import React, { Suspense, lazy } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, History } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, FONTS } from '../constants';
import DashboardScreen from '../screens/dashboard/DashboardScreen';

// Lazy load History tab screen to reduce initial tab mount overhead
const HistoryScreen = lazy(() => import('../screens/history/HistoryScreen'));

export type BottomTabParamList = {
  Home: undefined;
  History: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const TabSuspenseFallback = () => (
  <View style={styles.fallbackContainer}>
    <ActivityIndicator size="small" color={COLORS.primary} />
  </View>
);

const LazyHistoryScreen = (props: any) => (
  <Suspense fallback={<TabSuspenseFallback />}>
    <HistoryScreen {...props} />
  </Suspense>
);

export default function TabsNavigation() {
  const brandPrimary = COLORS.primary;
  const brandInactive = COLORS.lightGrey;
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: brandPrimary,
        tabBarInactiveTintColor: brandInactive,
        tabBarStyle: [
          styles.tabBar,
          {
            height: (Platform.OS === 'ios' ? 70 : 62) + insets.bottom,
            paddingBottom: Math.max(
              insets.bottom,
              Platform.OS === 'ios' ? 12 : 8,
            ),
          },
        ],
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: FONTS.semiBold,
          fontSize: 10,
          marginTop: 2,
          letterSpacing: 0.3,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarIcon: ({ focused }) => {
          const size = 20;
          const iconColor = focused ? brandPrimary : brandInactive;

          return (
            <View style={styles.iconContainer}>
              <View
                style={[
                  styles.iconWrapper,
                  focused && styles.activeIconWrapper,
                ]}
              >
                {route.name === 'Home' ? (
                  <LayoutDashboard
                    size={size}
                    color={iconColor}
                    strokeWidth={focused ? 2.2 : 2.0}
                  />
                ) : (
                  <History
                    size={size}
                    color={iconColor}
                    strokeWidth={focused ? 2.2 : 2.0}
                  />
                )}
              </View>
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />

      <Tab.Screen
        name="History"
        component={LazyHistoryScreen}
        options={{
          title: 'My History',
          tabBarLabel: 'Attendance History',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 16 : 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  iconWrapper: {
    width: 48,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
  activeIconWrapper: {
    backgroundColor: `${COLORS.primary}14`,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
