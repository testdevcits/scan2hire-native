import React, { useEffect, useState, Suspense, lazy } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ImagePicker, {
  Image as PickerImage,
} from 'react-native-image-crop-picker';
import {
  ArrowLeft,
  Camera,
  Save,
  User,
  Phone,
  Mail,
  Briefcase,
  UserCheck,
  ShieldCheck,
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import Toast from 'react-native-toast-message';
import { COLORS } from '../../constants';
import { updateMyProfile } from '../../redux/slices/authSlice';
import { UserProfile } from '../../types/user';
import styles from './styles.profilesettings';
import { Button, Input } from '../../components';

const PhotoSourceSheet = lazy(
  () => import('../../components/common/PhotoSourceSheet'),
);
const ImageViewerModal = lazy(
  () => import('../../components/common/ImageViewerModal'),
);

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
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [selectedPhotoUrl, setSelectedPhoto] = useState<string | undefined>('');

  useEffect(() => {
    setName(user?.name || '');
    setMobile(user?.mobile || '');
    setPhotoUri(
      user?.profileImage || user?.employeeProfile?.documents?.photo?.url,
    );
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
        Alert.alert(
          'Camera Error',
          error?.message || 'Unable to capture photo.',
        );
      }
    }
  };

  const choosePhotoSource = () => {
    setShowPhotoSheet(true);
  };

  const saveProfile = async () => {
    const cleanName = name.trim();
    const cleanMobile = mobile.trim();

    if (!cleanName) {
      Toast.show({
        type: 'error',
        text1: 'Name Required',
        text2: 'Please enter your name.',
      });
      return;
    }

    if (!cleanMobile) {
      Toast.show({
        type: 'error',
        text1: 'Mobile Required',
        text2: 'Please enter your mobile number.',
      });
      return;
    }

    const result = await dispatch(
      updateMyProfile({
        name: cleanName,
        mobile: cleanMobile,
        photoBase64,
      }),
    );

    if (updateMyProfile.fulfilled.match(result)) {
      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: result.payload.message,
      });
      navigation.goBack();
    } else {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: result.payload || 'Unable to update profile.',
      });
    }
  };

  return (
    <View style={styles.safeContainer}>
      {/* Premium Top Navigation Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Profile Settings</Text>
            <Text style={styles.headerSubtitle}>
              Manage personal info & credentials
            </Text>
          </View>
        </View>

        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Active</Text>
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
          {/* Avatar Section Card */}
          <Animated.View
            entering={FadeInUp.delay(100).duration(500)}
            style={styles.photoSectionCard}
          >
            <View style={styles.avatarWrapper}>
              <Pressable
                disabled={!photoUri}
                onPress={() => {
                  if (photoUri) {
                    setSelectedPhoto(photoUri);
                    setIsViewerVisible(true);
                  }
                }}
                style={styles.avatar}
              >
                {photoUri ? (
                  <Image
                    source={{ uri: photoUri }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <User size={46} color={COLORS.primary} />
                )}
              </Pressable>

              <TouchableOpacity
                style={styles.cameraBadgeButton}
                onPress={choosePhotoSource}
                activeOpacity={0.85}
              >
                <Camera size={18} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            <Text style={styles.userFullName}>
              {name || user?.name || 'Employee'}
            </Text>
            <Text style={styles.userRoleSubtitle}>
              {user?.role ? user.role.toUpperCase() : 'TEAM MEMBER'} • ID:{' '}
              {user?.employeeProfile?.employeeId || 'N/A'}
            </Text>

            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={choosePhotoSource}
              activeOpacity={0.75}
            >
              <Camera size={14} color={COLORS.primary} />
              <Text style={styles.changePhotoText}>Change Profile Photo</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Section 1: Personal Info Card */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(500)}
            style={styles.sectionCard}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <UserCheck size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.sectionTitle}>Personal Details</Text>
            </View>

            <Input
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              disabled={true}
              leftIcon={<User size={18} color={COLORS.textLight} />}
            />

            <Input
              label="Mobile Number"
              value={mobile}
              onChangeText={setMobile}
              placeholder="Enter mobile number"
              keyboardType="phone-pad"
              disabled={true}
              leftIcon={<Phone size={18} color={COLORS.textLight} />}
            />
          </Animated.View>

          {/* Section 2: Account & System Info Card */}
          <Animated.View
            entering={FadeInUp.delay(300).duration(500)}
            style={styles.sectionCard}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <ShieldCheck size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.sectionTitle}>Account Information</Text>
            </View>

            <Input
              label="Email Address"
              value={user?.email || 'N/A'}
              disabled={true}
              leftIcon={<Mail size={18} color={COLORS.textLight} />}
            />

            <Input
              label="Assigned Role"
              value={user?.role || 'N/A'}
              disabled={true}
              leftIcon={<Briefcase size={18} color={COLORS.textLight} />}
            />
          </Animated.View>

          {/* Save Button */}
          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <Button
              title="Save Profile"
              isLoading={loading}
              onPress={saveProfile}
              leftIcon={<Save size={18} color={COLORS.white} />}
              buttonStyle={styles.saveButton}
            />
          </Animated.View>
        </ScrollView>

        <Suspense fallback={null}>
          <PhotoSourceSheet
            visible={showPhotoSheet}
            onClose={() => setShowPhotoSheet(false)}
            onCamera={takeProfilePhoto}
            onGallery={pickPhotoFromGallery}
            hasImage={Boolean(photoUri)}
          />

          {isViewerVisible && (
            <ImageViewerModal
              isVisible={isViewerVisible}
              onClose={() => setIsViewerVisible(false)}
              imageUrl={selectedPhotoUrl}
            />
          )}
        </Suspense>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ProfileSettingsScreen;
