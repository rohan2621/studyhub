import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { authApi } from '@api/auth';
import { storage } from '@utils/storage';
import { useAuthStore } from '@store/authStore';
import type { AuthResponse } from '@t/api.types';
import { loginSchema, LoginFormData } from '@validation/auth.schema';
import { GradientBackground } from '@components/layout/GradientBackground';
import { GlassCard } from '@components/cards/GlassCard';
import { PrimaryButton } from '@components/buttons/PrimaryButton';
import { AppError, ErrorMessages } from '@constants/errors';
import { analytics } from '@services/analyticsService';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { setUser, setAuthenticated } = useAuthStore();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate, isPending } = useMutation<AuthResponse, Error, typeof authApi.login extends (p: infer P) => any ? P : never>({
    mutationFn: authApi.login,
    onSuccess: async (data: AuthResponse) => {
      await storage.set(storage.KEYS.ACCESS_TOKEN, data.access_token);
      await storage.set(storage.KEYS.USER_ID, data.user.id);
      await storage.set(storage.KEYS.SCHOOL_ID, data.user.school_id);
      await storage.set(storage.KEYS.LAST_LOGIN, new Date().toISOString());
      setUser(data.user);
      setAuthenticated(true);
      analytics.track('login');
      router.replace('/(tabs)');
    },
    onError: (err: any) => {
      const code = err?.appError as AppError ?? AppError.UNKNOWN_ERROR;
      Alert.alert('Login failed', ErrorMessages[code]);
    },
  });

  function onSubmit(data: LoginFormData) {
    mutate(data);
  }

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo / Brand */}
        <View style={styles.brand}>
          <Text style={styles.logo}>📚</Text>
          <Text style={styles.appName}>StudyHub</Text>
          <Text style={styles.tagline}>Your school. Your notes. Your success.</Text>
        </View>

        <GlassCard style={styles.card}>
          <Text style={styles.heading}>Welcome back</Text>

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="student@school.edu"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="••••••••"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

          <PrimaryButton
            label="Log In"
            onPress={handleSubmit(onSubmit)}
            loading={isPending}
            fullWidth
            style={{ marginTop: 20 }}
          />

          <Text style={styles.signupLink} onPress={() => router.push('/(auth)/signup')}>
            Don't have an account? <Text style={styles.linkBold}>Sign up</Text>
          </Text>
        </GlassCard>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll:     { flexGrow: 1, justifyContent: 'center', padding: Spacing.lg },
  brand:      { alignItems: 'center', marginBottom: 32 },
  logo:       { fontSize: 56 },
  appName:    { fontSize: FontSize.huge, fontWeight: FontWeight.extrabold, color: Colors.navy, marginTop: 8 },
  tagline:    { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 4, textAlign: 'center' },
  card:       { marginTop: 8 },
  heading:    { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.navy, marginBottom: 20 },
  label:      { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary, marginBottom: 6 },
  input:      { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: 13, fontSize: FontSize.md, color: Colors.navy, backgroundColor: Colors.surface, marginBottom: 4 },
  inputError: { borderColor: Colors.error },
  errorText:  { fontSize: FontSize.xs, color: Colors.error, marginBottom: 10 },
  signupLink: { textAlign: 'center', marginTop: 16, fontSize: FontSize.sm, color: Colors.textMuted },
  linkBold:   { color: Colors.primary, fontWeight: FontWeight.semibold },
});
