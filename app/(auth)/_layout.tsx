import { Stack } from 'expo-router';
import { Colors } from '../../src/constants/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown:       false,
        contentStyle:      { backgroundColor: Colors.bgStart },
        animation:         'slide_from_right',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="intro"  options={{ gestureEnabled: false }} />
    </Stack>
  );
}
