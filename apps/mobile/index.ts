// CRITICAL: Must be first import for gesture handler to work properly
import 'react-native-gesture-handler';

// Polyfills
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';

// React Native imports
import { registerRootComponent } from 'expo';
import { LogBox, AppState, Text, TextInput } from 'react-native';

// Main app
import App from './App';

// Prevent text scaling from causing layout issues
// Using type assertion to avoid TypeScript errors
try {
  // @ts-ignore - This is a runtime configuration that TypeScript doesn't know about
  if (Text.defaultProps === undefined) Text.defaultProps = {};
  if (TextInput.defaultProps === undefined) TextInput.defaultProps = {};
  
  // @ts-ignore
  Text.defaultProps.allowFontScaling = false;
  // @ts-ignore
  TextInput.defaultProps.allowFontScaling = false;
} catch (e) {
  console.warn('Failed to disable font scaling:', e);
}

// Ignore specific harmless warnings that might cause performance issues
LogBox.ignoreLogs([
  'AsyncStorage has been extracted from react-native',
  'Setting a timer for a long period of time',
  'Non-serializable values were found in the navigation state',
  'Require cycle:',
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

// Global error handler to prevent crashes in production
const originalErrorHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
  // In production, try to prevent fatal JS errors from crashing the app
  if (!__DEV__ && isFatal) {
    console.error('Caught global error:', error);
    
    // Still log the error but don't crash
    if (error && error.message && !error.message.includes('RCTBridge')) {
      // Let the app continue for non-critical errors
      return;
    }
  }
  
  // For development or critical errors, use the original handler
  originalErrorHandler(error, isFatal);
});

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

// Register the root component
try {
  registerRootComponent(App);
} catch (error) {
  console.error('Failed to register root component:', error);
  
  // Fallback registration in case of error
  const { AppRegistry } = require('react-native');
  AppRegistry.registerComponent('main', () => App);
}
