// src/screens/DashboardScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
  AppState,
  AppStateStatus,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Geolocation from 'react-native-geolocation-service';
import ImagePicker, { Image as PickerImage } from 'react-native-image-crop-picker';
import {
  User,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  LogOut
} from 'lucide-react-native';

import { COLORS, FONT_SIZE, FONTS, RADIUS, SPACING } from '../../constants';
import { logoutUser } from '../../redux/slices/authSlice';
import { requestAppPermissions } from '../../utils/permissionUtils';
import { UserProfile } from '../../types/user';
import { AttendanceRecord, attendanceService, BreakType } from '../../api/services/apiService';
import { ConfirmationModal, Header } from '../../components';
import { useNavigation } from '@react-navigation/native';

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

export default function DashboardScreen() {
  const dispatch = useDispatch<any>();
  const { user } = useSelector((state: RootState) => state.auth);
  const navigation = useNavigation<any>();

  // console.log("====111111111111111====",user)

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
  const [isProfileCollapsed, setIsProfileCollapsed] = useState<boolean>(true);
  const [onBreak, setOnBreak] = useState<boolean>(false);

  // Confirmation Modal States [1]
  const [showClockOutModal, setShowClockOutModal] = useState<boolean>(false);
  const [clockOutLoading, setClockOutLoading] = useState<boolean>(false);


  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
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
      stopLocationSync();
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
      stopLocationSync();
    }

    return () => stopLocationSync();
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
          // Check if currently on an active break (startAt exists but no endAt)
          const activeBreak = match.breaks?.find((b) => !b.endAt);
          if (activeBreak) {
            setOnBreak(true);
            setSelectedBreakType(activeBreak.type as BreakType);
          } else {
            setOnBreak(false);
          }
        } else {
          setTodayRecord(null);
          setOnBreak(false);
        }
      } else {
        setTodayRecord(null);
        setOnBreak(false);
      }
    } catch (e) {
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
    stopLocationSync();
    syncCurrentLocation(true);
    locationSyncRef.current = setInterval(() => {
      syncCurrentLocation(true);
    }, 10000);
  };

  const stopLocationSync = () => {
    if (locationSyncRef.current) {
      clearInterval(locationSyncRef.current);
      locationSyncRef.current = null;
    }
    locationSyncBusyRef.current = false;
    lastLocationActionRef.current = null;
  };

  const syncCurrentLocation = async (silent = false) => {
    if (!todayRecord || todayRecord.status !== 'running' || locationSyncBusyRef.current) {
      return;
    }

    locationSyncBusyRef.current = true;

    Geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await attendanceService.syncLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });

          if (res.success && res.data?.attendance) {
            setTodayRecord(res.data.attendance);
            const activeBreak = res.data.attendance.breaks?.find((b) => !b.endAt);
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
            Alert.alert(action === 'paused' ? 'Work Paused' : 'Work Resumed', res.message);
          } else if (!silent && res.message) {
            Alert.alert('Location Synced', res.message);
          }
        } catch (error: any) {
          if (!silent) {
            Alert.alert('Location Sync Failed', error?.message || 'Unable to sync location.');
          }
        } finally {
          locationSyncBusyRef.current = false;
        }
      },
      () => {
        locationSyncBusyRef.current = false;
        if (!silent) {
          Alert.alert('GPS Error', 'Could not fetch precise GPS. Please try again.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
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
      .then((image: PickerImage) => {
        if (!image.data) return;
        setLoading(true);
        Geolocation.getCurrentPosition(
          async (position) => {
            try {
              const res = await attendanceService.startAttendance(image.data!, {
                latitude: position?.coords?.latitude,
                longitude: position?.coords?.longitude,
                // "latitude": 22.7378479,
                // "longitude": 75.8882395,
                accuracy: position.coords.accuracy,
              });

              if (res.success) {
                Alert.alert('Success', res.message);
                fetchTodayStatus();
              }
            } catch (error: any) {
              Alert.alert('Access Denied', error?.message || 'Unable to clock in.');
            } finally {
              setLoading(false);
            }
          },
          (_err) => {
            setLoading(false);
            Alert.alert('GPS Error', 'Could not fetch precise GPS. Please try again.');
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      })
      .catch((err) => console.log('Camera error:', err));
  };

  const handleEndAttendance = async () => {
    setShowClockOutModal(true);
  };

  const confirmEndAttendance = async () => {
    try {
      setClockOutLoading(true);
      const res = await attendanceService.endAttendance();
      if (res.success) {
        setShowClockOutModal(false);
        Alert.alert('Shift Ended', res.message || 'Attendance ended successfully.');
        fetchTodayStatus();
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Checkout failed.');
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
          Alert.alert('Break Started', `Active ${selectedBreakType} break recorded.`);
          fetchTodayStatus();
        }
      } else {
        const res = await attendanceService.endBreak();
        if (res.success) {
          setOnBreak(false);
          Alert.alert('Break Ended', 'Break entry finalized.');
          fetchTodayStatus();
        }
      }
    } catch (error: any) {
      Alert.alert('Request Failed', error?.message || 'Transaction failed.');
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
    // Mocks based on desktop state
    missing.push('aadhaarCard', 'panCard', 'passbook', 'degree');
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
        onSettingsPress={() => Alert.alert('Settings', 'Navigation configuration can be added here.')}
      />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Pending Documents Banner Alert */}
        {missingDocs.length > 0 && (
          <View style={styles.warningBanner}>
            <View style={styles.warningRow}>
              <AlertTriangle size={20} color={COLORS.error} style={{ marginRight: SPACING.sm }} />
              <Text style={styles.warningTitle}>Documents Pending</Text>
            </View>
            <Text style={styles.warningText}>
              Please upload all required documents. Missing: {missingDocs.join(', ')}.
            </Text>
          </View>
        )}

        {/* Attendance Timer Display Grid */}
        <View style={styles.timerMainCard}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }} >
            <Image source={{ uri: TodaysSelfie }} resizeMode="contain" style={styles.selfieImage} />

            <View >
              <Text style={styles.sectionHeaderTitle}>Attendance Timer</Text>
              <Text style={styles.sectionHeaderSub}>Live tracker for today's activity sessions</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressWorkFill,
                progress.complete && styles.progressCompleteFill,
                { width: `${progress.workPercent}%` },
              ]}
            />
            <View
              style={[
                styles.progressBreakFill,
                {
                  left: `${progress.workPercent}%`,
                  width: `${progress.breakPercent}%`,
                },
              ]}
            />
            <View style={styles.progressCenterText}>
              <Text style={styles.progressValue}>{totalTime}</Text>
              <Text style={styles.progressLabel}>TOTAL TIME</Text>
            </View>
          </View>

          <View style={styles.progressLegendRow}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: progress.complete ? COLORS.success : COLORS.primary },
                ]}
              />
              <Text style={styles.legendText}>Work {workTime}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.warning }]} />
              <Text style={styles.legendText}>Break {breakTime}</Text>
            </View>
            <Text style={styles.targetText}>Target 08:30:00</Text>
          </View>

          <View style={styles.timersGrid}>
            <View style={styles.timerCard}>
              <Text style={styles.timerLabel}>WORK TIME</Text>
              <Text style={[styles.timerValue, { color: COLORS.success }]}>{workTime}</Text>
              <Text style={styles.timerDesc}>Total minus breaks</Text>
            </View>

            <View style={styles.timerCard}>
              <Text style={styles.timerLabel}>BREAK TIME</Text>
              <Text style={[styles.timerValue, { color: COLORS.warning }]}>{breakTime}</Text>
              <Text style={styles.timerDesc}>Total breaks used</Text>
            </View>
          </View>
        </View>

        {/* Primary Today's Attendance Operations Control */}
        <View style={styles.controlCard}>
          <Text style={styles.controlTitle}>Today's Attendance Operations</Text>

          {!todayRecord ? (
            <View style={styles.clockInContainer}>
              <Text style={styles.clockInPrompt}>You have not clocked in today yet.</Text>
              <TouchableOpacity style={styles.primaryClockInBtn} onPress={handleStartAttendance} disabled={loading}>
                {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.clockInBtnText}>Start Work Shift</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {/* Info Overview */}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Status: <Text style={styles.summaryVal}>{todayRecord.status}</Text></Text>
                <Text style={styles.summaryLabel}>Work: <Text style={styles.summaryVal}>{workTime}</Text></Text>
                <Text style={styles.summaryLabel}>Break: <Text style={styles.summaryVal}>{breakTime}</Text></Text>
              </View>

              {todayRecord.status === 'running' && (
                <View style={styles.attendanceActionsBlock}>
                  <TouchableOpacity
                    style={[styles.endWorkBtn, loading && { opacity: 0.6 }]}
                    onPress={handleEndAttendance}
                    disabled={loading}
                  >
                    <Text style={styles.actionBtnText}>End Work Shift</Text>
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
          <View style={styles.timelineCard}>
            <Text style={styles.cardSectionHeader}>Today's Timeline</Text>
            <View style={styles.timelineContainer}>
              {timelineEvents.map((ev, idx) => (
                <View key={ev.id} style={styles.timelineRow}>
                  <View style={styles.timelineLeftTrack}>
                    <View style={styles.timelineNodePoint} />
                    {idx !== timelineEvents.length - 1 && <View style={styles.timelineTrackLine} />}
                  </View>
                  <View style={styles.timelineRightContent}>
                    <Text style={styles.timelineNodeTitle}>{ev.title}</Text>
                    <Text style={styles.timelineNodeTime}>{ev.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* User Profile Info Panel */}
        <View style={styles.profileCollapsibleCard}>
          <TouchableOpacity
            style={styles.profileHeaderRow}
            onPress={() => setIsProfileCollapsed(!isProfileCollapsed)}
            activeOpacity={0.7}
          >
            <View style={styles.profileHeaderLabelBlock}>
              <User size={20} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
              <Text style={styles.profileCardTitle}>My Profile Overview</Text>
            </View>
            {isProfileCollapsed ? <ChevronDown size={20} color={COLORS.textSecondary} /> : <ChevronUp size={20} color={COLORS.textSecondary} />}
          </TouchableOpacity>

          {!isProfileCollapsed && (
            <View style={styles.profileCollapsedBody}>
              <View style={styles.profileGridItem}>
                <Text style={styles.profileFieldLabel}>Employee ID</Text>
                <Text style={styles.profileFieldValue}>{user?.employeeProfile?.employeeId || 'N/A'}</Text>
              </View>

              <View style={styles.profileGridItem}>
                <Text style={styles.profileFieldLabel}>Department</Text>
                <Text style={styles.profileFieldValue}>{user?.employeeProfile?.department || 'N/A'}</Text>
              </View>

              <View style={styles.profileGridItem}>
                <Text style={styles.profileFieldLabel}>Designation</Text>
                <Text style={styles.profileFieldValue}>{user?.employeeProfile?.designation || 'N/A'}</Text>
              </View>

              <View style={styles.profileGridItem}>
                <Text style={styles.profileFieldLabel}>Joining Date</Text>
                <Text style={styles.profileFieldValue}>
                  {user?.employeeProfile?.dateOfJoining
                    ? new Date(user.employeeProfile.dateOfJoining).toLocaleDateString()
                    : 'N/A'}
                </Text>
              </View>

              <View style={styles.profileGridItem}>
                <Text style={styles.profileFieldLabel}>Reporting Manager</Text>
                <Text style={styles.profileFieldValue}>{user?.employeeProfile?.reportingManager || 'N/A'}</Text>
              </View>

              <View style={styles.profileGridItem}>
                <Text style={styles.profileFieldLabel}>Emp Type</Text>
                <Text style={styles.profileFieldValue}>{user?.employeeProfile?.employeeType || 'N/A'}</Text>
              </View>
            </View>
          )}
        </View>

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


      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SPACING.md,
    paddingBottom: 112,
    flexGrow: 1,
  },
  warningBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  warningTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.md,
    color: COLORS.error,
  },
  warningText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.sm,
    color: COLORS.grey700,
    lineHeight: 18,
  },
  timerMainCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  progressTrack: {
    height: 58,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: COLORS.grey200,
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    position: 'relative',
  },
  progressWorkFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  progressCompleteFill: {
    backgroundColor: COLORS.success,
  },
  progressBreakFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.warning,
  },
  progressCenterText: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressValue: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.xl,
    color: COLORS.white,
  },
  progressLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 9,
    color: COLORS.white,
    marginTop: 1,
  },
  progressLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
    marginBottom: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  legendText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  targetText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  selfieImage: {
    height: 50, width: 50,
    borderRadius: 100,
    marginRight: SPACING.sm
  },
  sectionHeaderTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.lg,
    color: COLORS.textPrimary,
  },
  sectionHeaderSub: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,

  },
  timersGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timerCard: {
    flex: 1,
    backgroundColor: COLORS.grey50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginHorizontal: 3,
    alignItems: 'center',
  },
  timerLabel: {
    fontFamily: FONTS.medium,
    fontSize: 9,
    color: COLORS.textLight,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  timerValue: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.lg,
    marginBottom: 4,
  },
  timerDesc: {
    fontFamily: FONTS.regular,
    fontSize: 8,
    color: COLORS.textSecondary,
  },
  controlCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  controlTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingBottom: SPACING.xs,
  },
  clockInContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  clockInPrompt: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  primaryClockInBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: RADIUS.round,
    width: '80%',
    alignItems: 'center',
  },
  clockInBtnText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.md,
    color: COLORS.white,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.grey50,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  summaryLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  summaryVal: {
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  attendanceActionsBlock: {
    marginTop: SPACING.xs,
  },
  endWorkBtn: {
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  dividerLine: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },
  breakSelectionTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  pillsScroll: {
    marginBottom: SPACING.md,
    paddingVertical: 2,
  },
  pill: {
    backgroundColor: COLORS.grey100,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.sm,
  },
  pillSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  pillTextSelected: {
    color: COLORS.white,
  },
  breakToggleBtn: {
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  startBreakBtnColor: {
    backgroundColor: COLORS.warning,
  },
  endBreakBtnColor: {
    backgroundColor: COLORS.success,
  },
  actionBtnText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.sm,
    color: COLORS.white,
  },
  timelineCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardSectionHeader: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  timelineContainer: {
    paddingLeft: SPACING.xs,
  },
  timelineRow: {
    flexDirection: 'row',
    height: 52,
  },
  timelineLeftTrack: {
    alignItems: 'center',
    marginRight: SPACING.md,
    width: 14,
  },
  timelineNodePoint: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    zIndex: 2,
    marginTop: 4,
  },
  timelineTrackLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginVertical: 2,
  },
  timelineRightContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 1,
  },
  timelineNodeTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
  },
  timelineNodeTime: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  profileCollapsibleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  profileHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.grey50,
  },
  profileHeaderLabelBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileCardTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  profileCollapsedBody: {
    padding: SPACING.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  profileGridItem: {
    width: '48%',
    marginBottom: SPACING.md,
  },
  profileFieldLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  profileFieldValue: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
  },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.xl,
  },
  logoutBtnText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.md,
    color: COLORS.error,
  },
});
