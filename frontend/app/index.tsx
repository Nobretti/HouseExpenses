import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store';
import { LoadingSpinner } from '../src/components/common';
import { colors } from '../src/constants';

export default function IndexScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading]);

  return (
    <View style={styles.container}>
      <LoadingSpinner fullScreen message="Loading..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
