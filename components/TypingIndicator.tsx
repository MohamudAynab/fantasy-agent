import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, withRepeat, withSequence, withTiming, withDelay } from 'react-native-reanimated';
import { Colors, Radius, Spacing } from '../src/theme';
import { AgentAvatar } from './ChatAvatars';

interface Props {
  visible: boolean;
}

function Dot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(delay, withRepeat(
      withSequence(
        withTiming(1,   { duration: 400 }),
        withTiming(0.3, { duration: 400 }),
      ),
      -1,
      false,
    ));
  }, []);

  return <Animated.View style={[styles.dot, { opacity }]} />;
}

export default function TypingIndicator({ visible }: Props) {
  if (!visible) return null;
  return (
    <View style={styles.row}>
      <AgentAvatar size={28} />
      <View style={styles.bubble}>
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row:    { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.md, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  bubble: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.surface, borderRadius: Radius.xl, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  dot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.muted },
});
