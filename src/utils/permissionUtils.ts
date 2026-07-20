// src/utils/permissionUtils.ts
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

export const requestAppPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      // 1. Request Foreground Location & Camera first
      const foregroundGranted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);

      const cameraOk =
        foregroundGranted[PermissionsAndroid.PERMISSIONS.CAMERA] ===
        PermissionsAndroid.RESULTS.GRANTED;
      const locationOk =
        foregroundGranted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
        PermissionsAndroid.RESULTS.GRANTED;

      if (!cameraOk || !locationOk) {
        Alert.alert(
          'Required Permissions Denied',
          'Camera and Foreground Location access are mandatory to use the attendance features.'
        );
        return false;
      }

      // 2. Request Background Location (Android 10+ / API 29+)
      if (Platform.Version >= 29) {
        const hasBackgroundLoc = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
        );

        if (hasBackgroundLoc) {
          return true;
        }

        // Show prominent disclosure/rationale first (Required by Google Play Policy)
        return new Promise((resolve) => {
          Alert.alert(
            'Background Location Needed',
            'Scan2Hire collects location data in the background to verify proximity to your office coordinates, even when the app is closed or not in use.',
            [
              {
                text: 'Cancel',
                onPress: () => resolve(false),
                style: 'cancel',
              },
              {
                text: 'Accept & Configure',
                onPress: async () => {
                  const backgroundStatus = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
                  );
                  if (backgroundStatus === PermissionsAndroid.RESULTS.GRANTED) {
                    resolve(true);
                  } else {
                    Alert.alert(
                      'Access Denied',
                      'Background location access is required. Please change location access to "Allow all the time" in your application settings.'
                    );
                    resolve(false);
                  }
                },
              },
            ],
            { cancelable: false }
          );
        });
      }

      return true; // Auto-granted on older Android versions if foreground is accepted
    } catch (err) {
      console.warn('Error executing Android permission sequence:', err);
      return false;
    }
  } else if (Platform.OS === 'ios') {
    try {
      // Request always-authorization on iOS (automatically prompts when-in-use first, then elevates to always)
      const locationStatus = await Geolocation.requestAuthorization('always');
      if (locationStatus === 'granted') {
        return true;
      } else {
        Alert.alert(
          'Action Required',
          'Please set your location settings to "Always Allow" in your iOS System Settings for the application.'
        );
        return false;
      }
    } catch (err) {
      console.warn('Error executing iOS permissions:', err);
      return false;
    }
  }
  return false;
};