// src/utils/permissionUtils.ts
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

export const requestAppPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
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
          'Camera and location access are required to start attendance.'
        );
        return false;
      }

      return true;
    } catch (err) {
      console.warn('Error executing Android permission sequence:', err);
      return false;
    }
  } else if (Platform.OS === 'ios') {
    try {
      const locationStatus = await Geolocation.requestAuthorization('whenInUse');
      if (locationStatus === 'granted') {
        return true;
      } else {
        Alert.alert(
          'Action Required',
          'Please allow location access to start attendance.'
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
