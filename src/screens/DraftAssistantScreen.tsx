import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getDraftBoard } from '../api/client';
import type { DraftRecommendation, Player } from '../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorBox from '../../components/ErrorBox';
import ScreenContainer from '../../components/ScreenContainer';
import SectionTitle from '../../components/SectionTitle';
import PlayerCard from '../../components/PlayerCard';
import PlayerChip from '../../components/PlayerChip';
import CollapsibleSection from '../../components/CollapsibleSection';
import ReasoningBox from '../../components/ReasoningBox';
import { Colors, Radius, Spacing, Typography } from '../theme';

export default function DraftAssistantScreen() {
  const [data, setData] = useState<DraftRecommendation | null>(null);
  const [draftedPlayers, setDraftedPlayers] = useState<Player[]>([]);
  const [myPickIds, setMyPickIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBoard = useCallback(async (draftedIds: string[], myPicks: string[]) => {
    try {
      setError(null);
      setData(await getDraftBoard(draftedIds, myPicks));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBoard([], []);
  }, [loadBoard]);

  async function markDrafted(player: Player, mine: boolean) {
    if (draftedPlayers.some((p) => p.id === player.id)) return;
    const nextDrafted = [...draftedPlayers, player];
    const nextMyPicks = mine ? [...myPickIds, player.id] : myPickIds;
    setDraftedPlayers(nextDrafted);
    setMyPickIds(nextMyPicks);
    await loadBoard(nextDrafted.map((p) => p.id), nextMyPicks);
  }

  async function undoDrafted(player: Player) {
    const nextDrafted = draftedPlayers.filter((p) => p.id !== player.id);
    const nextMyPicks = myPickIds.filter((id) => id !== player.id);
    setDraftedPlayers(nextDrafted);
    setMyPickIds(nextMyPicks);
    await loadBoard(nextDrafted.map((p) => p.id), nextMyPicks);
  }

  function refresh() {
    setRefreshing(true);
    loadBoard(draftedPlayers.map((p) => p.id), myPickIds);
  }

  if (loading) return <LoadingSpinner />;

  const myPicks = draftedPlayers.filter((p) => myPickIds.includes(p.id));
  const draftedIdSet = new Set(draftedPlayers.map((p) => p.id));
  const suggested = data?.suggested.filter((p) => !draftedIdSet.has(p.id)) ?? [];
  const available = data?.available.filter((p) => !draftedIdSet.has(p.id)) ?? [];

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={refresh}>
      {error ? (
        <ErrorBox message={error} onRetry={() => loadBoard(draftedPlayers.map((p) => p.id), myPickIds)} />
      ) : data ? (
        <>
          {myPicks.length > 0 && (
            <>
              <SectionTitle>{`My Team (${myPicks.length})`}</SectionTitle>
              <View style={styles.chipRow}>
                {myPicks.map((p) => (
                  <PlayerChip key={p.id} player={p} onRemove={() => undoDrafted(p)} size="sm" />
                ))}
              </View>
            </>
          )}

          {draftedPlayers.length > myPicks.length && (
            <>
              <SectionTitle>{`Drafted by Others (${draftedPlayers.length - myPicks.length})`}</SectionTitle>
              <View style={styles.chipRow}>
                {draftedPlayers
                  .filter((p) => !myPickIds.includes(p.id))
                  .map((p) => (
                    <PlayerChip key={p.id} player={p} onRemove={() => undoDrafted(p)} size="sm" />
                  ))}
              </View>
            </>
          )}

          <SectionTitle>Suggested Picks</SectionTitle>
          {suggested.map((player, i) => (
            <PlayerCard
              key={player.id}
              player={player}
              rankNumber={i + 1}
              onPress={() => markDrafted(player, true)}
            />
          ))}

          <SectionTitle>Available Players</SectionTitle>
          {available.map((player) => (
            <View key={player.id} style={styles.availableRow}>
              <PlayerCard player={player} showPercentOwned trend={player.trend} addReasonChip={player.addReason} />
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.myPickBtn} onPress={() => markDrafted(player, true)}>
                  <Text style={styles.myPickText}>My Pick</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.draftedBtn} onPress={() => markDrafted(player, false)}>
                  <Text style={styles.draftedText}>Mark Drafted</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <View style={styles.reasoningWrap}>
            <CollapsibleSection title="Agent Reasoning">
              <ReasoningBox text={data.reasoning} />
            </CollapsibleSection>
          </View>
        </>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  availableRow: { gap: Spacing.sm },
  actionRow: { flexDirection: 'row', gap: Spacing.md },
  myPickBtn: {
    flex: 1,
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
  },
  myPickText: { ...Typography.caption, color: Colors.bg, fontWeight: '700' },
  draftedBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 2,
    alignItems: 'center',
  },
  draftedText: { ...Typography.caption, color: Colors.textSub, fontWeight: '700' },
  reasoningWrap: { marginTop: Spacing.sm },
});
