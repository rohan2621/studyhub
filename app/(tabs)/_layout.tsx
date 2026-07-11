import React from 'react';
import { Tabs } from 'expo-router';
import { Colors } from '@constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown:       false,
        tabBarActiveTintColor:   Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor:  Colors.white,
          borderTopColor:   Colors.glassBorder,
          borderTopWidth:   1,
          paddingBottom:    6,
          height:           60,
        },
        tabBarLabelStyle: {
          fontSize:   11,
          fontWeight: '600',
          marginTop:  -2,
        },
      }}
    >
      <Tabs.Screen name="index"       options={{ title: 'Dashboard',   tabBarIcon: ({ color }) => <TabIcon icon="🏠" color={color} /> }} />
      <Tabs.Screen name="notes"       options={{ title: 'Notes',       tabBarIcon: ({ color }) => <TabIcon icon="📄" color={color} /> }} />
      <Tabs.Screen name="homework"    options={{ title: 'Homework',    tabBarIcon: ({ color }) => <TabIcon icon="📝" color={color} /> }} />
      <Tabs.Screen name="discussions" options={{ title: 'Discuss',     tabBarIcon: ({ color }) => <TabIcon icon="💬" color={color} /> }} />
      <Tabs.Screen name="profile"     options={{ title: 'Profile',     tabBarIcon: ({ color }) => <TabIcon icon="👤" color={color} /> }} />
    </Tabs>
  );
}

function TabIcon({ icon, color }: { icon: string; color: any }) {
  const React2 = require('react');
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 22, color }}>{icon}</Text>;
}
