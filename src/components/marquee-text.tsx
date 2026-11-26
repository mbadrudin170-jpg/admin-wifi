import { useCallback, useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    type LayoutChangeEvent,
    type StyleProp,
    type TextStyle,
    type ViewStyle,
} from 'react-native';

import Animated, {
    cancelAnimation,
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

type MarqueeTextProps = {
  text: string;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  speed?: number;
  pause?: number;
  gap?: number;
};

export function MarqueeText({
  text,
  style,
  containerStyle,
  speed = 40,
  pause = 800,
  gap = 40,
}: MarqueeTextProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);

  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.get() }],
  }));

  const onContainerLayout = useCallback((event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setContainerWidth((current) => (current === width ? current : width));
  }, []);

  const onTextLayout = useCallback((event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setTextWidth((current) => (current === width ? current : width));
  }, []);

  const isOverflowing = containerWidth > 0 && textWidth > containerWidth;

  useEffect(() => {
    cancelAnimation(translateX);
    translateX.set(0);

    if (!isOverflowing || speed <= 0) {
      return () => cancelAnimation(translateX);
    }

    const distance = textWidth + gap;
    const duration = (distance / speed) * 1000;

    translateX.set(
      withRepeat(
        withSequence(
          withTiming(-distance, {
            duration,
            easing: Easing.linear,
          }),
          withDelay(pause, withTiming(0, { duration: 0 })),
        ),
        -1,
        false,
      ),
    );

    return () => cancelAnimation(translateX);
  }, [text, textWidth, isOverflowing, speed, pause, gap, translateX]);

  return (
    <View onLayout={onContainerLayout} style={[styles.wrapper, containerStyle]}>
      <Animated.View style={[styles.track, animatedStyle]}>
        <Text
          numberOfLines={1}
          ellipsizeMode="clip"
          onLayout={onTextLayout}
          style={[styles.text, style]}
        >
          {text}
        </Text>

        {isOverflowing && (
          <Text
            numberOfLines={1}
            ellipsizeMode="clip"
            style={[styles.text, style, { marginLeft: gap }]}
          >
            {text}
          </Text>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    minWidth: 0,
    overflow: 'hidden',
  },
  track: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },
  text: {
    flexShrink: 0,
  },
});
