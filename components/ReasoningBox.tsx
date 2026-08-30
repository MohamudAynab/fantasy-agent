import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '../src/theme';

export default function ReasoningBox({ text }: { text: string }) {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box:  { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.lg },
  text: { color: Colors.textSub, fontSize: 14, lineHeight: 22 },
});
