import { useCallback, useEffect, useRef } from 'react';
import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TextStyle,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    width: '100%',
  },
  track: {
    flexDirection: 'row',
  },
});

export function MarqueeText({
  text,
  style,
  containerStyle,
  speed = 50,
  pause = 1000,
}: {
  text: string;
  style?: TextStyle;
  containerStyle?: StyleProp<ViewStyle>;
  speed?: number;
  pause?: number;
}) {
  const scrollX = useSharedValue(0);
  const containerWidth = useRef(0);
  const textWidth = useRef(0);
  const rafRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    containerWidth.current = e.nativeEvent.layout.width;
  }, []);

  const startScroll = useCallback(() => {
    stop();

    if (
      containerWidth.current > 0 &&
      textWidth.current > containerWidth.current
    ) {
      const start = containerWidth.current;
      const end = -(textWidth.current + containerWidth.current);

      let current = start;
      const tick = () => {
        current -= speed / 50;
        scrollX.value = current;
        if (current > end) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setTimeout(() => {
            scrollX.value = start;
            rafRef.current = requestAnimationFrame(tick);
          }, pause);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [scrollX, speed, pause, stop]);

  // Restart scroll saat teks berubah (ganti lagu)
  useEffect(() => {
    startScroll();
  }, [text, startScroll]);

  return (
    <View style={[styles.wrapper, containerStyle]} onLayout={onContainerLayout}>
      <Animated.View
        style={useAnimatedStyle(() => ({
          transform: [{ translateX: scrollX.value }],
        }))}
      >
        <View style={styles.track}>
          <Text
            style={[{ flex: 1 }, style]}
            numberOfLines={1}
            onLayout={(e) => {
              textWidth.current = e.nativeEvent.layout.width;
              startScroll();
            }}
          >
            {text}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
