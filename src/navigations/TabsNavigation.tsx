// src/navigation/TabsNavigation.tsx
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, History } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, FONTS } from '../constants';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import HistoryScreen from '../screens/history/HistoryScreen';

export type BottomTabParamList = {
  Dashboard: undefined;
  History: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const TabsNavigation = () => {
  // Leverage exact brand constants from your design tokens
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
            paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 12 : 8),
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
                {route.name === 'Dashboard' ? (
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
              {/* Refined active indicator dot */}
              {focused && <View style={styles.activeDot} />}
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
        }}
      />

      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'My History',
          tabBarLabel: 'History',
        }}
      />
    </Tab.Navigator>
  );
};

export default TabsNavigation;

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 0,

    backgroundColor: COLORS.surface,
    
    // Thin borders using brand divider constant
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,

    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 16 : 8,

    // Premium warm-glow drop shadow
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 20,

    elevation: 8,
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
    // 8% opacity of brand primary color (#F84525) dynamically calculated
    backgroundColor: `${COLORS.primary}14`, 
  },

  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    position: 'absolute',
    bottom: -4,
  },
});
