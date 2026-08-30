import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Elevation, Radius, Spacing, Typography } from '../src/theme';
import { Matchup } from '../src/types';

interface Props {
  matchup: Matchup;
  leagueName?: string;
}

export default function HeroMatchupCard({ matchup, leagueName }: Props) {
  const total = matchup.myProjected + matchup.opponentProjected;
  const winPct = total > 0 ? (matchup.myProjected / total) * 100 : 50;

  return (
    <LinearGradient
      colors={['#1e3a5f', '#1e293b']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.topRow}>
        <Text style={styles.weekLabel}>Week {matchup.week}</Text>
        {leagueName && <Text style={styles.league}>{leagueName}</Text>}
      </View>

      <View style={styles.scoreRow}>
        <View style={styles.teamCol}>
          <Text style={styles.teamLabel}>MY TEAM</Text>
          <Text style={styles.score}>{matchup.myProjected.toFixed(1)}</Text>
          <Text style={styles.projected}>projected</Text>
        </View>
        <View style={styles.vsCol}>
          <Text style={styles.vs}>VS</Text>
        </View>
        <View style={[styles.teamCol, styles.oppCol]}>
          <Text style={styles.teamLabelOpp}>{matchup.opponent.toUpperCase()}</Text>
          <Text style={styles.scoreOpp}>{matchup.opponentProjected.toFixed(1)}</Text>
          <Text style={styles.projected}>projected</Text>
        </View>
      </View>

      <View style={styles.probSection}>
        <Text style={styles.probLabel}>Win probability · {winPct.toFixed(0)}%</Text>
        <View style={styles.probTrack}>
          <View style={[styles.probFill, { width: `${winPct}%` }]} />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card:        { borderRadius: Radius.xl, padding: Spacing.xl3, gap: Spacing.xl2, ...Elevation.medium },
  topRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weekLabel:   { ...Typography.label, color: Colors.accent },
  league:      { ...Typography.caption, color: Colors.muted },
  scoreRow:    { flexDirection: 'row', alignItems: 'center' },
  teamCol:     { flex: 1, gap: Spacing.xs },
  oppCol:      { alignItems: 'flex-end' },
  teamLabel:   { ...Typography.micro, color: Colors.accent },
  teamLabelOpp:{ ...Typography.micro, color: Colors.muted },
  score:       { ...Typography.display, color: Colors.text },
  scoreOpp:    { ...Typography.display, color: Colors.textSub },
  projected:   { ...Typography.caption, color: Colors.muted },
  vsCol:       { paddingHorizontal: Spacing.xl3, alignItems: 'center' },
  vs:          { ...Typography.label, color: Colors.border },
  probSection: { gap: Spacing.sm },
  probLabel:   { ...Typography.micro, color: Colors.muted },
  probTrack:   { height: 6, backgroundColor: Colors.border + '80', borderRadius: Radius.full, overflow: 'hidden' },
  probFill:    { height: 6, backgroundColor: Colors.accent, borderRadius: Radius.full },
});
