


// src/screens/HistoryScreen.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ListRenderItem,
  TouchableOpacity,
} from 'react-native';
import { COLORS, FONT_SIZE, FONTS, RADIUS, SPACING } from '../../constants';
import { AttendanceRecord, attendanceService } from '../../api/services/apiService';
import { useSelector } from 'react-redux';
import { UserProfile } from '../../types/user';
import { Header } from '../../components';

interface StatusConfig {
  label: string;
  color: string;
  bg: string;
}

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

  // Human-readable format conversion: e.g., 273 minutes -> 4h 33m
  const formatMinutes = (totalMinutes?: number): string => {
    if (!totalMinutes || totalMinutes <= 0) return '0m';
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
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

  const getStatusConfig = (status: AttendanceRecord['status']): StatusConfig => {
    switch (status) {
      case 'present':
        return { label: 'Present', color: COLORS.success, bg: '#DCFCE7' };
      case 'half_day':
        return { label: 'Half Day', color: COLORS.warning, bg: '#FEF3C7' };
      case 'running':
        return { label: 'In Progress', color: COLORS.info, bg: '#DBEAFE' };
      default:
        return { label: 'Absent', color: COLORS.error, bg: '#FEE2E2' };
    }
  };

  const renderItem: ListRenderItem<AttendanceRecord> = ({ item }) => {
    const statusCfg = getStatusConfig(item.status);

    const clockIn = item.loginAt
      ? new Date(item.loginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      : '--:--';
    const clockOut = item.logoutAt
      ? new Date(item.logoutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      : '--:--';

    let displayDate = item.dateKey;
    try {
      const parsedDate = new Date(item.dateKey);
      if (!isNaN(parsedDate.getTime())) {
        displayDate = parsedDate.toLocaleDateString([], {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch (e) {
      console.log('Date formatting error:', e);
    }

    return (
      <View style={[styles.historyCard, { borderLeftColor: statusCfg.color }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.dateText}>{displayDate}</Text>
          <View style={[styles.badge, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.badgeText, { color: statusCfg.color }]}>
              {statusCfg.label}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.metricColumn}>
            <Text style={styles.metricLabel}>In</Text>
            <Text style={styles.metricValue}>{clockIn}</Text>
          </View>

          <View style={styles.metricColumn}>
            <Text style={styles.metricLabel}>Out</Text>
            <Text style={styles.metricValue}>{clockOut}</Text>
          </View>

          <View style={styles.metricColumn}>
            <Text style={styles.metricLabel}>Work Time</Text>
            <Text style={styles.metricValue}>
              {formatMinutes(item.totalWorkMinutes)}
            </Text>
          </View>

          <View style={styles.metricColumn}>
            <Text style={styles.metricLabel}>Break Time</Text>
            <Text style={styles.metricValue}>
              {formatMinutes(item.totalBreakMinutes)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.safeContainer}>
      <View style={styles.container}>
        {/* Place the custom header here */}
        <Header
          user={user}
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
    </View>
  );
}

export default HistoryScreen

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.md,
  },
  titleText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.title,
    color: COLORS.textPrimary,
  },
  subtitleText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.grey100,
    borderRadius: RADIUS.round,
    padding: 4,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.round,
  },
  filterTabActive: {
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  filterTabText: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  filterTabTextActive: {
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  historyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4, // Subtle status indicator accent bar
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  dateText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  badgeText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.xs,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricColumn: {
    alignItems: 'flex-start',
    flex: 1,
  },
  metricLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  metricValue: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  emptySubText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
});
