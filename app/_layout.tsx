import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { queryClient } from '../src/lib/queryClient';
import { AuthProvider } from '../src/context/AuthContext';
import { Colors } from '../src/constants/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)"       options={{ animation: 'none' }} />
              <Stack.Screen name="(tabs)"       options={{ animation: 'none' }} />
              <Stack.Screen name="notes/[id]"   options={{ presentation: 'card', headerShown: true, title: 'Note', headerTintColor: Colors.primary }} />
              <Stack.Screen name="homework/[id]"options={{ presentation: 'card', headerShown: true, title: 'Assignment', headerTintColor: Colors.primary }} />
              <Stack.Screen name="discussions/[id]" options={{ presentation: 'card', headerShown: true, title: 'Discussion', headerTintColor: Colors.primary }} />
              <Stack.Screen name="custom-request/index" options={{ presentation: 'modal', headerShown: true, title: 'Request Content', headerTintColor: Colors.primary }} />
              <Stack.Screen name="settings/index"       options={{ presentation: 'card',  headerShown: true, title: 'Settings', headerTintColor: Colors.primary }} />
              <Stack.Screen name="notifications/index"  options={{ presentation: 'modal', headerShown: true, title: 'Notifications', headerTintColor: Colors.primary }} />
            </Stack>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
