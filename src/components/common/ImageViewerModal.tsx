import React, { memo } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Dimensions,
  TouchableOpacity,
  Image,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { ChevronLeft, Share2, MoreVertical, Download } from 'lucide-react-native';
import { COLORS, FONTS, SPACING } from '../../constants';
import AppText from './AppText';

const { width, height } = Dimensions.get('window');

interface ImageViewerModalProps {
  isVisible: boolean;
  onClose: () => void;
  imageUrl?: string;
  title?: string;
  subtitle?: string;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  isVisible,
  onClose,
  imageUrl,
  title,
  subtitle,
}) => {
  if (!isVisible) return null;

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade" // Standard professional fade
      onRequestClose={onClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="black" />

      <View style={styles.container}>
        {/* 1. Transparent Header Overlay */}
        <SafeAreaView style={styles.headerWrapper}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                onPress={onClose}
                style={styles.iconBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ChevronLeft color="white" size={28} />
              </TouchableOpacity>

              <View style={styles.headerTextContainer}>
                <AppText style={styles.headerTitle} numberOfLines={1}>
                  {title || 'View Photo'}
                </AppText>
                {subtitle && (
                  <AppText style={styles.headerSubtitle} numberOfLines={1}>
                    {subtitle}
                  </AppText>
                )}
              </View>
            </View>

            {/* <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconBtn}>
                <Download color="white" size={22} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <Share2 color="white" size={22} />
              </TouchableOpacity>
            </View> */}
          </View>
        </SafeAreaView>

        {/* 2. Main Image Content */}
        <View style={styles.imageContent}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.fullImage}
              resizeMode="contain" // Ensures whole horse/document is visible
            />
          ) : (
            <View style={styles.errorContainer}>
              <AppText style={{ color: 'white' }}>Image not found</AppText>
            </View>
          )}
        </View>

        {/* 3. Bottom Gradient/Overlay (Optional - for extra premium look) */}
        <View style={styles.footerOffset} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Pure black like WhatsApp
  },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark overlay for text readability
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    paddingVertical: Platform.OS === 'android' ? SPACING.md : SPACING.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.md,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  headerTextContainer: {
    marginLeft: SPACING.xs,
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontFamily: FONTS.bold,
    fontSize: 18,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginTop: -2,
  },
  iconBtn: {
    padding: SPACING.sm,
  },
  imageContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: width,
    height: height,
  },
  errorContainer: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  footerOffset: {
    height: 60, // Mimics space for bottom controls if needed later
  }
});

export default memo(ImageViewerModal);