import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../src/theme';

interface Props {
  message: string;
  onRetry: () => void;
}

export default function ErrorBox({ message, onRetry }: Props) {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{message}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.7}>
        <Text style={styles.retry}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  box:      { alignItems: 'center', gap: Spacing.lg, paddingTop: Spacing.xl5 },
  text:     { ...Typography.body, color: Colors.error.DEFAULT, textAlign: 'center', paddingHorizontal: Spacing.xl3 },
  retryBtn: { backgroundColor: Colors.accent, paddingHorizontal: Spacing.xl3, paddingVertical: Spacing.md, borderRadius: Radius.full },
  retry:    { ...Typography.bodyBold, color: Colors.bg },
});
