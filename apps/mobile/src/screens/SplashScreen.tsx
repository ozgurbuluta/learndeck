import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

const SplashScreen: React.FC = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color="#FCA311" />
    <Text style={styles.text}>Loading...</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  text: {
    marginTop: 16,
    color: '#14213D',
    fontSize: 16,
  },
});

export default SplashScreen; 