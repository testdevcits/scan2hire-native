// src/screens/DashboardScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  AppState,
  AppStateStatus,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Geolocation from 'react-native-geolocation-service';
import ImagePicker, { Image as PickerImage } from 'react-native-image-crop-picker';
import { AlertTriangle, LogOut } from 'lucide-react-native';

import { COLORS, SPACING } from '../../constants';
import { logoutUser } from '../../redux/slices/authSlice';
import { requestAppPermissions } from '../../utils/permissionUtils';
import { UserProfile } from '../../types/user';
import { AttendanceRecord, attendanceService, BreakType } from '../../api/services/apiService';
import { ConfirmationModal, Header, ImageViewerModal } from '../../components';
import { useNavigation } from '@react-navigation/native';
import TimerMainCard from './TimerMainCard';
import ProfileCollapsibleCard from './ProfileCollapsibleCard';
import TodaystimeLines from './TodaystimeLines';
import styles from './styles.dashboard';
import Toast from 'react-native-toast-message';
import {
  startAttendanceLocationTracking,
  stopAttendanceLocationTracking,
  syncAttendanceLocationOnce,
} from '../../services/locationTrackingService';


interface AuthState {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
}

interface RootState {
  auth: AuthState;
}

interface TimelineEvent {
  id: string;
  title: string;
  time: string;
}

type LocationCoords = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

type LocationReadOptions = {
  allowEmulatorDefault?: boolean;
};

const EMULATOR_DEFAULT_LOCATION = {
  latitude: 37.4219983,
  longitude: -122.084,
};

const isNearCoordinate = (
  coords: LocationCoords,
  target: LocationCoords,
  tolerance = 0.0005
) =>
  Math.abs(coords.latitude - target.latitude) <= tolerance &&
  Math.abs(coords.longitude - target.longitude) <= tolerance;

const getApiMessage = (error: any, fallback: string) =>
  error?.message ||
  error?.response?.data?.message ||
  error?.raw?.message ||
  fallback;

export default function DashboardScreen() {
  const dispatch = useDispatch<any>();
  const { user } = useSelector((state: RootState) => state.auth);
  const navigation = useNavigation<any>();
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [selecttedPhotoUrl, setSelectedPhoto] = useState('')



  const [loading, setLoading] = useState<boolean>(false);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);


  const TodaysSelfie = todayRecord?.loginSelfie?.url

  // Timer States
  const [totalTime, setTotalTime] = useState<string>('00:00:00');
  const [workTime, setWorkTime] = useState<string>('00:00:00');
  const [breakTime, setBreakTime] = useState<string>('00:00:00');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Break Selector & Profile Collapse State
  const [selectedBreakType, setSelectedBreakType] = useState<BreakType>('lunch');
  const [isProfileCollapsed, setIsProfileCollapsed] = useState<boolean>(false);
  const [onBreak, setOnBreak] = useState<boolean>(false);

  // Confirmation Modal States [1]
  const [showClockOutModal, setShowClockOutModal] = useState<boolean>(false);
  const [clockOutLoading, setClockOutLoading] = useState<boolean>(false);


  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [locationMessage, setLocationMessage] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<string>('');
  const [actionTone, setActionTone] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const locationSyncRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationSyncBusyRef = useRef<boolean>(false);
  const lastLocationActionRef = useRef<string | null>(null);


  // Break options definition
  const breakOptions: { label: string; value: BreakType }[] = [
    { label: 'Lunch', value: 'lunch' },
    { label: 'Tea', value: 'tea' },
    { label: 'Call', value: 'call' },
    { label: 'Personal', value: 'personal' },
    { label: 'Other', value: 'other' },
  ];

  useEffect(() => {
    fetchTodayStatus();
    return () => {
      stopTimer();
      stopLocationSync(false);
    };
  }, []);

  useEffect(() => {
    if (todayRecord && todayRecord.status === 'running') {
      startTimer();
    } else {
      stopTimer();
      calculateStaticTimes();
    }
    // Timer uses the latest todayRecord snapshot and is restarted intentionally here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayRecord, onBreak]);

  useEffect(() => {
    if (todayRecord?.status === 'running') {
      startLocationSync();
    } else {
      stopLocationSync(true);
    }

    return () => stopLocationSync(false);
    // Location polling must start/stop only when running status changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayRecord?.status]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active' && todayRecord?.status === 'running') {
        syncCurrentLocation(true);
        fetchTodayStatus();
      }
    });

    return () => subscription.remove();
    // Foreground refresh should only depend on attendance running state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayRecord?.status]);





  const fetchTodayStatus = async () => {
    try {
      setLoading(true);
      const res = await attendanceService.getAttendanceHistory();
      if (res.success && res.data && res.data.length > 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        const match = res.data.find((rec) => rec.dateKey === todayStr);
        if (match) {
          setTodayRecord(match);
          if (match.loginLocation) {
            setLocationMessage(
              match.loginLocation.withinRadius
                ? 'Inside office radius. Work time is active.'
                : `Outside office radius by ${match.loginLocation.distanceFromOfficeMeters || 0}m. Work time is paused.`
            );
          }
          // Check if currently on an active break (startAt exists but no endAt)
          const activeBreak = match.breaks?.find((b) => !b.endAt);
          if (activeBreak) {
            setOnBreak(true);
            if (activeBreak.type !== 'location') {
              setSelectedBreakType(activeBreak.type as BreakType);
            }
          } else {
            setOnBreak(false);
          }
        } else {
          setTodayRecord(null);
          setOnBreak(false);
          setLocationMessage('');
        }
      } else {
        setTodayRecord(null);
        setOnBreak(false);
        setLocationMessage('');
      }
    } catch (e) {
      setActionTone('error');
      setActionMessage(getApiMessage(e, 'Unable to fetch attendance status.'));
      console.log('Error fetching daily status:', e);
    } finally {
      setLoading(false);
    }
  };

  // Live Timer Computations
  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      if (!todayRecord) return;

      const now = new Date().getTime();
      const login = new Date(todayRecord.loginAt).getTime();

      // Total elapsed seconds since Login
      const elapsedTotalSecs = Math.floor((now - login) / 1000);

      // Compute break seconds
      let completedBreakSecs = 0;
      let activeBreakSecs = 0;

      todayRecord.breaks?.forEach((b) => {
        if (b.endAt) {
          completedBreakSecs += Math.floor((new Date(b.endAt).getTime() - new Date(b.startAt).getTime()) / 1000);
        } else {
          activeBreakSecs += Math.floor((now - new Date(b.startAt).getTime()) / 1000);
        }
      });

      const totalBreakSecs = completedBreakSecs + activeBreakSecs;
      const totalWorkSecs = elapsedTotalSecs - totalBreakSecs;

      setTotalTime(formatSeconds(elapsedTotalSecs));
      setBreakTime(formatSeconds(totalBreakSecs));
      setWorkTime(formatSeconds(totalWorkSecs > 0 ? totalWorkSecs : 0));
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startLocationSync = () => {
    stopLocationSync(false);
    startAttendanceLocationTracking().catch((error) => {
      console.warn('[attendance:location:bg] Start failed:', error?.message || error);
    });
    syncCurrentLocation(true);
    locationSyncRef.current = setInterval(() => {
      syncCurrentLocation(true);
    }, 10000);
  };

  const stopLocationSync = (stopBackground = false) => {
    if (locationSyncRef.current) {
      clearInterval(locationSyncRef.current);
      locationSyncRef.current = null;
    }
    locationSyncBusyRef.current = false;
    lastLocationActionRef.current = null;
    if (stopBackground) {
      stopAttendanceLocationTracking().catch((error) => {
        console.warn('[attendance:location:bg] Stop failed:', error?.message || error);
      });
    }
  };

  const readCurrentLocation = (
    options: LocationReadOptions = {}
  ): Promise<LocationCoords> => {
    const readPosition = (
      enableHighAccuracy: boolean,
      timeout: number,
      maximumAge: number
    ) =>
      new Promise<LocationCoords>((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (position) => {
            const coords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            };

            if (
              !options.allowEmulatorDefault &&
              (position.mocked || isNearCoordinate(coords, EMULATOR_DEFAULT_LOCATION))
            ) {
              reject(
                new Error(
                  'Device is sending emulator/mock location. Set emulator GPS to office location or test on a real phone near office.'
                )
              );
              return;
            }

            resolve(coords);
          },
          reject,
          {
            enableHighAccuracy,
            timeout,
            maximumAge,
            accuracy: {
              android: enableHighAccuracy ? 'high' : 'balanced',
              ios: enableHighAccuracy ? 'best' : 'nearestTenMeters',
            },
            showLocationDialog: true,
            forceRequestLocation: true,
          }
        );
      });

    return readPosition(true, 20000, 0).catch((firstError) =>
      readPosition(false, 20000, 0).catch(() => {
        throw firstError;
      })
    );
  };

  const syncCurrentLocation = async (silent = false) => {
    if (!todayRecord || todayRecord.status !== 'running' || locationSyncBusyRef.current) {
      return;
    }

    locationSyncBusyRef.current = true;

    try {
      const res = await syncAttendanceLocationOnce('dashboard');

      if (res.success && res.data?.attendance) {
        const syncedAttendance = res.data.attendance as AttendanceRecord;
        setLocationMessage(
          res.data.withinRadius
            ? 'Inside office radius. Work time is active.'
            : `Outside office radius by ${res.data.distanceFromOfficeMeters || 0}m. Work time is paused.`
        );
        setTodayRecord(syncedAttendance);
        const activeBreak = syncedAttendance.breaks?.find((b) => !b.endAt);
        setOnBreak(Boolean(activeBreak));
        if (activeBreak?.type && activeBreak.type !== 'location') {
          setSelectedBreakType(activeBreak.type as BreakType);
        }
      }

      const action = res.data?.action;
      if (
        action &&
        ['paused', 'resumed'].includes(action) &&
        lastLocationActionRef.current !== action
      ) {
        lastLocationActionRef.current = action;
        // Alert.alert(action === 'paused' ? 'Work Paused' : 'Work Resumed', res.message);
        Toast.show({
          type: 'success',
          text1: action === 'paused' ? 'Work Paused' : 'Work Resumed',
          text2: res.message,
          position: 'top', // or 'bottom'
        });

      } else if (!silent && res.message) {
        Alert.alert('Location Synced', res.message);
      }
    } catch (error: any) {
      const message = getApiMessage(error, 'Please turn on GPS and try again.');
      setLocationMessage(message);
      if (!silent) {
        setActionTone('error');
        setActionMessage(message);
        Alert.alert('Location Sync Failed', message);
      }
    } finally {
      locationSyncBusyRef.current = false;
    }
  };

  const calculateStaticTimes = () => {
    if (!todayRecord) {
      setTotalTime('00:00:00');
      setWorkTime('00:00:00');
      setBreakTime('00:00:00');
      return;
    }

    const login = new Date(todayRecord.loginAt).getTime();
    const logout = todayRecord.logoutAt ? new Date(todayRecord.logoutAt).getTime() : new Date().getTime();
    const elapsedTotalSecs = Math.floor((logout - login) / 1000);

    let breakSecs = 0;
    todayRecord.breaks?.forEach((b) => {
      const breakEnd = b.endAt ? new Date(b.endAt).getTime() : new Date().getTime();
      breakSecs += Math.floor((breakEnd - new Date(b.startAt).getTime()) / 1000);
    });

    const workSecs = elapsedTotalSecs - breakSecs;

    setTotalTime(formatSeconds(elapsedTotalSecs));
    setBreakTime(formatSeconds(breakSecs));
    setWorkTime(formatSeconds(workSecs > 0 ? workSecs : 0));
  };

  const formatSeconds = (totalSeconds: number): string => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return [hrs, mins, secs].map((v) => (v < 10 ? '0' + v : v)).join(':');
  };

  const secondsFromClock = (clock: string): number => {
    const [hrs = '0', mins = '0', secs = '0'] = clock.split(':');
    return Number(hrs) * 3600 + Number(mins) * 60 + Number(secs);
  };

  const getAttendanceProgress = () => {
    const targetSeconds = 8 * 60 * 60 + 30 * 60;
    const workSeconds = secondsFromClock(workTime);
    const breakSeconds = secondsFromClock(breakTime);
    const workPercent = Math.min(100, (workSeconds / targetSeconds) * 100);
    const breakPercent = Math.min(100 - workPercent, (breakSeconds / targetSeconds) * 100);

    return {
      complete: workSeconds >= targetSeconds,
      workPercent,
      breakPercent,
    };
  };

  const handleStartAttendance = async () => {
    const permissionsGranted = await requestAppPermissions();
    if (!permissionsGranted) {
      return;
    }

    ImagePicker.openCamera({
      width: 500,
      height: 500,
      cropping: true,
      useFrontCamera: true,
      includeBase64: true,
      mediaType: 'photo',
    })
      .then(async (image: PickerImage) => {
        if (!image.data) return;
        setLoading(true);
        try {
          const coords = await readCurrentLocation();
          const res = await attendanceService.startAttendance(image.data!, coords);

          if (res.success) {
            const message = res.message || 'Attendance started successfully.';
            setActionTone('success');
            setActionMessage(message);
            Alert.alert('Success', message);
            startAttendanceLocationTracking().catch((error) => {
              console.warn('[attendance:location:bg] Start failed:', error?.message || error);
            });
            fetchTodayStatus();
          }
        } catch (error: any) {
          const message = getApiMessage(error, 'Please turn on GPS and try again.');
          setActionTone('error');
          setActionMessage(message);
          // Alert.alert('Start Work Failed', message);

          Toast.show({
            type: 'error',
            text1: 'Start Work Failed',
            text2: message,
          });
        } finally {
          setLoading(false);
        }
      })
      .catch((err) => {
        setLoading(false);
        if (err?.code !== 'E_PICKER_CANCELLED') {
          Alert.alert('Camera Error', err?.message || 'Unable to open camera.');
        }
      });
  };

  const handleEndAttendance = async () => {
    setShowClockOutModal(true);
  };

  const confirmEndAttendance = async () => {
    try {
      setClockOutLoading(true);
      stopLocationSync(true);
      const res = await attendanceService.endAttendance();
      if (res.success) {
        stopAttendanceLocationTracking().catch((error) => {
          console.warn('[attendance:location:bg] Stop failed:', error?.message || error);
        });
        setShowClockOutModal(false);
        const message = res.message || 'Attendance ended successfully.';
        setActionTone('success');
        setActionMessage(message);
        Alert.alert('Shift Ended', message);
        fetchTodayStatus();
      }
    } catch (error: any) {
      const message = getApiMessage(error, 'Checkout failed.');
      setActionTone('error');
      setActionMessage(message);
      Alert.alert('Error', message);
      if (todayRecord?.status === 'running') {
        startLocationSync();
      }
    } finally {
      setClockOutLoading(false);
    }
  };

  const toggleBreak = async () => {
    try {
      setLoading(true);
      if (!onBreak) {
        const res = await attendanceService.startBreak(selectedBreakType);
        if (res.success) {
          setOnBreak(true);
          const message = res.message || `Active ${selectedBreakType} break recorded.`;
          setActionTone('success');
          setActionMessage(message);
          // Alert.alert('Break Started', message);
          Toast.show({
            type: 'success',
            text1: 'Break Started',
            text2: message,
            position: 'top', // or 'bottom'
          });


          fetchTodayStatus();
        }
      } else {
        const res = await attendanceService.endBreak();
        if (res.success) {
          setOnBreak(false);
          const message = res.message || 'Break entry finalized.';
          setActionTone('success');
          setActionMessage(message);
          // Alert.alert('Break Ended', message);

          Toast.show({
            type: 'success',
            text1: 'Break Ended',
            text2: message,
            position: 'top', // or 'bottom'
          });
          fetchTodayStatus();
        }
      }
    } catch (error: any) {
      const message = getApiMessage(error, 'Transaction failed.');
      setActionTone('error');
      setActionMessage(message);
      Alert.alert('Request Failed', message);
    } finally {
      setLoading(false);
    }
  };

  // Generates timeline mapping events dynamically from current day's record
  const generateTimelineEvents = (): TimelineEvent[] => {
    if (!todayRecord) return [];
    const events: TimelineEvent[] = [];

    const formatTime = (isoString: string) => {
      return new Date(isoString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    };

    events.push({
      id: 'login',
      title: 'Login',
      time: formatTime(todayRecord.loginAt),
    });

    todayRecord.breaks?.forEach((b, index) => {
      events.push({
        id: `break-start-${index}`,
        title: `${b.type} break start`,
        time: formatTime(b.startAt),
      });
      if (b.endAt) {
        events.push({
          id: `break-end-${index}`,
          title: `${b.type} break end`,
          time: formatTime(b.endAt),
        });
      }
    });

    if (todayRecord.logoutAt) {
      events.push({
        id: 'logout',
        title: 'Logout',
        time: formatTime(todayRecord.logoutAt),
      });
    }

    return events;
  };

  const getMissingDocuments = (): string[] => {
    if (!user?.employeeProfile?.documents) return [];
    const missing: string[] = [];
    const docs = user.employeeProfile.documents;

    if (!docs.photo) missing.push('photo');
    if (!docs.resume) missing.push('resume');
    return missing;
  };

  const missingDocs = getMissingDocuments();
  const timelineEvents = generateTimelineEvents();
  const progress = getAttendanceProgress();



  const handleLogout = () => {
    setShowLogoutModal(!showLogoutModal)
  }

  return (
    <View style={styles.safeContainer}>
      {/* Place the custom header here */}
      <Header
        user={user}
        onLogout={handleLogout}
        onRefresh={fetchTodayStatus}
        onSettingsPress={() => navigation.navigate('Settings')}
        onPressProfile={() => { setSelectedPhoto(user?.profileImage), setIsViewerVisible(!isViewerVisible) }}
      />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Pending Documents Banner Alert */}
        {/* {missingDocs.length > 0 && (
          <View style={styles.warningBanner}>
            <View style={styles.warningRow}>
              <AlertTriangle size={20} color={COLORS.error} style={{ marginRight: SPACING.sm }} />
              <Text style={styles.warningTitle}>Documents Pending</Text>
            </View>
            <Text style={styles.warningText}>
              Please upload all required documents. Missing: {missingDocs.join(', ')}.
            </Text>
          </View>
        )} */}

        {/* Attendance Timer Display Grid */}

        <TimerMainCard
          progress={progress} TodaysSelfie={TodaysSelfie} totalTime={totalTime} workTime={workTime} breakTime={breakTime}

        />

        {/* Primary Today's Attendance Operations Control */}
        <View style={styles.controlCard}>
          <Text style={styles.controlTitle}>Today's Attendance Operations</Text>
          {/* {!!actionMessage && (
            <View style={[styles.actionNotice, styles[`actionNotice_${actionTone}`]]}>
              <Text style={styles.actionNoticeText}>{actionMessage}</Text>
            </View>
          )} */}

          {!todayRecord ? (
            <View style={styles.clockInContainer}>
              <Text style={styles.clockInPrompt}>You have not clocked in today yet.</Text>
              <TouchableOpacity style={styles.primaryClockInBtn} onPress={handleStartAttendance} disabled={loading}>
                {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.clockInBtnText}>Start Work Shift</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {/* {!!locationMessage && (
                <View
                  style={[
                    styles.locationNotice,
                    todayRecord.loginLocation?.withinRadius === false && styles.locationNoticeWarning,
                  ]}
                >
                  <Text style={styles.locationNoticeText}>{locationMessage}</Text>
                </View>
              )} */}
              {/* Info Overview */}
              {/* <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Status: <Text style={styles.summaryVal}>{todayRecord.status}</Text></Text>
                <Text style={styles.summaryLabel}>Work: <Text style={styles.summaryVal}>{workTime}</Text></Text>
                <Text style={styles.summaryLabel}>Break: <Text style={styles.summaryVal}>{breakTime}</Text></Text>
              </View> */}

              {todayRecord.status === 'running' && (
                <View style={styles.attendanceActionsBlock}>
                  <TouchableOpacity
                    style={[styles.endWorkBtn, loading && { opacity: 0.6 }]}
                    onPress={handleEndAttendance}
                    disabled={loading}
                  >
                    <Text style={styles.actionBtnText}>Clock Out</Text>
                  </TouchableOpacity>

                  <View style={styles.dividerLine} />

                  {/* Horizontal Scroll Selector Pills for Breaks */}
                  <Text style={styles.breakSelectionTitle}>Choose Break Type:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
                    {breakOptions.map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        disabled={onBreak}
                        onPress={() => setSelectedBreakType(opt.value)}
                        style={[
                          styles.pill,
                          selectedBreakType === opt.value && styles.pillSelected,
                          onBreak && selectedBreakType !== opt.value && { opacity: 0.5 }
                        ]}
                      >
                        <Text style={[styles.pillText, selectedBreakType === opt.value && styles.pillTextSelected]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Action triggers */}
                  <TouchableOpacity
                    style={[
                      styles.breakToggleBtn,
                      onBreak ? styles.endBreakBtnColor : styles.startBreakBtnColor,
                      loading && { opacity: 0.6 }
                    ]}
                    onPress={toggleBreak}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.white} />
                    ) : (
                      <Text style={styles.actionBtnText}>{onBreak ? 'End Active Break' : `Start ${selectedBreakType} Break`}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Sequential Timeline Node List */}
        {todayRecord && timelineEvents.length > 0 && (
          <TodaystimeLines timelineEvents={timelineEvents} />
        )}

        {/* User Profile Info Panel */}


        <ProfileCollapsibleCard
          user={user} setIsProfileCollapsed={setIsProfileCollapsed} isProfileCollapsed={isProfileCollapsed}
        />

        {/* Global Exit Trigger */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={18} color={COLORS.error} style={{ marginRight: SPACING.sm }} />
          <Text style={styles.logoutBtnText}>Log Out Session</Text>
        </TouchableOpacity>



        {/* Confirmation Modal overlay component [1] */}
        <ConfirmationModal
          isVisible={showClockOutModal}
          onClose={() => setShowClockOutModal(false)}
          onConfirm={confirmEndAttendance}
          title="Clock Out"
          description="Are you sure you want to end work for today?"
          confirmText="Clock-Out"
          cancelText="Cancel"
          type="danger"
          isLoading={clockOutLoading}
        />


        <ConfirmationModal
          isVisible={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={() => {
            // 1. Close the modal
            setShowLogoutModal(false);

            // 2. Execute the logout function
            dispatch(logoutUser());

            // 3. Reset the navigation stack
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }], // Replace 'Login' with your actual login route name
            });
          }} title="Logout"
          description="Are you sure you want to Logout?"
          confirmText="Log-Out"
          cancelText="Cancel"
          type="danger"
          isLoading={clockOutLoading}
        />


        {isViewerVisible &&
          <ImageViewerModal
            isVisible={isViewerVisible}
            onClose={() => setIsViewerVisible(false)}
            imageUrl={selecttedPhotoUrl}
          />
        }
      </ScrollView>
    </View>
  );
}
