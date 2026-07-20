// src/utils/permissionHelper.ts
import { PermissionsAndroid, Platform, Linking } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

/**
 * Handles cross-platform location permissions, including settings fallback redirect
 * if permanently blocked by the driver.
 */
export const requestLocationPermission = async (
  onShowSettingsPrompt: (title: string, message: string) => void
): Promise<boolean> => {
  
  // --- iOS Handling ---
  if (Platform.OS === 'ios') {
    try {
      const status = await Geolocation.requestAuthorization('whenInUse');
      if (status === 'granted') {
        return true;
      }
      
      // If blocked, prompt settings redirect
      if (status === 'denied' || status === 'restricted') {
        onShowSettingsPrompt(
          'Location Services Required',
          'GPS access is restricted. Please open system settings and enable Location permissions manually to sync active route coordinates.'
        );
      }
      return false;
    } catch (error) {
      console.warn('iOS Permission request error:', error);
      return false;
    }
  }

  // --- Android Handling ---
  if (Platform.OS === 'android') {
    try {
      // 1. Check if permission was already granted previously
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (hasPermission) return true;

      // 2. Request system permission dialog
      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Dispatch Location Sync',
          message: 'FleetRun needs access to your GPS coordinates to coordinate active shipment progress and arrival times.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (status === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      }

      // 3. Fallback: User clicked "Don't ask again" (Permanently Blocked)
      if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        onShowSettingsPrompt(
          'GPS Access Blocked',
          'Location tracking access is permanently denied. Please open your system settings and grant location permissions manually to sync active runs.'
        );
      }
      return false;
    } catch (err) {
      console.warn('Android Permission request error:', err);
      return false;
    }
  }

  return false;
};

// Simple utility to open device native Settings screen
export const openDeviceSettings = async () => {
  try {
    await Linking.openSettings();
  } catch (err) {
    console.warn('Failed to open device system settings page:', err);
  }
};