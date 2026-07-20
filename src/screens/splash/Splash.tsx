// src/screens/splash/SplashScreen.js
import React from 'react';
import { StyleSheet, ActivityIndicator, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// Importing your custom constants
import { COLORS } from '../../constants/colors';
import { FONT_SIZE, SPACING } from '../../constants/dimensions';
import { FONTS } from '../../constants/fonts';

export default function SplashScreen() {
  return (
    <LinearGradient
      // Using all three of your primary branding colors
      colors={[COLORS.primaryDark, COLORS.primary, COLORS.primaryLight]}
      start={{ x: 0.0, y: 0.0 }} // Starts at the top-left
      end={{ x: 1.0, y: 1.0 }}   // Ends at the bottom-right
      style={styles.container}
    >
      {/* Translucent allows the gradient to render behind the notch and status bar area */}
      {/* <StatusBar barStyle="light-content" backgroundColor="transparent" translucent /> */}

      {/* Elegant, semi-transparent container for your logo */}
      {/* <View style={styles.logoCircle}>
        <Image 
          // Replace with your actual logo path when ready
          source={require('../../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
          // If you do not have the image file yet, you can comment this Image block out
        />
      </View> */}

      {/* Styled App Title */}
      <Text style={styles.title}>Scan 2 Hire</Text>
      
      {/* App Tagline */}
      <Text style={styles.subtitle}>Seamless Employee Check-In & Check-Out</Text>

      {/* Centered loader at the bottom */}
      <ActivityIndicator 
        size="small" 
        color={COLORS.white} 
        style={styles.loader} 
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Glassmorphism backdrop effect
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    // Soft drop shadow for elevation depth
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: FONT_SIZE.display, // 32
    fontFamily: FONTS.bold,
    color: COLORS.white,
    textAlign: 'center',
    letterSpacing: 1.5,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.md, // 14
    fontFamily: FONTS.medium,
    color: 'rgba(255, 255, 255, 0.8)', // Translucent white for typography hierarchy
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  loader: {
    position: 'absolute',
    bottom: 60,
  },
});
