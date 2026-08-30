import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { analyzeTrade } from '../api/client';
import type { Player, TradeAnalysis } from '../types';
import TradeSideColumn from '../../components/TradeSideColumn';
import TradeVerdictCard from '../../components/TradeVerdictCard';
import PlayerChip from '../../components/PlayerChip';
import { Colors, Radius, Spacing, Typography } from '../theme';

function parseNamesToPlayers(text: string): Player[] {
  return text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((name, i) => ({
      id: `temp-${i}-${name}`,
      name,
      position: '?',
      team: '',
      status: 'active' as const,
    }));
}

export default function TradeAnalyzerScreen() {
  const [giveInput, setGiveInput] = useState('');
  const [receiveInput, setReceiveInput] = useState('');
  const [result, setResult] = useState<TradeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const givePlayers = parseNamesToPlayers(giveInput);
  const receivePlayers = parseNamesToPlayers(receiveInput);

  async function handleAnalyze() {
    const give = giveInput.split(',').map((s) => s.trim()).filter(Boolean);
    const receive = receiveInput.split(',').map((s) => s.trim()).filter(Boolean);
    if (!give.length || !receive.length) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await analyzeTrade(give, receive));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.columnsRow}>
          <TradeSideColumn
            label="YOU GIVE"
            players={givePlayers}
            inputValue={giveInput}
            onChangeText={setGiveInput}
            onRemovePlayer={() => {}}
            accentColor={Colors.error.DEFAULT}
            placeholder="e.g. Justin Jefferson, Tony Pollard"
          />
          <View style={styles.divider} />
          <TradeSideColumn
            label="YOU RECEIVE"
            players={receivePlayers}
            inputValue={receiveInput}
            onChangeText={setReceiveInput}
            onRemovePlayer={() => {}}
            accentColor={Colors.success.DEFAULT}
            placeholder="e.g. Davante Adams, Josh Jacobs"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, (loading || (!giveInput.trim() || !receiveInput.trim())) && styles.buttonDisabled]}
          onPress={handleAnalyze}
          disabled={loading || !giveInput.trim() || !receiveInput.trim()}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator color={Colors.bg} />
            : <Text style={styles.buttonText}>Analyze Trade</Text>}
        </TouchableOpacity>

        {error && <Text style={styles.error}>{error}</Text>}

        {result && (
          <>
            <TradeVerdictCard verdict={result.verdict} summary={result.summary} />

            <View style={styles.breakdownRow}>
              <View style={styles.breakdownCol}>
                <Text style={[styles.breakdownLabel, { color: Colors.error.DEFAULT }]}>GIVING</Text>
                {result.give.map((p) => (
                  <PlayerChip key={p.id} player={p} size="sm" />
                ))}
              </View>
              <View style={styles.breakdownCol}>
                <Text style={[styles.breakdownLabel, { color: Colors.success.DEFAULT }]}>RECEIVING</Text>
                {result.receive.map((p) => (
                  <PlayerChip key={p.id} player={p} size="sm" />
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.bg },
  scroll:         { padding: Spacing.xl, gap: Spacing.xl },
  columnsRow:     { flexDirection: 'row', gap: Spacing.md },
  divider:        { width: 1, backgroundColor: Colors.border },
  button:         { backgroundColor: Colors.accent, borderRadius: Radius.full, padding: Spacing.xl, alignItems: 'center' },
  buttonDisabled: { opacity: 0.45 },
  buttonText:     { ...Typography.bodyBold, color: Colors.bg, fontSize: 16 },
  error:          { ...Typography.body, color: Colors.error.DEFAULT, textAlign: 'center' },
  breakdownRow:   { flexDirection: 'row', gap: Spacing.xl },
  breakdownCol:   { flex: 1, gap: Spacing.md },
  breakdownLabel: { ...Typography.micro },
});
