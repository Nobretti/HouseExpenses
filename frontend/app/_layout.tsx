import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import { Stack, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../src/store';
import { colors } from '../src/constants';

// Prevent the splash screen from auto-hiding before fonts are loaded
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { checkSession } = useAuthStore();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Load Ionicons font using Font.loadAsync for better Huawei compatibility
  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          // Load from @expo/vector-icons
          ...Ionicons.font,
          // Also explicitly load the font file as a fallback
          'Ionicons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.warn('Error loading fonts:', error);
        // Still allow app to render even if fonts fail
        setFontsLoaded(true);
      }
    }
    loadFonts();
  }, []);

  useEffect(() => {
    checkSession();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
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
    </View>
  );
}
