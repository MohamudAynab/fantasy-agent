import React from 'react';
import Markdown from 'react-native-markdown-display';
import { Colors, Typography } from '../src/theme';

interface Props {
  content: string;
}

const markdownStyles = {
  body:       { color: Colors.text, ...Typography.body },
  strong:     { color: Colors.text, fontWeight: '700' as const },
  em:         { color: Colors.textSub },
  bullet_list_icon: { color: Colors.accent },
  code_inline: { backgroundColor: Colors.surfaceHigh, color: Colors.accent, paddingHorizontal: 4, borderRadius: 4 },
  code_block:  { backgroundColor: Colors.surfaceHigh, padding: 12, borderRadius: 8 },
  fence:       { backgroundColor: Colors.surfaceHigh, padding: 12, borderRadius: 8 },
  link:        { color: Colors.accent },
  paragraph:   { marginTop: 0, marginBottom: 4 },
};

export default function MarkdownText({ content }: Props) {
  return <Markdown style={markdownStyles}>{content}</Markdown>;
}
