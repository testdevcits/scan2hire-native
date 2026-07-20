 

import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { 
  Coffee, 
  Briefcase, 
  Target, 
  Clock, 
  ArrowUpRight 
} from 'lucide-react-native';
import { COLORS, FONT_SIZE, FONTS, RADIUS, SPACING } from '../../constants';
import AppText from '../../components/common/AppText';

interface ProgressData {
  workPercent: number;
  breakPercent: number;
  complete: boolean;
}

interface TimerMainCardProps {
  progress: ProgressData;
  TodaysSelfie: string;
  totalTime: string;
  workTime: string;
  breakTime: string;
  targetTime?: string;
}

const TimerMainCard: React.FC<TimerMainCardProps> = ({ 
  progress, 
  TodaysSelfie, 
  totalTime, 
  workTime, 
  breakTime,
  targetTime = "08:30:00"
}) => {
  const size = 130;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate Dash Offsets
  const workStroke = (progress.workPercent / 100) * circumference;
  const breakStroke = (progress.breakPercent / 100) * circumference;
  
  const primaryStatusColor = progress.complete ? COLORS.success : COLORS.success;

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image source={{ uri: TodaysSelfie }} style={styles.avatar} />
          <View>
            <AppText style={styles.title}>Daily Activity</AppText>
            <AppText style={styles.subtitle}>Real-time session</AppText>
          </View>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.pulseDot} />
          <AppText style={styles.liveText}>LIVE</AppText>
        </View>
      </View>

      {/* Main Hero Content: Circle + Main Stats */}
      <View style={styles.heroSection}>
        {/* Left: Circular Progress */}
        <View style={styles.chartContainer}>
          <Svg width={size} height={size}>
            <G rotation="-90" origin={`${center}, ${center}`}>
              {/* Background Ring */}
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={COLORS.grey100}
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Work Segment */}
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={primaryStatusColor}
                strokeWidth={strokeWidth}
                strokeDasharray={`${workStroke} ${circumference}`}
                strokeLinecap="round"
                fill="transparent"
              />
              {/* Break Segment - Starts after work segment */}
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={COLORS.warning}
                strokeWidth={strokeWidth}
                strokeDasharray={`${breakStroke} ${circumference}`}
                strokeDashoffset={-workStroke}
                strokeLinecap="round"
                fill="transparent"
              />
            </G>
          </Svg>
          {/* Center Text in Circle */}
          <View style={styles.circleCenterText}>
            <Clock size={16} color={COLORS.textLight} />
            <AppText style={styles.mainTime}>{totalTime.split(':').slice(0,2).join(':')}</AppText>
            <AppText style={styles.timeLabel}>HRS:MIN</AppText>
          </View>
        </View>

        {/* Right: Key Stats */}
        <View style={styles.statsColumn}>
          <View  >
            <AppText style={styles.statHeader}>TOTAL DURATION</AppText>
            <AppText style={styles.statLargeValue}>{totalTime}</AppText>
          </View>

          <View style={styles.targetRow}>
            <View style={styles.targetIcon}>
              <Target size={14} color={COLORS.textSecondary} />
            </View>
            <View>
              <AppText style={styles.targetLabel}>DAILY TARGET</AppText>
              <AppText style={styles.targetValue}>{targetTime}</AppText>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Action Cards */}
      <View style={styles.footerGrid}>
        <View style={styles.bottomCard}>
          <View style={[styles.iconCircle, { backgroundColor: '#EEF2FF' }]}>
            <Briefcase size={16} color={COLORS.primary} />
          </View>
          <View style={styles.bottomCardText}>
            <AppText style={styles.bottomLabel}>Work Time</AppText>
            <AppText style={styles.bottomValue}>{workTime}</AppText>
          </View>
        </View>

        <View style={styles.bottomCard}>
          <View style={[styles.iconCircle, { backgroundColor: '#FFFBEB' }]}>
            <Coffee size={16} color={COLORS.warning} />
          </View>
          <View style={styles.bottomCardText}>
            <AppText style={styles.bottomLabel}>Break Time</AppText>
            <AppText style={styles.bottomValue}>{breakTime}</AppText>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 1,
    marginBottom:10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.grey100,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: -2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.error,
  },
  liveText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.error,
  },
  heroSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  chartContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circleCenterText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainTime: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  timeLabel: {
    fontSize: 8,
    fontFamily: FONTS.bold,
    color: COLORS.textLight,
    letterSpacing: 0.5,
  },
  statsColumn: {
    flex: 1,
    gap: SPACING.lg,
  },
  statHeader: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: COLORS.textLight,
    letterSpacing: 1,
  },
  statLargeValue: {
    fontSize: 26,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  targetIcon: {
    padding: 8,
    backgroundColor: COLORS.grey50,
    borderRadius: RADIUS.md,
  },
  targetLabel: {
    fontSize: 9,
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
  },
  targetValue: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  footerGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.grey50,
    paddingTop: SPACING.lg,
  },
  bottomCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomCardText: {
    flex: 1,
  },
  bottomLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontFamily: FONTS.medium,
  },
  bottomValue: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
});

export default TimerMainCard;