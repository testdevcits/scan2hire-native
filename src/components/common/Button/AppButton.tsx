// Button.tsx
import React, { memo } from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';


 import styles from './AppButton.styles';
import AppText from '../AppText';
import { COLORS } from '../../../constants';
 
interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<any>;
  onPress?: (event: GestureResponderEvent) => void;
}

const AppButton = ({
  title,
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  buttonStyle,
  textStyle,
  onPress,
  ...props
}: AppButtonProps) => {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.button,
        isDisabled && styles.disabledButton,
        buttonStyle,
      ]}
      {...props}>
      {isLoading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <>
          {leftIcon}

          <AppText style={[styles.title, textStyle]}>
            {title}
          </AppText>

          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

export default memo(AppButton);