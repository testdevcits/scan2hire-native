


// src/screens/HistoryScreen.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ListRenderItem,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../../constants';
import { AttendanceRecord, attendanceService } from '../../api/services/apiService';
import { useDispatch, useSelector } from 'react-redux';
import { UserProfile } from '../../types/user';
import { ConfirmationModal, Header, HistoryCard } from '../../components';
import styles from './styles.history';
import { useNavigation } from '@react-navigation/native';
import { logoutUser } from '../../redux/slices/authSlice';

type FilterType = 'all' | 'today' | 'yesterday';
interface AuthState {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
}
interface RootState {
  auth: AuthState;
}
const HistoryScreen = () => {
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<any>();


  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await attendanceService.getAttendanceHistory();
      if (res.success && res.data) {
        setHistory(res.data);
      }
    } catch (error) {
      console.log('Error pulling history records:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };



  const getTodayString = (): string => {
    return new Date().toISOString().split('T')[0];
  };

  const getYesterdayString = (): string => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  };

  // Filter history list based on date tabs
  const filteredHistory = useMemo(() => {
    if (activeFilter === 'today') {
      const todayStr = getTodayString();
      return history.filter((item) => item.dateKey === todayStr);
    }
    if (activeFilter === 'yesterday') {
      const yesterdayStr = getYesterdayString();
      return history.filter((item) => item.dateKey === yesterdayStr);
    }
    return history;
  }, [history, activeFilter]);

  const renderItem: ListRenderItem<AttendanceRecord> = ({ item }) => {
    return <HistoryCard item={item} />;
  };
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  const handleLogout = () => {
    setShowLogoutModal(!showLogoutModal)
  }


  return (
    <View style={styles.safeContainer}>
      <View style={styles.container}>
        {/* Place the custom header here */}
        <Header
          user={user}
          onLogout={handleLogout}

        />

        {/* Screen Header */}
        <View style={styles.header}>
          <Text style={styles.titleText}>Attendance Records</Text>
          <Text style={styles.subtitleText}>Review your recent punch activity</Text>
        </View>

        {/* Quick Date-Filter Bar */}
        <View style={styles.filterBar}>
          {(['all', 'today', 'yesterday'] as FilterType[]).map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[
                styles.filterTab,
                activeFilter === filter && styles.filterTabActive,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  activeFilter === filter && styles.filterTabTextActive,
                ]}
              >
                {filter.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content Listing Area */}
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loaderText}>Loading history...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredHistory}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No attendance records found.</Text>
                <Text style={styles.emptySubText}>
                  {activeFilter === 'all'
                    ? 'Swipe down to sync recent data.'
                    : `No records match the filter: ${activeFilter.toUpperCase()}`}
                </Text>
              </View>
            }
          />
        )}
      </View>

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
      />
    </View>
  );
}

export default HistoryScreen

