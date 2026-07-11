import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { authApi } from '@api/auth';
import { storage } from '@utils/storage';
import { useAuthStore } from '@store/authStore';
import type { AuthResponse, School } from '@t/api.types';
import { GradientBackground } from '@components/layout/GradientBackground';
import { GlassCard } from '@components/cards/GlassCard';
import { PrimaryButton } from '@components/buttons/PrimaryButton';
import { AppError, ErrorMessages } from '@constants/errors';
import { analytics } from '@services/analyticsService';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@constants/theme';
import { signupSchema, SignupFormData } from '@validation/auth.schema';

export default function SignupScreen() {
  const router = useRouter();
  const { setUser, setAuthenticated } = useAuthStore();
  const [schoolSearch, setSchoolSearch] = useState('');
  const [showSchoolList, setShowSchoolList] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: 'student' },
  });

  // School typeahead
  const { data: schools = [] } = useQuery({
    queryKey: ['schools', schoolSearch],
    queryFn: () => authApi.schools(schoolSearch),
    enabled: schoolSearch.length >= 2,
  });

  const { mutate, isPending } = useMutation<AuthResponse, Error, Parameters<typeof authApi.signup>[0]>({
    mutationFn: authApi.signup,
    onSuccess: async (data: AuthResponse) => {
      await storage.set(storage.KEYS.ACCESS_TOKEN, data.access_token);
      await storage.set(storage.KEYS.USER_ID, data.user.id);
      await storage.set(storage.KEYS.SCHOOL_ID, data.user.school_id);
      await storage.set(storage.KEYS.LAST_LOGIN, new Date().toISOString());
      setUser(data.user);
      setAuthenticated(true);
      analytics.track('signup');
      router.replace('/(auth)/intro');
    },
    onError: (err: any) => {
      const code = err?.appError as AppError ?? AppError.UNKNOWN_ERROR;
      Alert.alert('Signup failed', ErrorMessages[code]);
    },
  });

  function selectSchool(school: School) {
    setSelectedSchool(school);
    setSchoolSearch(school.name);
    setValue('school_id', school.id);
    setShowSchoolList(false);
  }

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <Text style={styles.logo}>📚</Text>
          <Text style={styles.appName}>StudyHub</Text>
        </View>

        <GlassCard style={styles.card}>
          <Text style={styles.heading}>Create your account</Text>

          {/* Account type — locked, not editable */}
          <Text style={styles.label}>Account type</Text>
          <View style={styles.lockedField}>
            <Text style={styles.lockedValue}>🎓 Student</Text>
            <Text style={styles.lockedHint}>Students only. Teachers are added by admin.</Text>
          </View>

          {/* Full name */}
          <Text style={styles.label}>Full name</Text>
          <Controller control={control} name="name" render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={[styles.input, errors.name && styles.inputError]}
              placeholder="Your full name" placeholderTextColor={Colors.textMuted}
              onBlur={onBlur} onChangeText={onChange} value={value} />
          )} />
          {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

          {/* Email */}
          <Text style={styles.label}>School email</Text>
          <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={[styles.input, errors.email && styles.inputError]}
              placeholder="you@school.edu" placeholderTextColor={Colors.textMuted}
              keyboardType="email-address" autoCapitalize="none"
              onBlur={onBlur} onChangeText={onChange} value={value} />
          )} />
          {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

          {/* School picker */}
          <Text style={styles.label}>School</Text>
          <TextInput
            style={[styles.input, errors.school_id && styles.inputError]}
            placeholder="Search your school..."
            placeholderTextColor={Colors.textMuted}
            value={schoolSearch}
            onChangeText={(v) => { setSchoolSearch(v); setShowSchoolList(true); }}
            onFocus={() => setShowSchoolList(true)}
          />
          {errors.school_id && <Text style={styles.errorText}>Please select a school</Text>}
          {showSchoolList && schools.length > 0 && (
            <View style={styles.dropdown}>
              {schools.slice(0, 5).map((s: School) => (
                <TouchableOpacity key={s.id} style={styles.dropdownItem} onPress={() => selectSchool(s)}>
                  <Text style={styles.dropdownText}>{s.name}</Text>
                  <Text style={styles.dropdownSub}>{s.city}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Grade */}
          <Text style={styles.label}>Grade / Class</Text>
          <Controller control={control} name="grade" render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={[styles.input, errors.grade && styles.inputError]}
              placeholder="e.g. Grade 10 / Class XI"
              placeholderTextColor={Colors.textMuted}
              onBlur={onBlur} onChangeText={onChange} value={value} />
          )} />
          {errors.grade && <Text style={styles.errorText}>{errors.grade.message}</Text>}

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <Controller control={control} name="password" render={({ field: { onChange, onBlur, value } }) => (
            <TextInput style={[styles.input, errors.password && styles.inputError]}
              placeholder="Min. 8 characters" placeholderTextColor={Colors.textMuted}
              secureTextEntry onBlur={onBlur} onChangeText={onChange} value={value} />
          )} />
          {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

          <PrimaryButton label="Create Account" onPress={handleSubmit((d) => mutate(d))}
            loading={isPending} fullWidth style={{ marginTop: 20 }} />

          <Text style={styles.loginLink} onPress={() => router.back()}>
            Already have an account? <Text style={styles.linkBold}>Log in</Text>
          </Text>
        </GlassCard>
        <View style={{ height: 40 }} />
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll:        { flexGrow: 1, padding: Spacing.lg, paddingTop: 60 },
  brand:         { alignItems: 'center', marginBottom: 24 },
  logo:          { fontSize: 44 },
  appName:       { fontSize: FontSize.xxxl, fontWeight: FontWeight.extrabold, color: Colors.navy, marginTop: 6 },
  card:          {},
  heading:       { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.navy, marginBottom: 20 },
  label:         { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary, marginBottom: 6, marginTop: 4 },
  input:         { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 13, fontSize: FontSize.md, color: Colors.navy, backgroundColor: Colors.surface, marginBottom: 4 },
  inputError:    { borderColor: Colors.error },
  errorText:     { fontSize: FontSize.xs, color: Colors.error, marginBottom: 8 },
  lockedField:   { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 13, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  lockedValue:   { fontSize: FontSize.md, color: Colors.navy, fontWeight: FontWeight.semibold },
  lockedHint:    { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 3 },
  dropdown:      { backgroundColor: Colors.white, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, marginBottom: 8, overflow: 'hidden' },
  dropdownItem:  { padding: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  dropdownText:  { fontSize: FontSize.md, color: Colors.navy, fontWeight: FontWeight.medium },
  dropdownSub:   { fontSize: FontSize.xs, color: Colors.textMuted },
  loginLink:     { textAlign: 'center', marginTop: 16, fontSize: FontSize.sm, color: Colors.textMuted },
  linkBold:      { color: Colors.primary, fontWeight: FontWeight.semibold },
});
