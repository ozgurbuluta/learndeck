import React from 'react';
import { Text, TextProps } from 'react-native';

interface AppTextProps extends TextProps {
  children: React.ReactNode;
}

/**
 * Custom text component that prevents font scaling for consistent UI
 * Use this component instead of the standard Text component for consistent text rendering
 */
const AppText: React.FC<AppTextProps> = ({ children, style, ...props }) => {
  return (
    <Text allowFontScaling={false} style={style} {...props}>
      {children}
    </Text>
  );
};

export default AppText; 