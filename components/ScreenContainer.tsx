import React from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RefreshControl } from 'react-native';
import { Colors, Spacing } from '../src/theme';

interface Props {
  children: React.ReactNode;
  refreshing: boolean;
  onRefresh: () => void;
  scrollGap?: number;
  contentStyle?: ViewStyle;
}

export default function ScreenContainer({ children, refreshing, onRefresh, scrollGap = Spacing.md, contentStyle }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { gap: scrollGap }, contentStyle]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />
        }
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll:    { padding: Spacing.xl },
});
