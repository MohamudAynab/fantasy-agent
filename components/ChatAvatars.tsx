import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/theme';

interface AvatarProps { size?: number }

export function AgentAvatar({ size = 32 }: AvatarProps) {
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: Colors.success.light, borderColor: Colors.accent }]}>
      <Ionicons name="flash" size={size * 0.55} color={Colors.accent} />
    </View>
  );
}

export function UserAvatar({ size = 32 }: AvatarProps) {
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: Colors.surfaceHigh, borderColor: Colors.border }]}>
      <Ionicons name="person" size={size * 0.5} color={Colors.textSub} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
});
