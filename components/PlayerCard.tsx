import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Elevation, Radius, Spacing, Typography } from '../src/theme';
import { Player } from '../src/types';
import PositionAvatar from './PositionAvatar';
import StatusBadge from './StatusBadge';
import PercentOwnershipBar from './PercentOwnershipBar';

interface Props {
  player: Player;
  slotLabel?: string;
  projectedPoints?: number;
  showPercentOwned?: boolean;
  trend?: 'up' | 'down' | 'neutral';
  addReasonChip?: string;
  dimmed?: boolean;
  rankNumber?: number;
  onPress?: () => void;
}

const TREND_ICON: Record<string, { name: 'trending-up' | 'trending-down' | 'remove'; color: string }> = {
  up:      { name: 'trending-up',   color: Colors.success.DEFAULT },
  down:    { name: 'trending-down', color: Colors.error.DEFAULT   },
  neutral: { name: 'remove',        color: Colors.muted           },
};

export default function PlayerCard({ player, slotLabel, projectedPoints, showPercentOwned, trend, addReasonChip, dimmed, rankNumber, onPress }: Props) {
  const pts = projectedPoints ?? player.projectedPoints;
  const trendData = trend ? TREND_ICON[trend] : null;

  return (
    <TouchableOpacity
      style={[styles.card, dimmed && styles.dimmed]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.row}>
        {rankNumber != null && (
          <Text style={styles.rank}>{rankNumber}</Text>
        )}
        <PositionAvatar position={slotLabel ?? player.position} size={dimmed ? 34 : 40} />
        <View style={styles.info}>
          <Text style={[styles.name, dimmed && styles.dimText]} numberOfLines={1}>{player.name}</Text>
          <Text style={styles.meta}>{player.team} · {player.position}</Text>
          {addReasonChip && (
            <View style={styles.reasonChip}>
              <Text style={styles.reasonText}>{addReasonChip}</Text>
            </View>
          )}
        </View>
        <View style={styles.right}>
          {pts != null && (
            <Text style={[styles.pts, dimmed && styles.dimText]}>{pts.toFixed(1)}</Text>
          )}
          {trendData && (
            <Ionicons name={trendData.name} size={16} color={trendData.color} />
          )}
          <StatusBadge status={player.status} hideWhenActive />
        </View>
      </View>
      {showPercentOwned && player.percentOwned != null && (
        <View style={styles.barRow}>
          <PercentOwnershipBar percent={player.percentOwned} />
          <Text style={styles.pctLabel}>{player.percentOwned.toFixed(0)}% owned</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card:       { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.md, ...Elevation.low },
  dimmed:     { opacity: 0.6 },
  row:        { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  info:       { flex: 1, gap: 2 },
  name:       { ...Typography.bodyBold, color: Colors.text },
  dimText:    { fontSize: 13 },
  meta:       { ...Typography.caption, color: Colors.muted },
  right:      { alignItems: 'flex-end', gap: 4 },
  pts:        { ...Typography.subhead, color: Colors.text, fontSize: 18, fontWeight: '700' },
  rank:       { ...Typography.bodyBold, color: Colors.muted, width: 20, textAlign: 'center' },
  barRow:     { gap: Spacing.sm },
  pctLabel:   { ...Typography.micro, color: Colors.muted, textAlign: 'right' },
  reasonChip: { backgroundColor: Colors.success.light, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 2 },
  reasonText: { ...Typography.micro, color: Colors.success.DEFAULT },
});
