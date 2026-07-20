import React from 'react';
import {
  Text,
  TextProps,
  TextStyle,
  StyleProp,
} from 'react-native';
import { COLORS, FONTS } from '../../constants';
 
 

interface AppTextProps extends TextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

const AppText: React.FC<AppTextProps> = ({
  children,
  style,
  ...rest
}) => {
  return (
    <Text
      allowFontScaling={false}
      style={[
        {
          fontFamily: FONTS.regular,
          color: COLORS.textPrimary,
        },
        style,
      ]}
      {...rest}>
      {children}
    </Text>
  );
};

export default AppText;