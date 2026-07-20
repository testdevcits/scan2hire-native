// dimensions.ts
import {Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 999,
} as const;

export const FONT_SIZE = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  title: 24,
  heading: 28,
  display: 32,
} as const;

export const ICON_SIZE = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 26,
  xl: 32,
} as const;

export default {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  SPACING,
  RADIUS,
  FONT_SIZE,
  ICON_SIZE,
};