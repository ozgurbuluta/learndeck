import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ViewStyle, View } from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

const ScreenContainer: React.FC<Props> = ({ children, style }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[{ flex: 1, paddingTop: insets.top, backgroundColor: '#F3F4F6' }, style]}>
      {children}
    </View>
  );
};

export default ScreenContainer; 