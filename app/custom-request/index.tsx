import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { requestApi } from '@api/request';
import { customRequestSchema, CustomRequestFormData } from '@validation/customRequest.schema';
import { GradientBackground } from '@components/layout/GradientBackground';
import { GlassCard } from '@components/cards/GlassCard';
import { PrimaryButton } from '@components/buttons/PrimaryButton';
import { useOfflineQueueStore } from '@store/offlineQueueStore';
import { analytics } from '@services/analyticsService';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@constants/theme';

const TYPES = [
  { value: 'note',        label: '📄 Note' },
  { value: 'topper_note', label: '⭐ Topper Note' },
  { value: 'homework',    label: '📝 Homework' },
  { value: 'pyq',         label: '📋 Past Paper' },
];

export default function CustomRequestScreen() {
  const router = useRouter();
  const { isOffline, enqueue } = useOfflineQueueStore();

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<CustomRequestFormData>({
    resolver: zodResolver(customRequestSchema),
    defaultValues: { type: 'note', subject: '', chapter: '', note: '' },
  });

  const selectedType = watch('type');

  const { mutate, isPending } = useMutation({
    mutationFn: requestApi.create,
    onSuccess: () => {
      analytics.track('custom_request_submit');
      Alert.alert('Request sent!', 'We\'ll try to upload this content soon.', [{ text: 'OK', onPress: () => router.back() }]);
    },
    onError: () => Alert.alert('Error', 'Failed to send request. Please try again.'),
  });

  function onSubmit(data: CustomRequestFormData) {
    if (isOffline) {
      enqueue({ id: Date.now().toString(), type: 'custom_request', payload: data as any });
      Alert.alert('Saved offline', 'Request will be sent when you reconnect.', [{ text: 'OK', onPress: () => router.back() }]);
      return;
    }
    mutate(data);
  }

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <GlassCard>
          <Text style={styles.heading}>Can't find what you need?</Text>
          <Text style={styles.sub}>Tell us what you're looking for and we'll try to add it.</Text>

          {/* Type selector */}
          <Text style={styles.label}>Content type</Text>
          <View style={styles.typeRow}>
            {TYPES.map((t) => (
              <View key={t.value} style={[styles.typeChip, selectedType === t.value && styles.typeChipActive]}
                onStartShouldSetResponder={() => { setValue('type', t.value as any); return true; }}>
                <Text style={[styles.typeChipText, selectedType === t.value && styles.typeChipTextActive]}>{t.label}</Text>
              </View>
            ))}
          </View>
          {errors.type && <Text style={styles.errorText}>{errors.type.message}</Text>}

          {/* Subject */}
          <Text style={styles.label}>Subject</Text>
          <Controller control={control} name="subject" render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={[styles.input, errors.subject && styles.inputError]}
              placeholder="e.g. Mathematics" placeholderTextColor={Colors.textMuted}
              onBlur={onBlur} onChangeText={onChange} value={value} />
          )} />
          {errors.subject && <Text style={styles.errorText}>{errors.subject.message}</Text>}

          {/* Chapter */}
          <Text style={styles.label}>Chapter / Topic</Text>
          <Controller control={control} name="chapter" render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={[styles.input, errors.chapter && styles.inputError]}
              placeholder="e.g. Chapter 4 – Quadratic Equations"
              placeholderTextColor={Colors.textMuted}
              onBlur={onBlur} onChangeText={onChange} value={value} />
          )} />
          {errors.chapter && <Text style={styles.errorText}>{errors.chapter.message}</Text>}

          {/* Additional note */}
          <Text style={styles.label}>Additional details (optional)</Text>
          <Controller control={control} name="note" render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={[styles.input, styles.multiline]}
              placeholder="Anything specific we should know..."
              placeholderTextColor={Colors.textMuted}
              multiline numberOfLines={4}
              onBlur={onBlur} onChangeText={onChange} value={value} />
          )} />

          <PrimaryButton
            label={isOffline ? '📥 Save for later' : '📨 Send Request'}
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
  multiline:       { height: 100, textAlignVertical: 'top' },
  errorText:       { fontSize: FontSize.xs, color: Colors.error, marginBottom: 8 },
  typeRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  typeChip:        { paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.md, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  typeChipActive:  { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeChipText:    { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  typeChipTextActive:{ color: Colors.white },
});
