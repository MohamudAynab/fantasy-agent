import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '../src/theme';
import { Player } from '../src/types';

interface Props {
  player: Player;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

export default function PlayerChip({ player, onRemove, size = 'md' }: Props) {
  const small = size === 'sm';
  return (
    <View style={[styles.chip, small && styles.chipSm]}>
      <Text style={[styles.name, small && styles.nameSm]} numberOfLines={1}>
        {player.name}
      </Text>
      <Text style={styles.pos}>{player.position}</Text>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close-circle" size={small ? 14 : 16} color={Colors.muted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chip:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.surfaceHigh, borderRadius: Radius.full, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 1 },
  chipSm: { paddingHorizontal: Spacing.md, paddingVertical: 3 },
  name:   { ...Typography.bodyBold, color: Colors.text, flexShrink: 1, maxWidth: 120 },
  nameSm: { fontSize: 12 },
  pos:    { ...Typography.micro, color: Colors.muted },
});
