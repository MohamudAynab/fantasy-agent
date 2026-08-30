import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../src/theme';

interface Props {
  position: string;
  size?: number;
}

export default function PositionAvatar({ position, size = 40 }: Props) {
  const colors = Colors.position[position.toUpperCase()] ?? { bg: Colors.muted, text: Colors.text };
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.bg }]}>
      <Text style={[styles.label, { color: colors.text, fontSize: size * 0.3 }]}>
        {position.slice(0, 3).toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { justifyContent: 'center', alignItems: 'center' },
  label:  { fontWeight: '800', letterSpacing: 0.5 },
});
