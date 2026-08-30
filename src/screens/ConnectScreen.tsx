import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { connectEspn, getAuthStatus } from '../api/client';
import { Colors, Typography, Spacing, Radius } from '../theme';

interface Props {
  onConnected: () => void;
}

export default function ConnectScreen({ onConnected }: Props) {
  const [swid, setSwid] = useState('');
  const [espnS2, setEspnS2] = useState('');
  const [leagueId, setLeagueId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [seasonId, setSeasonId] = useState(String(new Date().getFullYear()));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = swid.trim() && espnS2.trim() && leagueId.trim() && teamId.trim() && seasonId.trim() && !submitting;

  async function handleConnect() {
    setSubmitting(true);
    setError(null);
    try {
      await connectEspn({
        swid: swid.trim(),
        espnS2: espnS2.trim(),
        leagueId: leagueId.trim(),
        teamId: teamId.trim(),
        seasonId: seasonId.trim(),
      });
      const status = await getAuthStatus();
      if (status.authenticated) onConnected();
    } catch (e: any) {
      setError(e.message ?? 'Failed to connect');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Fantasy Agent</Text>
          <Text style={styles.subtitle}>
            Connect your ESPN Fantasy league to get AI-powered draft help, lineup advice, waiver recommendations, and trade analysis.
          </Text>

          <Text style={styles.instructions}>
            Log into ESPN Fantasy in a browser, open dev tools → Application/Storage → Cookies →
            fantasy.espn.com, and copy the SWID and espn_s2 values. League ID and Team ID come from
            your team page URL (fantasy.espn.com/football/team?leagueId=...&teamId=...).
          </Text>

          <Field label="SWID" value={swid} onChangeText={setSwid} placeholder="{XXXXXXXX-XXXX-...}" />
          <Field label="espn_s2" value={espnS2} onChangeText={setEspnS2} placeholder="Long cookie string" multiline />
          <Field label="League ID" value={leagueId} onChangeText={setLeagueId} placeholder="1991826081" keyboardType="number-pad" />
          <Field label="Team ID" value={teamId} onChangeText={setTeamId} placeholder="10" keyboardType="number-pad" />
          <Field label="Season" value={seasonId} onChangeText={setSeasonId} placeholder="2026" keyboardType="number-pad" />

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.button, !canSubmit && styles.buttonDisabled]}
            onPress={handleConnect}
            disabled={!canSubmit}
          >
            <Text style={styles.buttonText}>{submitting ? 'Connecting...' : 'Connect ESPN Fantasy'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'number-pad';
}

function Field({ label, value, onChangeText, placeholder, multiline, keyboardType }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textDim}
        autoCapitalize="none"
        autoCorrect={false}
        multiline={multiline}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    padding: Spacing.xl3,
    paddingTop: Spacing.xl4,
  },
  title: {
    ...Typography.display,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSub,
    marginBottom: Spacing.xl2,
  },
  instructions: {
    ...Typography.caption,
    color: Colors.textSub,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl2,
  },
  field: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    ...Typography.label,
    color: Colors.textSub,
    marginBottom: Spacing.sm,
  },
  input: {
    ...Typography.body,
    color: Colors.text,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  inputMultiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  error: {
    ...Typography.caption,
    color: Colors.error.DEFAULT,
    marginBottom: Spacing.lg,
  },
  button: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...Typography.bodyBold,
    color: Colors.bg,
  },
});
