import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Elevation, Radius, Spacing, Typography } from '../src/theme';
import { InjuryReport } from '../src/types';
import StatusBadge from './StatusBadge';
import { relativeTime } from '../src/utils/time';
import { parsePracticeStatus } from '../src/utils/practiceStatus';

interface Props {
  report: InjuryReport;
}

const DOT_COLORS = {
  full:    Colors.success.DEFAULT,
  limited: Colors.warning.DEFAULT,
  dnp:     Colors.error.DEFAULT,
  unknown: Colors.muted,
};

export default function InjuryCard({ report }: Props) {
  const severityColor = Colors.severity[report.gameStatus.toLowerCase()] ?? Colors.muted;
  const practiceLevel = parsePracticeStatus(report.practiceStatus);

  return (
    <View style={[styles.card, { borderLeftColor: severityColor }]}>
      <View style={styles.header}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{report.player.name}</Text>
          <Text style={styles.meta}>{report.player.team} · {report.player.position}</Text>
        </View>
        <StatusBadge status={report.gameStatus} />
      </View>

      <Text style={styles.injury}>{report.injury}</Text>

      <View style={styles.footer}>
        <View style={styles.practiceRow}>
          {(['full', 'limited', 'dnp'] as const).map((level) => (
            <View key={level} style={styles.dotItem}>
              <View style={[styles.dot, { backgroundColor: level === practiceLevel ? DOT_COLORS[level] : Colors.border }]} />
              <Text style={[styles.dotLabel, level === practiceLevel && { color: DOT_COLORS[level] }]}>
                {level === 'dnp' ? 'DNP' : level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </View>
          ))}
        </View>
        <Text style={styles.updated}>{relativeTime(report.updatedAt)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card:        { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.md, borderLeftWidth: 4, ...Elevation.low },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  nameRow:     { gap: 2, flex: 1 },
  name:        { ...Typography.bodyBold, color: Colors.text },
  meta:        { ...Typography.caption, color: Colors.muted },
  injury:      { ...Typography.body, color: Colors.textSub },
  footer:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  practiceRow: { flexDirection: 'row', gap: Spacing.lg },
  dotItem:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dot:         { width: 8, height: 8, borderRadius: 4 },
  dotLabel:    { ...Typography.micro, color: Colors.muted },
  updated:     { ...Typography.micro, color: Colors.textDim },
});
