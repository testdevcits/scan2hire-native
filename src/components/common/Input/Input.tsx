 

import React, { useState } from 'react';
import {
  TextInput,
  View,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
 import styles from './Input.styles';
import { COLORS } from '../../../constants';
import AppText from '../AppText';
 

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
  leftIcon?: React.ReactNode; // Added left icon prop
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  disabled?: boolean;
}

const Input = ({
  label,
  error,
  isPassword = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  disabled,
  ...props
}: InputProps) => {
  const [secureText, setSecureText] = useState(isPassword);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label ? <AppText style={styles.label}>{label}</AppText> : null}

      <View
        style={[
          styles.inputContainer,
          focused && styles.focusedBorder,
          error && styles.errorBorder,
          disabled && styles.disabledBorder,
        ]}>
        
        {/* Left Icon Render Block */}
        {leftIcon ? (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        ) : null}

        <TextInput
          {...props}
          style={styles.input}
          secureTextEntry={secureText}
          placeholderTextColor={COLORS.textLight}
          allowFontScaling={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          editable={disabled}
        />

        {isPassword ? (
          <TouchableOpacity
            onPress={() => setSecureText(!secureText)}
            hitSlop={10}>
            {rightIcon}
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            hitSlop={10}>
            {rightIcon}
          </TouchableOpacity>
        ) : null}
      </View>

      {!!error && <AppText style={styles.error}>{error}</AppText>}
    </View>
  );
};

export default Input;