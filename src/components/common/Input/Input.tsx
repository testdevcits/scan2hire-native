import React, { memo, useState } from 'react';
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

  const isEditable =
    disabled !== undefined
      ? !disabled
      : props.editable !== undefined
      ? props.editable
      : true;

  return (
    <View style={styles.container}>
      {label ? <AppText style={styles.label}>{label}</AppText> : null}

      <View
        style={[
          styles.inputContainer,
          focused && styles.focusedBorder,
          error && styles.errorBorder,
          (!isEditable || disabled) && styles.disabledBorder,
        ]}
      >
        {/* Left Icon Render Block */}
        {leftIcon ? (
          <View style={styles.leftIconContainer}>{leftIcon}</View>
        ) : null}

        <TextInput
          {...props}
          style={[styles.input, props.style]}
          secureTextEntry={hasSecureTextToggle ? secureText : false}
          placeholderTextColor={props.placeholderTextColor || COLORS.textLight}
          allowFontScaling={false}
          onFocus={e => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          editable={isEditable}
        />

        {hasSecureTextToggle ? (
          <TouchableOpacity
            onPress={() => {
              setSecureText(!secureText);
              onRightIconPress?.();
            }}
            hitSlop={10}
          >
            {rightIcon}
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity onPress={onRightIconPress} hitSlop={10}>
            {rightIcon}
          </TouchableOpacity>
        ) : null}
      </View>

      {!!error && <AppText style={styles.error}>{error}</AppText>}
    </View>
  );
};

export default memo(Input);
