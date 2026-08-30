import React, { useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '../src/theme';

interface Props {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  rightLabel?: string;
}

export default function CollapsibleSection({ title, children, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const rotation = useSharedValue(defaultExpanded ? 180 : 0);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const animatedHeight = useSharedValue(defaultExpanded ? 1 : 0);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: animatedHeight.value,
    maxHeight: animatedHeight.value * (contentHeight ?? 1000),
  }));

  function toggle() {
    const next = !expanded;
    setExpanded(next);
    rotation.value = withTiming(next ? 180 : 0, { duration: 250 });
    animatedHeight.value = withTiming(next ? 1 : 0, { duration: 250 });
  }

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.header} onPress={toggle} activeOpacity={0.7}>
        <Text style={styles.title}>{title}</Text>
        <Animated.View style={chevronStyle}>
          <Ionicons name="chevron-down" size={16} color={Colors.muted} />
        </Animated.View>
      </TouchableOpacity>
      <Animated.View style={[styles.content, containerStyle]}>
        <View onLayout={(e) => {
          if (contentHeight === null) setContentHeight(e.nativeEvent.layout.height);
        }}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: Radius.lg, overflow: 'hidden', backgroundColor: Colors.surface },
  header:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg },
  title:   { ...Typography.label, color: Colors.textSub },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, overflow: 'hidden' },
});
