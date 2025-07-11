import 'react-native-gesture-handler';  // Must be first import
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import { registerRootComponent } from 'expo';
import { LogBox, AppState } from 'react-native';
import App from './App';

// Ignore specific harmless warnings that might cause performance issues
LogBox.ignoreLogs([
  'AsyncStorage has been extracted from react-native',
  'Setting a timer for a long period of time',
  'Non-serializable values were found in the navigation state',
]);

// Patch console.error to prevent app crashes from non-fatal errors in production
const originalConsoleError = console.error;
console.error = (...args) => {
  // Don't crash on render errors in production
  if (__DEV__) {
    originalConsoleError(...args);
  } else {
    // In production, log but don't crash
    if (args[0] && typeof args[0] === 'string' && args[0].includes('RCTBridge')) {
      // Critical RCTBridge errors should still crash
      originalConsoleError(...args);
    } else {
      console.log('Error (suppressed in production):', ...args);
    }
  }
};

// Handle app state changes for better resource management
AppState.addEventListener('memoryWarning', () => {
  console.log('Memory warning received, cleaning up resources');
  // Force garbage collection if possible
  if (global.gc) {
    global.gc();
  }
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
