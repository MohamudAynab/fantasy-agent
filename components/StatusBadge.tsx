import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius } from '../src/theme';

const STATUS_COLORS: Record<string, string> = {
  active:       Colors.accent,
  questionable: Colors.warning.DEFAULT,
  doubtful:     '#f97316',
  probable:     '#84cc16',
  out:          Colors.error.DEFAULT,
  bye:          Colors.muted,
};

interface Props {
  status: string;
  hideWhenActive?: boolean;
}

export default function StatusBadge({ status, hideWhenActive = false }: Props) {
  if (hideWhenActive && status === 'active') return null;
  const color = STATUS_COLORS[status.toLowerCase()] ?? Colors.muted;
  return (
    <View style={[styles.badge, { backgroundColor: color + '33' }]}>
      <Text style={[styles.text, { color }]}>{status.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  text:  { fontSize: 10, fontWeight: '700' },
});
