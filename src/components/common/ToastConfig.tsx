import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react-native';
import { COLORS, FONTS, RADIUS, SPACING } from '../../constants';
import AppText from './AppText';

const CustomToast = ({ 
  text1, 
  text2, 
  type, 
  icon: Icon, 
  color 
}: any) => (
  <View style={[styles.container, { borderLeftColor: color }]}>
    <View style={[styles.iconContainer, { backgroundColor: `${color}10` }]}>
      <Icon size={20} color={color} strokeWidth={2.5} />
    </View>
    <View style={styles.content}>
      <AppText style={styles.title}>{text1}</AppText>
      {text2 && <AppText style={styles.message}>{text2}</AppText>}
    </View>
  </View>
);

export const toastConfig: ToastConfig = {
  success: (props) => (
    <CustomToast 
      {...props} 
      icon={CheckCircle2} 
      color={COLORS.success} 
    />
  ),
  error: (props) => (
    <CustomToast 
      {...props} 
      icon={AlertCircle} 
      color={COLORS.error} 
    />
  ),
  info: (props) => (
    <CustomToast 
      {...props} 
      icon={Info} 
      color={COLORS.secondaryDark} 
    />
  ),
};

const styles = StyleSheet.create({
  container: {
    height: 'auto',
    minHeight: 60,
    width: '92%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderLeftWidth: 4,
    // Premium Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  message: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});