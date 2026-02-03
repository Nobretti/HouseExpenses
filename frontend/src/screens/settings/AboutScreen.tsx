import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants';
import { Card } from '../../components/common';

export const AboutScreen: React.FC = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isWideScreen = width > 768;

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.headerWrapper, isWeb && isWideScreen && styles.webHeader]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>About</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, isWeb && isWideScreen && styles.webContent]}
        showsVerticalScrollIndicator={false}
      >
        {/* App Logo & Info */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="home" size={48} color={colors.primary} />
          </View>
          <Text style={styles.appName}>Family Expenses</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.tagline}>
            Keep your household finances organized together
          </Text>
        </View>

        {/* Features */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featureItem}>
            <Ionicons name="wallet-outline" size={22} color={colors.primary} />
            <Text style={styles.featureText}>Track daily expenses by category</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="pie-chart-outline" size={22} color={colors.primary} />
            <Text style={styles.featureText}>Visual spending breakdown</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="notifications-outline" size={22} color={colors.primary} />
            <Text style={styles.featureText}>Budget alerts and notifications</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="people-outline" size={22} color={colors.primary} />
            <Text style={styles.featureText}>Family-friendly interface</Text>
          </View>
        </Card>

        {/* Credits */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Credits</Text>
          <Text style={styles.creditsText}>
            Built with love for families who want to manage their household expenses together.
          </Text>
          <Text style={styles.creditsText}>
            Powered by React Native & Expo
          </Text>
        </Card>

        {/* Legal */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
        </Card>

        <Text style={styles.copyright}>
          © 2024 Family Expenses. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerWrapper: {
    backgroundColor: colors.background,
  },
  webHeader: {
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    width: '100%',
    maxWidth: 800,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  webContent: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 800,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  version: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    marginBottom: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  featureText: {
    fontSize: 15,
    color: colors.text,
    marginLeft: 14,
  },
  creditsText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 8,
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  linkText: {
    fontSize: 16,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  copyright: {
    fontSize: 13,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
});

export default AboutScreen;
