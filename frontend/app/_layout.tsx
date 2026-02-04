import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/store';
import { colors } from '../src/constants';

export default function RootLayout() {
  const { checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-expense"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="expense-detail"
          options={{
            presentation: 'card',
          }}
        />
        <Stack.Screen name="alerts" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="category-detail" />
        <Stack.Screen name="manage-category" />
        <Stack.Screen name="about" />
        <Stack.Screen
          name="expenses-filtered"
          options={{
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="expense-filter"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </>
  );
}
