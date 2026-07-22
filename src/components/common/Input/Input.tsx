 

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
  secureTextEntry,
  ...props
}: InputProps) => {
  const hasSecureTextToggle = isPassword || Boolean(secureTextEntry);
  const [secureText, setSecureText] = useState(hasSecureTextToggle);
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
          secureTextEntry={hasSecureTextToggle ? secureText : false}
          placeholderTextColor={COLORS.textLight}
          allowFontScaling={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          editable={disabled}
        />

        {hasSecureTextToggle ? (
          <TouchableOpacity
            onPress={() => {
              setSecureText(!secureText);
              onRightIconPress?.();
            }}
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
