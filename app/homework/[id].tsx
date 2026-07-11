import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { homeworkApi } from '../../src/api/homework';
import { GradientBackground } from '../../src/components/layout/GradientBackground';
import { GlassCard } from '../../src/components/cards/GlassCard';
import { PrimaryButton } from '../../src/components/buttons/PrimaryButton';
import { ListSkeleton } from '../../src/components/loaders/CardSkeleton';
import { useTokenStore } from '../../src/store/tokenStore';
import { queryClient } from '../../src/lib/queryClient';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '../../src/constants/theme';
import { formatDueDate } from '../../src/utils/date';
import { analytics } from '../../src/services/analyticsService';

export default function HomeworkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { previewOnly } = useTokenStore();
  const router = useRouter();

  const { data: homework, isLoading: loadingHomework } = useQuery({
    queryKey: ['homework', id],
    queryFn: () => homeworkApi.getById(id),
    enabled: !!id,
  });

  const { data: submission, isLoading: loadingSubmission } = useQuery({
    queryKey: ['submission', id],
    queryFn: () => homeworkApi.mySubmission(id),
    enabled: !!id && !previewOnly && !(homework?.preview_only),
  });

  const { mutate: submitHomework, isPending: submitting } = useMutation({
    mutationFn: (formData: FormData) => homeworkApi.submit(id, formData),
    onSuccess: () => {
      analytics.track('submit_homework', { homework_id: id });
      queryClient.invalidateQueries({ queryKey: ['submission', id] });
      Alert.alert('Success', 'Homework submitted successfully!');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to submit homework. Please try again.');
    },
  });

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const file = result.assets[0];
      
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
      } as any);

      submitHomework(formData);
    } catch (error) {
      console.error("Document picking error:", error);
      Alert.alert('Error', 'Failed to pick document.');
    }
  };

  const handleOpenAttachment = () => {
    if (homework?.attachment_url) {
      analytics.track('open_homework_attachment', { homework_id: id });
      Linking.openURL(homework.attachment_url);
    }
  };

  if (loadingHomework || (loadingSubmission && !previewOnly)) {
    return (
      <GradientBackground>
        <View style={styles.pad}>
          <ListSkeleton count={3} />
        </View>
      </GradientBackground>
    );
  }

  if (!homework) return null;

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.headerCard}>
          <Text style={styles.subject}>{homework.subject}</Text>
          <Text style={styles.title}>{homework.title}</Text>
          <Text style={styles.description}>{homework.description}</Text>
          
          <View style={styles.metaRow}>
            <View>
              <Text style={styles.metaLabel}>Assigned By</Text>
              <Text style={styles.metaValue}>{homework.assigned_by}</Text>
            </View>
            <View>
              <Text style={styles.metaLabel}>Due Date</Text>
              <Text style={styles.metaValue}>{formatDueDate(homework.due_at)}</Text>
            </View>
          </View>

          {homework.attachment_url && (
            <PrimaryButton 
              label="📎 View Attachment" 
              onPress={handleOpenAttachment}
              style={{ marginTop: 16 }}
            />
          )}
        </GlassCard>

        {previewOnly || homework.preview_only ? (
          <GlassCard style={styles.lockedCard}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.lockTitle}>Unlock to submit homework</Text>
            <Text style={styles.lockBody}>
              Submitting homework and receiving grades is available to subscribers. Contact us to get a plan.
            </Text>
            <PrimaryButton
              label="📱 Contact on WhatsApp"
              onPress={() => Linking.openURL('https://wa.me/977XXXXXXXXXX')}
              fullWidth
              style={{ marginTop: 16 }}
            />
            <Text style={styles.alreadyHave} onPress={() => router.push('/(tabs)/profile')}>
              Already have a token? Go to Profile →
            </Text>
          </GlassCard>
        ) : (
          <GlassCard style={styles.submissionCard}>
            <Text style={styles.sectionTitle}>Your Submission</Text>
            
            {submission ? (
              <View style={styles.submittedContainer}>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>✅ Submitted</Text>
                </View>
                <Text style={styles.submittedDate}>
                  On {formatDueDate(submission.submitted_at)}
                </Text>
                
                {submission.grade ? (
                  <View style={styles.gradeBox}>
                    <Text style={styles.gradeLabel}>Grade / Remarks</Text>
                    <Text style={styles.gradeValue}>{submission.grade}</Text>
                  </View>
                ) : (
                  <Text style={styles.pendingGrade}>Waiting for teacher's grade...</Text>
                )}
                
                <PrimaryButton 
                  label="📄 View Submitted File" 
                  onPress={() => Linking.openURL(submission.file_url)}
                  style={{ marginTop: 16 }}
                />
              </View>
            ) : (
              <View style={styles.uploadContainer}>
                <Text style={styles.uploadText}>
                  Complete your homework and upload the file here.
                </Text>
                <PrimaryButton 
                  label="📤 Select File & Submit" 
                  onPress={handlePickDocument}
                  loading={submitting}
                  fullWidth
                />
              </View>
            )}
          </GlassCard>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  pad:            { padding: Spacing.md, paddingTop: 20 },
  scroll:         { padding: Spacing.md, paddingTop: 20, gap: 14 },
  headerCard:     {},
  subject:        { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  title:          { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.navy, lineHeight: 28, marginBottom: 8 },
  description:    { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22, marginBottom: 16 },
  metaRow:        { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: Colors.surface, padding: 12, borderRadius: Radius.sm },
  metaLabel:      { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 2 },
  metaValue:      { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.navy },
  lockedCard:     { alignItems: 'center' },
  lockIcon:       { fontSize: 48, marginBottom: 12 },
  lockTitle:      { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.navy, marginBottom: 8, textAlign: 'center' },
  lockBody:       { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  alreadyHave:    { marginTop: 14, fontSize: FontSize.sm, color: Colors.primary, textDecorationLine: 'underline', textAlign: 'center' },
  submissionCard: {},
  sectionTitle:   { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.navy, marginBottom: 12 },
  uploadContainer:{ alignItems: 'center', paddingVertical: 10 },
  uploadText:     { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', marginBottom: 16 },
  submittedContainer: { alignItems: 'flex-start' },
  statusBadge:    { backgroundColor: '#D1FAE5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, marginBottom: 8 },
  statusText:     { color: '#059669', fontWeight: FontWeight.bold, fontSize: FontSize.sm },
  submittedDate:  { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 16 },
  gradeBox:       { backgroundColor: '#FEF3C7', padding: 12, borderRadius: Radius.sm, width: '100%', marginBottom: 8 },
  gradeLabel:     { fontSize: FontSize.xs, color: '#D97706', textTransform: 'uppercase', fontWeight: FontWeight.bold, marginBottom: 4 },
  gradeValue:     { fontSize: FontSize.md, color: '#92400E', fontWeight: FontWeight.semibold },
  pendingGrade:   { fontSize: FontSize.sm, color: Colors.textMuted, fontStyle: 'italic', marginBottom: 8 },
});
