import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Briefcase, Coffee, Clock, Target, User } from 'lucide-react-native';

import AppText from '../../components/common/AppText';
import { COLORS, FONT_SIZE, FONTS, RADIUS, SPACING } from '../../constants';

interface ProgressData {
  workPercent: number;
  breakPercent: number;
  complete: boolean;
}

interface TimerMainCardProps {
  progress: ProgressData;
  TodaysSelfie?: string;
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
  targetTime = '08:30:00',
}) => {
  const workColor = progress.complete ? COLORS.success : COLORS.primary;
  const hasSelfie = Boolean(TodaysSelfie);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          {hasSelfie ? (
            <Image source={{ uri: TodaysSelfie }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <User size={20} color={COLORS.primary} />
            </View>
          )}
        </View>
        <View style={styles.headerText}>
          <AppText style={styles.title}>Attendance Timer</AppText>
          <AppText style={styles.subtitle}>Office radius sync runs every 10 seconds</AppText>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.workFill,
            { backgroundColor: workColor, width: `${progress.workPercent}%` },
          ]}
        />
        <View
          style={[
            styles.breakFill,
            {
              left: `${progress.workPercent}%`,
              width: `${progress.breakPercent}%`,
            },
          ]}
        />
        <View style={styles.progressCenter}>
          <Clock size={15} color={COLORS.white} />
          <AppText style={styles.totalTime}>{totalTime}</AppText>
        </View>
      </View>

      <View style={styles.targetRow}>
        <Target size={15} color={progress.complete ? COLORS.success : COLORS.textSecondary} />
        <AppText
          style={[
            styles.targetText,
            progress.complete && styles.targetCompleteText,
          ]}
        >
          Target {targetTime}
        </AppText>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <View style={[styles.iconCircle, { backgroundColor: `${workColor}14` }]}>
            <Briefcase size={16} color={workColor} />
          </View>
          <View>
            <AppText style={styles.metricLabel}>Work Time</AppText>
            <AppText style={styles.metricValue}>{workTime}</AppText>
          </View>
        </View>

        <View style={styles.metricCard}>
          <View style={[styles.iconCircle, { backgroundColor: '#FFFBEB' }]}>
            <Coffee size={16} color={COLORS.warning} />
          </View>
          <View>
            <AppText style={styles.metricLabel}>Break Time</AppText>
            <AppText style={styles.metricValue}>{breakTime}</AppText>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarWrap: {
    marginRight: SPACING.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.grey100,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.primary}12`,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  progressTrack: {
    height: 64,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.grey200,
    overflow: 'hidden',
    justifyContent: 'center',
    position: 'relative',
  },
  workFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
  breakFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.warning,
  },
  progressCenter: {
    alignSelf: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
    backgroundColor: 'rgba(17, 24, 39, 0.32)',
  },
  totalTime: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.xl,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  targetText: {
    marginLeft: 5,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  targetCompleteText: {
    color: COLORS.success,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  metricCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grey50,
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  metricLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontFamily: FONTS.medium,
  },
  metricValue: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.bold,
    marginTop: 2,
  },
});

export default TimerMainCard;
