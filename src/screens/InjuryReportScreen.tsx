import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getInjuryReport } from '../api/client';
import type { InjuryReport } from '../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorBox from '../../components/ErrorBox';
import ScreenContainer from '../../components/ScreenContainer';
import InjuryCard from '../../components/InjuryCard';
import { Colors, Spacing, Typography } from '../theme';

export default function InjuryReportScreen() {
  const [injuries, setInjuries] = useState<InjuryReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setInjuries(await getInjuryReport());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner />;

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} scrollGap={Spacing.md}>
      {error ? (
        <ErrorBox message={error} onRetry={load} />
      ) : injuries.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle" size={56} color={Colors.accent} />
          <Text style={styles.emptyTitle}>All Clear</Text>
          <Text style={styles.emptySub}>No injury concerns on your roster.</Text>
        </View>
      ) : (
        <>
          <Text style={styles.countHeader}>
            INJURY REPORT ({injuries.length})
          </Text>
          {injuries.map((report) => (
            <InjuryCard key={report.player.id} report={report} />
          ))}
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  emptyState:  { alignItems: 'center', gap: Spacing.lg, paddingTop: Spacing.xl6 },
  emptyTitle:  { ...Typography.heading, color: Colors.text },
  emptySub:    { ...Typography.body, color: Colors.muted, textAlign: 'center' },
  countHeader: { ...Typography.micro, color: Colors.muted, marginBottom: Spacing.sm },
});
