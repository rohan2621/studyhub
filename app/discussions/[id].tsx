import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { discussionApi } from '../../src/api/discussion';
import { GradientBackground } from '../../src/components/layout/GradientBackground';
import { GlassCard } from '../../src/components/cards/GlassCard';
import { PrimaryButton } from '../../src/components/buttons/PrimaryButton';
import { ListSkeleton } from '../../src/components/loaders/CardSkeleton';
import { useTokenStore } from '../../src/store/tokenStore';
import { useOfflineQueueStore } from '../../src/store/offlineQueueStore';
import { queryClient } from '../../src/lib/queryClient';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../src/constants/theme';
import { relativeTime } from '../../src/utils/date';

export default function DiscussionDetailScreen() {
  const { id }            = useLocalSearchParams<{ id: string }>();
  const { previewOnly }   = useTokenStore();
  const { isOffline, enqueue } = useOfflineQueueStore();
  const [replyText, setReplyText] = useState('');

  const { data: thread } = useInfiniteQuery({
    queryKey: ['thread', id],
    queryFn:  () => discussionApi.getThread(id),
    initialPageParam: undefined,
    getNextPageParam: () => undefined,
  });

  const { data: repliesData, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['replies', id],
    queryFn:  ({ pageParam }) => discussionApi.getReplies(id, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (p) => p.next_cursor ?? undefined,
    enabled: !!id,
  });

  const replies = repliesData?.pages.flatMap((p) => p.data) ?? [];

  const { mutate: postReply, isPending } = useMutation({
    mutationFn: (body: string) => discussionApi.createReply(id, body),
    onSuccess: () => {
      setReplyText('');
      queryClient.invalidateQueries({ queryKey: ['replies', id] });
    },
    onError: (err: any) => Alert.alert('Error', 'Could not post reply.'),
  });

  function handleReply() {
    if (!replyText.trim()) return;
    if (isOffline) {
      enqueue({ id: Date.now().toString(), type: 'discussion_reply', payload: { threadId: id, body: replyText } });
      setReplyText('');
      Alert.alert('Saved offline', 'Your reply will be posted when you reconnect.');
      return;
    }
    postReply(replyText.trim());
  }

  const threadData = thread?.pages[0];

  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Thread header */}
        {threadData && (
          <GlassCard style={styles.threadCard}>
            <Text style={styles.subject}>{threadData.subject}</Text>
            <Text style={styles.threadTitle}>{threadData.title}</Text>
            <Text style={styles.threadBody}>{threadData.body}</Text>
            <Text style={styles.meta}>{threadData.author?.name} · {relativeTime(threadData.created_at)}</Text>
          </GlassCard>
        )}

        {/* Replies */}
        {isLoading ? (
          <ListSkeleton count={4} />
        ) : (
          <FlatList
            data={replies}
            keyExtractor={(r) => r.id}
            contentContainerStyle={styles.listPad}
            renderItem={({ item }) => (
              <GlassCard style={styles.replyCard}>
                <Text style={styles.replyAuthor}>{item.author?.name}</Text>
                <Text style={styles.replyBody}>{item.body}</Text>
                <Text style={styles.replyMeta}>{relativeTime(item.created_at)}</Text>
              </GlassCard>
            )}
            onEndReached={() => hasNextPage && fetchNextPage()}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Reply composer */}
        {previewOnly ? (
          <View style={styles.lockedComposer}>
            <Text style={styles.lockedText}>🔒 Unlock access to post replies</Text>
          </View>
        ) : (
          <View style={styles.composer}>
            <TextInput
              style={styles.composerInput}
              placeholder="Write a reply..."
              placeholderTextColor={Colors.textMuted}
              value={replyText}
              onChangeText={setReplyText}
              multiline
            />
            <PrimaryButton label={isOffline ? 'Queue' : 'Post'} onPress={handleReply} loading={isPending} />
          </View>
        )}
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  threadCard:     { margin: Spacing.md, marginBottom: 0 },
  subject:        { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semibold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  threadTitle:    { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.navy, marginBottom: 8, lineHeight: 24 },
  threadBody:     { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22, marginBottom: 8 },
  meta:           { fontSize: FontSize.xs, color: Colors.textMuted },
  listPad:        { padding: Spacing.md, gap: 10 },
  replyCard:      {},
  replyAuthor:    { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.navy, marginBottom: 4 },
  replyBody:      { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22, marginBottom: 6 },
  replyMeta:      { fontSize: FontSize.xs, color: Colors.textMuted },
  composer:       { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.white },
  composerInput:  { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 12, fontSize: FontSize.md, color: Colors.navy, maxHeight: 100 },
  lockedComposer: { padding: Spacing.md, alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface },
  lockedText:     { fontSize: FontSize.sm, color: Colors.textMuted },
});
