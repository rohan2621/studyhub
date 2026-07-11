import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { discussionApi } from '@api/discussion';
import { newDiscussionSchema, NewDiscussionFormData } from '@validation/discussion.schema';
import { GradientBackground } from '@components/layout/GradientBackground';
import { GlassCard } from '@components/cards/GlassCard';
import { PrimaryButton } from '@components/buttons/PrimaryButton';
import { useOfflineQueueStore } from '@store/offlineQueueStore';
import { queryClient } from '../../src/lib/queryClient';
import { analytics } from '@services/analyticsService';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@constants/theme';

export default function NewDiscussionScreen() {
  const router = useRouter();
  const { isOffline, enqueue } = useOfflineQueueStore();

  const { control, handleSubmit, formState: { errors } } = useForm<NewDiscussionFormData>({
    resolver: zodResolver(newDiscussionSchema),
    defaultValues: { subject: '', title: '', body: '' },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: discussionApi.createThread,
    onSuccess: (data) => {
      analytics.track('create_discussion');
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      router.replace(`/discussions/${data.id}`);
    },
    onError: () => Alert.alert('Error', 'Failed to create discussion. Please try again.'),
  });

  function onSubmit(data: NewDiscussionFormData) {
    if (isOffline) {
      // For offline support, we enqueue and navigate back to the list
      enqueue({ id: Date.now().toString(), type: 'discussion_thread', payload: data as any });
      Alert.alert('Saved offline', 'Discussion will be posted when you reconnect.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      return;
    }
    mutate(data);
  }

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <GlassCard>
          <Text style={styles.heading}>Start a new discussion</Text>
          <Text style={styles.sub}>Ask a question or share knowledge with your schoolmates.</Text>

          {/* Subject */}
          <Text style={styles.label}>Subject</Text>
          <Controller control={control} name="subject" render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={[styles.input, errors.subject && styles.inputError]}
              placeholder="e.g. Physics, General, Events" placeholderTextColor={Colors.textMuted}
              onBlur={onBlur} onChangeText={onChange} value={value} />
          )} />
          {errors.subject && <Text style={styles.errorText}>{errors.subject.message}</Text>}

          {/* Title */}
          <Text style={styles.label}>Title</Text>
          <Controller control={control} name="title" render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={[styles.input, errors.title && styles.inputError]}
              placeholder="What is your discussion about?"
              placeholderTextColor={Colors.textMuted}
              onBlur={onBlur} onChangeText={onChange} value={value} />
          )} />
          {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}

          {/* Body */}
          <Text style={styles.label}>Details</Text>
          <Controller control={control} name="body" render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={[styles.input, styles.multiline, errors.body && styles.inputError]}
              placeholder="Explain your question or topic in detail..."
              placeholderTextColor={Colors.textMuted}
              multiline numberOfLines={6}
              onBlur={onBlur} onChangeText={onChange} value={value} />
          )} />
          {errors.body && <Text style={styles.errorText}>{errors.body.message}</Text>}

          <PrimaryButton
            label={isOffline ? '📥 Save for later' : '🚀 Post Discussion'}
            onPress={handleSubmit(onSubmit)}
            loading={isPending}
            fullWidth
            style={{ marginTop: 20 }}
          />
        </GlassCard>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll:          { padding: Spacing.md, paddingTop: 20 },
  heading:         { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.navy, marginBottom: 4 },
  sub:             { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: 20, lineHeight: 20 },
  label:           { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary, marginBottom: 8, marginTop: 4 },
  input:           { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 13, fontSize: FontSize.md, color: Colors.navy, backgroundColor: Colors.surface, marginBottom: 4 },
  inputError:      { borderColor: Colors.error },
  multiline:       { height: 120, textAlignVertical: 'top' },
  errorText:       { fontSize: FontSize.xs, color: Colors.error, marginBottom: 8 },
});
