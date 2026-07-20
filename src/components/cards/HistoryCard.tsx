import React from 'react';
import { View, StyleSheet } from 'react-native';
import { 
  LogIn, 
  LogOut, 
  Briefcase, 
  Coffee, 
  Calendar,
  ChevronRight
} from 'lucide-react-native';
import { COLORS, FONT_SIZE, FONTS, RADIUS, SPACING } from '../../constants';
import { AttendanceRecord } from '../../api/services/apiService';
import { formatMinutes } from '../../utils/helperFuntions';
import AppText from '../common/AppText';

// Define a proper Interface for Props instead of ListRenderItem
interface HistoryCardProps {
  item: AttendanceRecord;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ item }) => {
  const getStatusConfig = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return { label: 'Present', color: COLORS.success, bg: '#F0FDF4' };
      case 'half_day':
        return { label: 'Half Day', color: COLORS.warning, bg: '#FFFBEB' };
      case 'running':
        return { label: 'In Progress', color: COLORS.info, bg: '#EFF6FF' };
      default:
        return { label: 'Absent', color: COLORS.error, bg: '#FEF2F2' };
    }
  };

  const statusCfg = getStatusConfig(item.status);

  const clockIn = item.loginAt
    ? new Date(item.loginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    : '--:--';
  const clockOut = item.logoutAt
    ? new Date(item.logoutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    : '--:--';

  const displayDate = new Date(item.dateKey).toLocaleDateString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <View style={styles.container}>
      {/* Top Row: Date and Status Badge */}
      <View style={styles.header}>
        <View style={styles.dateSection}>
          <Calendar size={14} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
          <AppText style={styles.dateText}>{displayDate}</AppText>
        </View>
        <View style={[styles.badge, { backgroundColor: statusCfg.bg }]}>
          <View style={[styles.dot, { backgroundColor: statusCfg.color }]} />
          <AppText style={[styles.badgeText, { color: statusCfg.color }]}>
            {statusCfg.label}
          </AppText>
        </View>
      </View>

      {/* Center Section: Punch Times */}
      <View style={styles.timeGrid}>
        <View style={styles.timeBox}>
          <View style={styles.iconCircle}>
            <LogIn size={14} color={COLORS.success} />
          </View>
          <View>
            <AppText style={styles.timeLabel}>PUNCH IN</AppText>
            <AppText style={styles.timeValue}>{clockIn}</AppText>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.timeBox}>
          <View style={styles.iconCircle}>
            <LogOut size={14} color={COLORS.error} />
          </View>
          <View>
            <AppText style={styles.timeLabel}>PUNCH OUT</AppText>
            <AppText style={styles.timeValue}>{clockOut}</AppText>
          </View>
        </View>
      </View>

      {/* Bottom Section: Totals */}
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Briefcase size={12} color={COLORS.textLight} />
          <AppText style={styles.footerValue}>{formatMinutes(item.totalWorkMinutes)}</AppText>
          <AppText style={styles.footerLabel}>Work</AppText>
        </View>
        <View style={styles.footerItem}>
          <Coffee size={12} color={COLORS.textLight} />
          <AppText style={styles.footerValue}>{formatMinutes(item.totalBreakMinutes)}</AppText>
          <AppText style={styles.footerLabel}>Breaks</AppText>
        </View>
        <ChevronRight size={16} color={COLORS.grey300} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.round,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  timeGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.grey50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeLabel: {
    fontSize: 9,
    fontFamily: FONTS.bold,
    color: COLORS.textLight,
    letterSpacing: 0.5,
  },
  timeValue: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.divider,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grey50,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    gap: SPACING.md,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerValue: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  footerLabel: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
});

export default HistoryCard;