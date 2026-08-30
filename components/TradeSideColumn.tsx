import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../src/theme';
import { Player } from '../src/types';
import PlayerChip from './PlayerChip';

interface Props {
  label: string;
  players: Player[];
  inputValue: string;
  onChangeText: (text: string) => void;
  onRemovePlayer: (id: string) => void;
  accentColor: string;
  placeholder?: string;
}

export default function TradeSideColumn({ label, players, inputValue, onChangeText, onRemovePlayer, accentColor, placeholder }: Props) {
  return (
    <View style={styles.col}>
      <Text style={[styles.label, { color: accentColor }]}>{label}</Text>
      <View style={styles.chips}>
        {players.map((p) => (
          <PlayerChip key={p.id} player={p} onRemove={() => onRemovePlayer(p.id)} size="sm" />
        ))}
      </View>
      <TextInput
        style={[styles.input, { borderColor: accentColor + '55' }]}
        value={inputValue}
        onChangeText={onChangeText}
        placeholder={placeholder ?? 'Player name...'}
        placeholderTextColor={Colors.textDim}
        multiline
      />
    </View>
  );
}

const styles = StyleSheet.create({
  col:   { flex: 1, gap: Spacing.md },
  label: { ...Typography.label },
  chips: { gap: Spacing.sm, flexWrap: 'wrap', flexDirection: 'row' },
  input: { backgroundColor: Colors.surfaceHigh, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, color: Colors.text, ...Typography.body, minHeight: 60 },
});
