import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ImagePicker, { Image as PickerImage } from 'react-native-image-crop-picker';
import { ArrowLeft, Camera, Save, User } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { COLORS, FONT_SIZE, FONTS, RADIUS, SPACING } from '../../constants';
import { updateMyProfile } from '../../redux/slices/authSlice';
import { UserProfile } from '../../types/user';

interface RootState {
  auth: {
    user: UserProfile | null;
    loading: boolean;
  };
}

const ProfileSettingsScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string | undefined>();
  const [photoUri, setPhotoUri] = useState<string | undefined>();

  useEffect(() => {
    setName(user?.name || '');
    setMobile(user?.mobile || '');
    setPhotoUri(user?.profileImage || user?.employeeProfile?.documents?.photo?.url);
  }, [user]);

  const handlePickedImage = (image: PickerImage) => {
    if (image.data) {
      setPhotoBase64(image.data);
      setPhotoUri(image.path);
    }
  };

  const pickPhotoFromGallery = async () => {
    try {
      const image: PickerImage = await ImagePicker.openPicker({
        width: 600,
        height: 600,
        cropping: true,
        includeBase64: true,
        mediaType: 'photo',
      });

      handlePickedImage(image);
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Photo Error', error?.message || 'Unable to select photo.');
      }
    }
  };

  const takeProfilePhoto = async () => {
    try {
      const image: PickerImage = await ImagePicker.openCamera({
        width: 600,
        height: 600,
        cropping: true,
        includeBase64: true,
        mediaType: 'photo',
        useFrontCamera: true,
      });

      handlePickedImage(image);
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Camera Error', error?.message || 'Unable to capture photo.');
      }
    }
  };

  const choosePhotoSource = () => {
    Alert.alert('Profile Photo', 'Choose photo source', [
      { text: 'Camera', onPress: takeProfilePhoto },
      { text: 'Gallery', onPress: pickPhotoFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const saveProfile = async () => {
    const cleanName = name.trim();
    const cleanMobile = mobile.trim();

    if (!cleanName) {
      Alert.alert('Name Required', 'Please enter your name.');
      return;
    }

    if (!cleanMobile) {
      Alert.alert('Mobile Required', 'Please enter your mobile number.');
      return;
    }

    const result = await dispatch(
      updateMyProfile({
        name: cleanName,
        mobile: cleanMobile,
        photoBase64,
      })
    );

    if (updateMyProfile.fulfilled.match(result)) {
      Alert.alert('Profile Updated', result.payload.message);
      navigation.goBack();
    } else {
      Alert.alert('Update Failed', result.payload || 'Unable to update profile.');
    }
  };

  return (
    <View style={styles.safeContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Update profile details</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.photoSection}>
            <View style={styles.avatar}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatarImage} />
              ) : (
                <User size={34} color={COLORS.primary} />
              )}
            </View>
            <TouchableOpacity style={styles.photoButton} onPress={choosePhotoSource}>
              <Camera size={16} color={COLORS.primary} />
              <Text style={styles.photoButtonText}>Upload Profile Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={COLORS.textLight}
              style={styles.input}
            />

            <Text style={styles.label}>Mobile</Text>
            <TextInput
              value={mobile}
              onChangeText={setMobile}
              placeholder="Enter mobile number"
              placeholderTextColor={COLORS.textLight}
              keyboardType="phone-pad"
              style={styles.input}
            />

            <Text style={styles.readOnlyLabel}>Email</Text>
            <Text style={styles.readOnlyValue}>{user?.email || 'N/A'}</Text>

            <Text style={styles.readOnlyLabel}>Role</Text>
            <Text style={styles.readOnlyValue}>{user?.role || 'N/A'}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={loading}
            onPress={saveProfile}
            style={[styles.saveButton, loading && styles.disabledButton]}
          >
            <Save size={18} color={COLORS.white} />
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Profile'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grey50,
    marginRight: SPACING.sm,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.xl,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  photoSection: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.primary}12`,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  photoButtonText: {
    marginLeft: 6,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.sm,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    color: COLORS.textPrimary,
    fontFamily: FONTS.regular,
    marginBottom: SPACING.md,
  },
  readOnlyLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  readOnlyValue: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  saveButton: {
    height: 52,
    borderRadius: RADIUS.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    marginLeft: 8,
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZE.md,
  },
});

export default ProfileSettingsScreen;
