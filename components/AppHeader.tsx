import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../src/theme';

interface Props {
  week?: number;
  leagueName?: string;
}

export default function AppHeader({ week, leagueName }: Props) {
  return (
    <View style={styles.row}>
      <Ionicons name="american-football" size={18} color={Colors.accent} />
      <Text style={styles.league}>{leagueName ?? 'Fantasy Agent'}</Text>
      {week != null && (
        <View style={styles.weekBadge}>
          <Text style={styles.week}>Week {week}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  league:    { ...Typography.bodyBold, color: Colors.text },
  weekBadge: { backgroundColor: Colors.success.light, borderRadius: 99, paddingHorizontal: Spacing.md, paddingVertical: 2 },
  week:      { ...Typography.micro, color: Colors.accent },
});
