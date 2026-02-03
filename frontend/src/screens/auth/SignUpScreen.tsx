import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../constants';
import { Button, Input } from '../../components/common';
import { useAuthStore } from '../../store';
import { validators } from '../../utils';

export const SignUpScreen: React.FC = () => {
  const router = useRouter();
  const { signUp, isLoading, error, clearError, isAuthenticated } = useAuthStore();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect authenticated users to tabs
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validators.required(displayName)) {
      newErrors.displayName = 'Name is required';
    }
    if (!validators.email(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    const passwordValidation = validators.password(password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.errors[0];
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    clearError();
    if (!validate()) return;

    const success = await signUp({ email, password, displayName });
    if (success) {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start managing your household expenses</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Enter your name"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              leftIcon="person-outline"
              error={errors.displayName}
            />

            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              leftIcon="mail-outline"
              error={errors.email}
            />

            <Input
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              leftIcon="lock-closed-outline"
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              leftIcon="lock-closed-outline"
              error={errors.confirmPassword}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <Button
              title="Create Account"
              onPress={handleSignUp}
              loading={isLoading}
              style={styles.button}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.signInText}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  form: {
    marginBottom: 24,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  signInText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default SignUpScreen;
