import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getWaiverRecommendations } from '../api/client';
import type { WaiverRecommendations } from '../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorBox from '../../components/ErrorBox';
import ScreenContainer from '../../components/ScreenContainer';
import SectionTitle from '../../components/SectionTitle';
import PlayerCard from '../../components/PlayerCard';
import FilterChipRow from '../../components/FilterChipRow';
import CollapsibleSection from '../../components/CollapsibleSection';
import ReasoningBox from '../../components/ReasoningBox';
import { Colors } from '../theme';

const POSITION_FILTERS = ['All', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

export default function WaiverWireScreen() {
  const [data, setData] = useState<WaiverRecommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posFilter, setPosFilter] = useState('All');

  const load = useCallback(async () => {
    try {
      setError(null);
      setData(await getWaiverRecommendations());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner />;

  const filteredPickups = data
    ? posFilter === 'All'
      ? data.pickups
      : data.pickups.filter((p) => p.position === posFilter)
    : [];

  return (
    <SafeAreaView style={styles.container} edges={['bottom'] as any}>
      <FilterChipRow options={POSITION_FILTERS} selected={posFilter} onSelect={setPosFilter} />
      <ScreenContainer refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }}>
        {error ? (
          <ErrorBox message={error} onRetry={load} />
        ) : data ? (
          <>
            <SectionTitle>Recommended Pickups</SectionTitle>
            {filteredPickups.map((player, i) => (
              <PlayerCard
                key={player.id}
                player={player}
                rankNumber={i + 1}
                showPercentOwned
                trend={player.trend}
                addReasonChip={player.addReason}
              />
            ))}

            {data.drops.length > 0 && (
              <>
                <SectionTitle>Consider Dropping</SectionTitle>
                {data.drops.map((player) => (
                  <PlayerCard key={player.id} player={player} dimmed />
                ))}
              </>
            )}

            <View style={styles.reasoningWrap}>
              <CollapsibleSection title="Agent Reasoning">
                <ReasoningBox text={data.reasoning} />
              </CollapsibleSection>
            </View>
          </>
        ) : null}
      </ScreenContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.bg },
  reasoningWrap:{ marginTop: 8 },
});
