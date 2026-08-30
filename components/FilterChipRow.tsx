import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Spacing, Typography } from '../src/theme';

interface Props {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}

export default function FilterChipRow({ options, selected, onSelect }: Props) {
  function handleSelect(value: string) {
    Haptics.selectionAsync();
    onSelect(value);
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {options.map((opt) => {
          const active = opt === selected;
          return (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => handleSelect(opt)}
              activeOpacity={0.7}
            >
              <Text style={[styles.label, active && styles.labelActive]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:     { backgroundColor: Colors.bg, paddingBottom: Spacing.md },
  row:         { paddingHorizontal: Spacing.xl, gap: Spacing.md, flexDirection: 'row' },
  chip:        { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  chipActive:  { backgroundColor: Colors.accent, borderColor: Colors.accent },
  label:       { ...Typography.label, color: Colors.muted },
  labelActive: { color: Colors.bg },
});
