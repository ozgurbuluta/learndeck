import React, { useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface SafeGestureWrapperProps {
  children: React.ReactNode;
}

/**
 * SafeGestureWrapper handles React Native Gesture Handler initialization safely
 * This prevents native module errors that can happen in production environments
 */
const SafeGestureWrapper: React.FC<SafeGestureWrapperProps> = ({ children }) => {
  useEffect(() => {
    // Defensive cleanup for gesture handler
    return () => {
      // Clean up any potential resources at component unmount
      if (Platform.OS === 'ios') {
        // iOS-specific cleanup if needed
      }
    };
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>{children}</View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeGestureWrapper; 