import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { COLORS, FONT_SIZE, FONTS, RADIUS, SPACING } from '../../constants';
import AppText from '../../components/common/AppText';

interface TimelineEvent {
  id: string;
  title: string;
  time: string;
}

interface TodaystimeLinesProps {
  timelineEvents: TimelineEvent[];
}

const TodaystimeLines = ({ timelineEvents }: TodaystimeLinesProps) => {
  return (
    <View style={styles.timelineCard}>
      <AppText style={styles.cardSectionHeader}>Today's Timeline</AppText>
      <View style={styles.timelineContainer}>
        {timelineEvents.map((ev, idx) => (
          <View key={ev.id} style={styles.timelineRow}>
            <View style={styles.timelineLeftTrack}>
              <View style={styles.timelineNodePoint} />
              {idx !== timelineEvents?.length - 1 && (
                <View style={styles.timelineTrackLine} />
              )}
            </View>
            <View style={styles.timelineRightContent}>
              <AppText style={styles.timelineNodeTitle}>{ev?.title}</AppText>
              <AppText style={styles.timelineNodeTime}>{ev?.time}</AppText>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default TodaystimeLines;
const styles = StyleSheet.create({
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
});
