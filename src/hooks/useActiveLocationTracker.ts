// src/hooks/useActiveLocationTracker.ts
import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Platform, PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
  
export const useActiveLocationTracker = () => {
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Request runtime location permissions
  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      return auth === 'granted';
    }

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Android Permission Request Error:', err);
        return false;
      }
    }
    return false;
  };

  // Perform GPS query and transmit live data to backend
  const syncLocationWithBackend = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      // Guard: Don't ping API if the user is logged out (no token)
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, speed, heading } = position.coords;

          try {
            // await driverService.updateLocation({
            //   lat: latitude,
            //   lng: longitude,
            //   speed: speed ?? 0,
            //   heading: heading ?? 0,
            // });
            
            console.log('📡 [3s Interval] Coordinates Broadcasted successfully:', { latitude, longitude });
          } catch (apiError) {
            console.warn('📡 [3s Interval] API update failed:', apiError);
          }
        },
        (error) => {
          console.warn('📡 [3s Interval] GPS hardware locked out:', error.message);
        },
        // Low timeout/cache age parameters optimized for rapid 3-second polls
        { enableHighAccuracy: true, timeout: 4500, maximumAge: 1000 }
      );
    } catch (err) {
      console.warn('Location Tracker runtime execution error:', err);
    }
  };

  // Listen to Active vs Background App States
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Control 3-second background polling lifecycle based on active state [1]
  useEffect(() => {
    if (appStateVisible === 'active') {
      console.log('⚡ App is active. Starting location interval tracker (3000ms)...');
      
      // Execute once immediately when app is opened
      syncLocationWithBackend();

      // Set up the recurring 3-second loop [1]
      intervalRef.current = setInterval(() => {
        syncLocationWithBackend();
      }, 3000);
    } else {
      console.log('🛑 App backgrounded. Location tracker interval paused.');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [appStateVisible]);
};

 