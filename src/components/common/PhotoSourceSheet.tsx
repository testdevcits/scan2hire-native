import React, { useCallback, useMemo, useRef, useEffect, memo } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, BackHandler } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { Camera, Image as ImageIcon, Trash2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZE, FONTS, ICON_SIZE } from '../../constants';
import AppText from './AppText';

// Using your provided constants

interface Props {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
  onRemove?: () => void;
  hasImage?: boolean;
}

const PhotoSourceSheet = ({ visible, onClose, onCamera, onGallery, onRemove, hasImage }: Props) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();

  // Handle open/close based on visible prop
  useEffect(() => {
    if (visible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible]);

  // Snap points (height of the sheet)
  const snapPoints = useMemo(() => (hasImage ? ['40%'] : ['32%']), [hasImage]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsAtIndex={-1} appearsAtIndex={0} opacity={0.5} />
    ),
    [],
  );

  const handlePress = (action: () => void) => {
    action();
    onClose();
  };

  return (

    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={styles.sheetBackground}
    >
      <BottomSheetView style={[styles.content, { paddingBottom: insets.bottom + SPACING.md }]}>
        <AppText style={styles.title}>Profile Photo</AppText>

        <View style={styles.optionsContainer}>
          {/* Camera Option */}
          <TouchableOpacity
            style={styles.option}
            onPress={() => handlePress(onCamera)}
          >
            <Camera size={ICON_SIZE.md} color={COLORS.textPrimary} />
            <AppText style={styles.optionText}>Take Photo</AppText>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Gallery Option */}
          <TouchableOpacity
            style={styles.option}
            onPress={() => handlePress(onGallery)}
          >
            <ImageIcon size={ICON_SIZE.md} color={COLORS.textPrimary} />
            <AppText style={styles.optionText}>Choose from Gallery</AppText>
          </TouchableOpacity>

          {/* Remove Option (Only if hasImage is true) */}
          {hasImage && onRemove && (
            <>
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.option}
                onPress={() => handlePress(onRemove)}
              >
                <Trash2 size={ICON_SIZE.md} color={COLORS.error} />
                <AppText style={[styles.optionText, { color: COLORS.error }]}>Remove Current Photo</AppText>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Cancel Button */}
        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
          <AppText style={styles.cancelText}>Cancel</AppText>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>

  );
};

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
  },
  indicator: {
    backgroundColor: COLORS.grey300,
    width: 40,
  },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  optionsContainer: {
    backgroundColor: COLORS.grey50,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  optionText: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
    marginLeft: SPACING.md,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.grey200,
    marginHorizontal: SPACING.lg,
  },
  cancelBtn: {
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    backgroundColor: COLORS.grey100,
    borderRadius: RADIUS.lg,
  },
  cancelText: {
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
  },
});

export default memo(PhotoSourceSheet);