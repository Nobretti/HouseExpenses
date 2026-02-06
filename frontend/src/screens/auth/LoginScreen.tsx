import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../../constants';
import { Button, Input } from '../../components/common';
import { useAuthStore } from '../../store';
import { validators } from '../../utils';
import { authService } from '../../services/authService';

export const LoginScreen: React.FC = () => {
  const router = useRouter();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isWideScreen = width > 768;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [resendingConfirmation, setResendingConfirmation] = useState(false);

  // Redirect authenticated users to tabs
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!validators.email(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!validators.required(password)) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    clearError();
    if (!validate()) return;

    const success = await login({ email, password });
    if (success) {
      router.replace('/(tabs)');
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }
    setResendingConfirmation(true);
    const { success, error: resendError } = await authService.resendConfirmationEmail(email);
    setResendingConfirmation(false);
    if (success) {
      Alert.alert('Success', 'Confirmation email sent! Please check your inbox.');
    } else {
      Alert.alert('Error', resendError || 'Failed to resend confirmation email');
    }
  };

  const isEmailNotConfirmedError = error?.toLowerCase().includes('email not confirmed');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isWeb && isWideScreen && styles.webScrollContent,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.content, isWeb && isWideScreen && styles.webContent]}
        >
          {isWeb && isWideScreen && (
            <View style={styles.brandSection}>
              <View style={styles.logoContainer}>
                <Ionicons name="home" size={48} color={colors.primary} />
              </View>
              <Text style={styles.brandTitle}>Family Expenses</Text>
              <Text style={styles.brandSubtitle}>
                Keep your household finances organized and track spending together as a family
              </Text>
            </View>
          )}

          <View style={[styles.formCard, isWeb && isWideScreen && styles.webFormCard]}>
            <View style={styles.header}>
              {!isWeb || !isWideScreen ? (
                <View style={styles.mobileLogo}>
                  <Ionicons name="home" size={36} color={colors.primary} />
                </View>
              ) : null}
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to manage your family expenses</Text>
            </View>

            <View style={styles.form}>
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
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                leftIcon="lock-closed-outline"
                error={errors.password}
              />

              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.error}>{error}</Text>
                  {isEmailNotConfirmedError && (
                    <TouchableOpacity
                      onPress={handleResendConfirmation}
                      disabled={resendingConfirmation}
                      style={styles.resendButton}
                    >
                      <Text style={styles.resendButtonText}>
                        {resendingConfirmation ? 'Sending...' : 'Resend confirmation email'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <TouchableOpacity
                onPress={() => router.push('/forgot-password')}
                style={styles.forgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={isLoading}
                style={styles.button}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text style={styles.signUpText}> Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  webScrollContent: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
    padding: 24,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  webContent: {
    flex: undefined,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 80,
    maxWidth: 1200,
    width: '100%',
  },
  brandSection: {
    flex: 1,
    maxWidth: 400,
    paddingRight: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  brandSubtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    lineHeight: 28,
  },
  formCard: {
    width: '100%',
  },
  webFormCard: {
    flex: 1,
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 40,
    ...Platform.select({
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
      },
    }),
  },
  mobileLogo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  header: {
    marginBottom: 36,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 26,
  },
  form: {
    marginBottom: 24,
  },
  errorContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    textAlign: 'center',
  },
  resendButton: {
    marginTop: 8,
    padding: 8,
  },
  resendButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    marginTop: 8,
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
  signUpText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;
