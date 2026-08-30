import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { Colors, Radius } from '../src/theme';

interface Props {
  percent: number;
  height?: number;
}

export default function PercentOwnershipBar({ percent, height = 3 }: Props) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(Math.min(Math.max(percent, 0), 100), { duration: 600 });
  }, [percent]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={[styles.track, { height }]}>
      <Animated.View style={[styles.fill, barStyle, { height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', backgroundColor: Colors.border, borderRadius: Radius.full, overflow: 'hidden' },
  fill:  { backgroundColor: Colors.accent, borderRadius: Radius.full },
});
