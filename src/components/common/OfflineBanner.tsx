import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WifiOff, Wifi } from 'lucide-react-native';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useNetworkStatus from '../../hooks/useNetworkStatus';
import AppText from './AppText';
import { COLORS, FONTS, FONT_SIZE, RADIUS, SPACING } from '../../constants';

export const OfflineBanner: React.FC = () => {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const insets = useSafeAreaInsets();
  const [showRestored, setShowRestored] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  const isOffline = isConnected === false || isInternetReachable === false;

  useEffect(() => {
    if (isOffline) {
      setWasOffline(true);
      setShowRestored(false);
    } else if (wasOffline && !isOffline) {
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
        setWasOffline(false);
      }, 3200);

      return () => clearTimeout(timer);
    }
  }, [isOffline, wasOffline]);

  if (!isOffline && !showRestored) {
    return null;
  }

  const isRestoredBanner = showRestored && !isOffline;

  return (
    <Animated.View
      entering={SlideInUp.duration(400)}
      exiting={SlideOutUp.duration(400)}
      style={[
        styles.bannerContainer,
        { paddingTop: insets.top + SPACING.xs },
        isRestoredBanner ? styles.onlineBanner : styles.offlineBanner,
      ]}
    >
      <View style={styles.contentRow}>
        <View style={styles.iconCircle}>
          {isRestoredBanner ? (
            <Wifi size={16} color={COLORS.white} />
          ) : (
            <WifiOff size={16} color={COLORS.white} />
          )}
        </View>

        <AppText style={styles.bannerText}>
          {isRestoredBanner
            ? 'Internet Restored • Back Online'
            : 'No Internet Connection • Offline Mode'}
        </AppText>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  offlineBanner: {
    backgroundColor: '#EF4444',
  },
  onlineBanner: {
    backgroundColor: '#10B981',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: RADIUS.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  bannerText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.xs,
    color: COLORS.white,
    letterSpacing: 0.2,
  },
});

export default OfflineBanner;
