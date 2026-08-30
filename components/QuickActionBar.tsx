import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Spacing, Typography } from '../src/theme';

interface Action {
  label: string;
  onPress: () => void;
}

interface Props {
  actions: Action[];
}

export default function QuickActionBar({ actions }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.label}
          style={styles.chip}
          onPress={() => { Haptics.selectionAsync(); action.onPress(); }}
          activeOpacity={0.7}
        >
          <Text style={styles.label}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row:   { paddingVertical: Spacing.sm, gap: Spacing.md, flexDirection: 'row' },
  chip:  { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.accent + '66', backgroundColor: Colors.success.light },
  label: { ...Typography.caption, color: Colors.accent, fontWeight: '600' },
});
