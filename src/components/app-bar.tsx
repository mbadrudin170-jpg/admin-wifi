import type { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { ThemedView } from './themed-view';

type AppBarProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function AppBar({ children, style }: AppBarProps) {
  return (
    <ThemedView
      style={[
        {
          flexDirection: 'row',
          justifyContent: 'flex-start',
          width: '100%',
          alignItems: 'center',
        },
        style,
      ]}
    >
      {children}
    </ThemedView>
  );
}
