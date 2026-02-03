import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Cross-platform storage utility
 * Uses SecureStore on native (iOS/Android) and localStorage on web
 */

async function getItemAsync(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

async function setItemAsync(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch {
      console.warn('Failed to save to localStorage');
    }
    return;
  }
  return SecureStore.setItemAsync(key, value);
}

async function deleteItemAsync(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch {
      console.warn('Failed to remove from localStorage');
    }
    return;
  }
  return SecureStore.deleteItemAsync(key);
}

export const storage = {
  getItemAsync,
  setItemAsync,
  deleteItemAsync,
};
