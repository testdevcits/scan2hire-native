import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const BackgroundService = require('react-native-background-actions');
const BackgroundFetch = require('react-native-background-fetch');
import Geolocation from 'react-native-geolocation-service';
import axiosClient from '../api/axiosClient';
import { LocationCoords } from '../api/services/apiService';

const TRACKING_ACTIVE_KEY = 'attendanceLocationTrackingActive';
const SYNC_INTERVAL_MS = 10000;

const sleep = (time: number) => new Promise<void>((resolve) => setTimeout(resolve, time));

const requestLocationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    const auth = await Geolocation.requestAuthorization('always');
    return auth === 'granted';
  }

  const foreground = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  ]);

  const fineLocationGranted =
    foreground[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
    PermissionsAndroid.RESULTS.GRANTED;

  if (!fineLocationGranted) return false;

  if (Number(Platform.Version) >= 29) {
    const background = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
    );
    if (background !== PermissionsAndroid.RESULTS.GRANTED) {
      console.warn('[attendance:location:bg] Background location permission not granted.');
    }
  }

  if (Number(Platform.Version) >= 33) {
    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  }

  return true;
};

export const readDeviceLocation = (): Promise<LocationCoords> =>
  new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      reject,
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
        forceRequestLocation: true,
        showLocationDialog: true,
        accuracy: {
          android: 'high',
          ios: 'best',
        },
      }
    );
  });

export const syncAttendanceLocationOnce = async (source = 'foreground') => {
  const token = await AsyncStorage.getItem('userToken');
  if (!token) return null;

  const hasPermission = await requestLocationPermissions();
  if (!hasPermission) return null;

  const location = await readDeviceLocation();
  const response = await axiosClient.post('/users/attendance/location', {
    location: {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy ? Math.round(location.accuracy) : 15,
    },
  });

  console.log('[attendance:location:native]', {
    source,
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy,
  });

  return response as any;
};

const backgroundLocationTask = async () => {
  while (BackgroundService.isRunning()) {
    const trackingActive = await AsyncStorage.getItem(TRACKING_ACTIVE_KEY);
    if (trackingActive !== 'true') {
      await BackgroundService.stop();
      return;
    }

    try {
      await syncAttendanceLocationOnce('background-service');
    } catch (error: any) {
      console.warn('[attendance:location:bg] Sync failed:', error?.message || error);
    }

    await sleep(SYNC_INTERVAL_MS);
  }
};

const backgroundOptions = {
  taskName: 'Scan2Hire Attendance',
  taskTitle: 'Attendance location active',
  taskDesc: 'Office location is syncing while your shift is running.',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#F04438',
  linkingURI: 'scan2hire://attendance',
  parameters: {},
};

export const startAttendanceLocationTracking = async () => {
  await AsyncStorage.setItem(TRACKING_ACTIVE_KEY, 'true');

  if (!BackgroundService.isRunning()) {
    await BackgroundService.start(backgroundLocationTask, backgroundOptions);
  }
};

export const stopAttendanceLocationTracking = async () => {
  await AsyncStorage.removeItem(TRACKING_ACTIVE_KEY);
  if (BackgroundService.isRunning()) {
    await BackgroundService.stop();
  }
};

export const initAttendanceBackgroundFetch = async () => {
  await BackgroundFetch.configure(
    {
      minimumFetchInterval: 15,
      stopOnTerminate: false,
      startOnBoot: true,
      enableHeadless: true,
      forceAlarmManager: true,
      requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
    },
    async (taskId: string) => {
      try {
        const trackingActive = await AsyncStorage.getItem(TRACKING_ACTIVE_KEY);
        if (trackingActive === 'true') {
          await syncAttendanceLocationOnce('background-fetch');
        }
      } catch (error: any) {
        console.warn('[attendance:location:fetch] Sync failed:', error?.message || error);
      } finally {
        BackgroundFetch.finish(taskId);
      }
    },
    async (taskId: string) => {
      BackgroundFetch.finish(taskId);
    }
  );
};

export const attendanceBackgroundFetchHeadlessTask = async (event: any) => {
  const taskId = event?.taskId || event;

  try {
    const trackingActive = await AsyncStorage.getItem(TRACKING_ACTIVE_KEY);
    if (trackingActive === 'true') {
      await syncAttendanceLocationOnce('background-fetch-headless');
    }
  } catch (error: any) {
    console.warn('[attendance:location:headless] Sync failed:', error?.message || error);
  } finally {
    if (taskId) {
      BackgroundFetch.finish(taskId);
    }
  }
};

export const registerAttendanceLocationHeadlessTask = () => {
  BackgroundFetch.registerHeadlessTask(attendanceBackgroundFetchHeadlessTask);
};
