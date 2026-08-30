import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, withTiming, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Elevation, Radius, Spacing, Typography } from '../src/theme';

interface Props {
  change: string;
  index: number;
  onDismiss?: (index: number) => void;
}

export default function SwipeableChangeCard({ change, index, onDismiss }: Props) {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  function dismiss() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onDismiss?.(index);
  }

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX > 80) {
        translateX.value = withTiming(400, { duration: 250 });
        opacity.value = withTiming(0, { duration: 250 });
        runOnJS(dismiss)();
      } else {
        translateX.value = withTiming(0, { duration: 300 });
      }
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, animStyle]}>
        <View style={styles.icon}>
          <Ionicons name="swap-horizontal" size={18} color={Colors.accent} />
        </View>
        <Text style={styles.text}>{change}</Text>
        <View style={styles.swipeHint}>
          <Ionicons name="chevron-forward" size={14} color={Colors.muted} />
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, width: 280, ...Elevation.low, borderLeftWidth: 3, borderLeftColor: Colors.accent },
  icon:      { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.success.light, justifyContent: 'center', alignItems: 'center' },
  text:      { ...Typography.body, color: Colors.text, flex: 1 },
  swipeHint: { opacity: 0.4 },
});
