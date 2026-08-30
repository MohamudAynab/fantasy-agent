import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { getLineupRecommendation } from '../api/client';
import type { LineupRecommendation } from '../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorBox from '../../components/ErrorBox';
import SectionTitle from '../../components/SectionTitle';
import ReasoningBox from '../../components/ReasoningBox';
import PlayerCard from '../../components/PlayerCard';
import HeroMatchupCard from '../../components/HeroMatchupCard';
import SwipeableChangeCard from '../../components/SwipeableChangeCard';
import CollapsibleSection from '../../components/CollapsibleSection';
import { Colors, Spacing } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RefreshControl } from 'react-native';

export default function DashboardScreen() {
  const [data, setData] = useState<LineupRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dismissedChanges, setDismissedChanges] = useState<Set<number>>(new Set());

  const load = useCallback(async () => {
    try {
      setError(null);
      setData(await getLineupRecommendation());
      setDismissedChanges(new Set());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner />;

  function dismissChange(index: number) {
    setDismissedChanges((prev) => new Set(prev).add(index));
  }

  const visibleChanges = data?.changes.filter((_, i) => !dismissedChanges.has(i)) ?? [];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.accent} />}
      >
        {error ? (
          <ErrorBox message={error} onRetry={load} />
        ) : data ? (
          <>
            {data.matchup && (
              <HeroMatchupCard matchup={data.matchup} />
            )}

            <SectionTitle>Starting Lineup</SectionTitle>
            {data.starters.map((slot) => (
              <PlayerCard
                key={slot.player.id}
                player={slot.player}
                slotLabel={slot.slot}
                projectedPoints={slot.player.projectedPoints}
              />
            ))}

            {visibleChanges.length > 0 && (
              <>
                <SectionTitle>Suggested Changes</SectionTitle>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.changesRow}>
                  {data.changes.map((change, i) =>
                    dismissedChanges.has(i) ? null : (
                      <SwipeableChangeCard key={i} change={change} index={i} onDismiss={dismissChange} />
                    )
                  )}
                </ScrollView>
              </>
            )}

            <View style={styles.reasoningWrap}>
              <CollapsibleSection title="Agent Reasoning" defaultExpanded={false}>
                <ReasoningBox text={data.reasoning} />
              </CollapsibleSection>
            </View>

            {data.bench.length > 0 && (
              <>
                <SectionTitle>Bench</SectionTitle>
                {data.bench.map((slot) => (
                  <PlayerCard
                    key={slot.player.id}
                    player={slot.player}
                    slotLabel={slot.slot}
                    projectedPoints={slot.player.projectedPoints}
                    dimmed
                  />
                ))}
              </>
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.bg },
  scroll:        { padding: Spacing.xl, gap: Spacing.md },
  changesRow:    { gap: Spacing.md, paddingVertical: Spacing.sm },
  reasoningWrap: { marginTop: Spacing.sm },
});
