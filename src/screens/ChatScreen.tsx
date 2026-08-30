import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { sendChatMessage } from '../api/client';
import type { AgentMessage } from '../types';
import { AgentAvatar, UserAvatar } from '../../components/ChatAvatars';
import TypingIndicator from '../../components/TypingIndicator';
import MarkdownText from '../../components/MarkdownText';
import QuickActionBar from '../../components/QuickActionBar';
import { Colors, Radius, Spacing, Typography } from '../theme';

const SUGGESTIONS = [
  'Should I start my flex this week?',
  'Who should I target on waivers?',
  'Analyze my team strengths and weaknesses',
  'What trades should I be making?',
];

const QUICK_ACTIONS = [
  'Tell me more',
  'Any waiver pickups?',
  'What about trades?',
  'Check my injuries',
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: AgentMessage = { role: 'user', content: text.trim(), timestamp: new Date().toISOString() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const reply = await sendChatMessage(text.trim(), messages);
      setMessages([...next, { role: 'assistant', content: reply, timestamp: new Date().toISOString() }]);
    } catch (e: any) {
      setMessages([...next, { role: 'assistant', content: `Error: ${e.message}`, timestamp: new Date().toISOString() }]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <AgentAvatar size={56} />
            <Text style={styles.emptyTitle}>Fantasy Agent</Text>
            <Text style={styles.emptySub}>Ask me anything about your roster</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionRow}>
              {SUGGESTIONS.map((s) => (
                <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => send(s)} activeOpacity={0.7}>
                  <Text style={styles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(_, i) => String(i)}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item, index }) => {
              const isLast = index === messages.length - 1;
              if (item.role === 'user') {
                return (
                  <View style={styles.userRow}>
                    <View style={styles.userBubble}>
                      <Text style={styles.userText}>{item.content}</Text>
                    </View>
                    <UserAvatar size={28} />
                  </View>
                );
              }
              return (
                <View style={styles.agentRow}>
                  <AgentAvatar size={28} />
                  <View style={styles.agentBubbleWrap}>
                    <View style={styles.agentBubble}>
                      <MarkdownText content={item.content} />
                    </View>
                    {isLast && !loading && (
                      <QuickActionBar
                        actions={QUICK_ACTIONS.map((label) => ({ label, onPress: () => send(label) }))}
                      />
                    )}
                  </View>
                </View>
              );
            }}
          />
        )}

        <TypingIndicator visible={loading} />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about your team…"
            placeholderTextColor={Colors.textDim}
            returnKeyType="send"
            onSubmitEditing={() => send(input)}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendDisabled]}
            onPress={() => send(input)}
            disabled={!input.trim() || loading}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-up-circle" size={36} color={input.trim() && !loading ? Colors.accent : Colors.muted} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: Colors.bg },
  emptyState:      { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.lg, padding: Spacing.xl3 },
  emptyTitle:      { ...Typography.heading, color: Colors.text },
  emptySub:        { ...Typography.body, color: Colors.muted },
  suggestionRow:   { gap: Spacing.md, paddingVertical: Spacing.md },
  suggestionChip:  { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, maxWidth: 220 },
  suggestionText:  { ...Typography.body, color: Colors.textSub },
  messageList:     { padding: Spacing.xl, gap: Spacing.lg },
  userRow:         { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', gap: Spacing.md },
  agentRow:        { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  agentBubbleWrap: { flex: 1, gap: Spacing.sm },
  userBubble:      { backgroundColor: Colors.accent, borderRadius: Radius.xl, borderBottomRightRadius: Radius.sm, padding: Spacing.lg, maxWidth: '80%' },
  userText:        { ...Typography.body, color: Colors.bg },
  agentBubble:     { backgroundColor: Colors.surface, borderRadius: Radius.xl, borderBottomLeftRadius: Radius.sm, padding: Spacing.lg, flex: 1 },
  inputRow:        { flexDirection: 'row', padding: Spacing.lg, gap: Spacing.md, alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: Colors.surface },
  input:           { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.xl, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, color: Colors.text, ...Typography.body, maxHeight: 120 },
  sendBtn:         { justifyContent: 'center', alignItems: 'center' },
  sendDisabled:    {},
});
