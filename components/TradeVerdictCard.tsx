import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Elevation, Radius, Spacing, Typography } from '../src/theme';

interface Props {
  verdict: 'accept' | 'decline' | 'neutral';
  summary: string;
}

const VERDICT_CONFIG = {
  accept:  { icon: 'checkmark-circle' as const, label: 'ACCEPT',  grade: 'A' },
  decline: { icon: 'close-circle'     as const, label: 'DECLINE', grade: 'D' },
  neutral: { icon: 'remove-circle'    as const, label: 'NEUTRAL', grade: 'N' },
};

export default function TradeVerdictCard({ verdict, summary }: Props) {
  const color = Colors.verdict[verdict];
  const config = VERDICT_CONFIG[verdict];

  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.header}>
        <View style={styles.left}>
          <Ionicons name={config.icon} size={28} color={color} />
          <Text style={[styles.label, { color }]}>{config.label}</Text>
        </View>
        <Text style={[styles.grade, { color: color + '33' }]}>{config.grade}</Text>
      </View>
      <Text style={styles.summary}>{summary}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card:    { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.xl, gap: Spacing.lg, borderLeftWidth: 4, ...Elevation.medium },
  header:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  left:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  label:   { ...Typography.heading },
  grade:   { fontSize: 80, fontWeight: '900', lineHeight: 80 },
  summary: { ...Typography.body, color: Colors.textSub, lineHeight: 22 },
});
