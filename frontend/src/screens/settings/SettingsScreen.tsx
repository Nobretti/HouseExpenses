import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '../../components/common';
import { colors } from '../../constants';
import { useAuthStore, useDashboardStore, useCategoryStore, useExpenseStore } from '../../store';
import { Card, ConfirmDialog, Toast } from '../../components/common';
import { BudgetLimitModal } from '../../components/settings';
import { formatCurrency } from '../../utils';

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  danger = false,
}) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <View style={[styles.iconContainer, danger && styles.iconContainerDanger]}>
      <Icon
        name={icon}
        size={20}
        color={danger ? colors.danger : colors.primary}
      />
    </View>
    <View style={styles.settingContent}>
      <Text style={[styles.settingTitle, danger && styles.settingTitleDanger]}>
        {title}
      </Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    <Icon name="chevron-forward" size={20} color={colors.textLight} />
  </TouchableOpacity>
);

export const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const { user, logout, updateBudgetLimit, updateAnnualBudgetLimit } = useAuthStore();
  const { refreshDashboard, reset: resetDashboard } = useDashboardStore();
  const { reset: resetCategories } = useCategoryStore();
  const { reset: resetExpenses } = useExpenseStore();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isWideScreen = width > 768;
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showBudgetLimitModal, setShowBudgetLimitModal] = useState(false);
  const [showAnnualBudgetLimitModal, setShowAnnualBudgetLimitModal] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const handleLogout = async () => {
    setShowLogoutDialog(false);
    // Reset all stores before logout to clear user data
    resetCategories();
    resetExpenses();
    resetDashboard();
    await logout();
    router.replace('/login');
  };

  const handleSaveBudgetLimit = async (limit: number | undefined) => {
    const success = await updateBudgetLimit(limit);
    setShowBudgetLimitModal(false);
    if (success) {
      refreshDashboard();
      setToast({
        visible: true,
        message: limit ? 'Monthly budget limit updated' : 'Monthly budget limit removed',
        type: 'success',
      });
    } else {
      setToast({
        visible: true,
        message: 'Failed to update monthly budget limit',
        type: 'error',
      });
    }
  };

  const handleSaveAnnualBudgetLimit = async (limit: number | undefined) => {
    const success = await updateAnnualBudgetLimit(limit);
    setShowAnnualBudgetLimitModal(false);
    if (success) {
      refreshDashboard();
      setToast({
        visible: true,
        message: limit ? 'Annual budget limit updated' : 'Annual budget limit removed',
        type: 'success',
      });
    } else {
      setToast({
        visible: true,
        message: 'Failed to update annual budget limit',
        type: 'error',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.headerWrapper, isWeb && isWideScreen && styles.webHeader]}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, isWeb && isWideScreen && styles.webContent]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.displayName?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.displayName || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <Icon name="chevron-forward" size={24} color={colors.textLight} />
          </TouchableOpacity>
        </Card>

        {/* Categories & Budget */}
        <Text style={styles.sectionTitle}>Categories & Budget</Text>
        <Card style={styles.settingsCard}>
          <SettingItem
            icon="layers-outline"
            title="Manage Categories"
            subtitle="Categories, subcategories and budget limits"
            onPress={() => router.push('/(tabs)/categories')}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="wallet-outline"
            title="Monthly Budget Limit"
            subtitle={user?.monthlyBudgetLimit ? formatCurrency(user.monthlyBudgetLimit) : 'Not set'}
            onPress={() => setShowBudgetLimitModal(true)}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="calendar-outline"
            title="Annual Budget Limit"
            subtitle={user?.annualBudgetLimit ? formatCurrency(user.annualBudgetLimit) : 'Not set'}
            onPress={() => setShowAnnualBudgetLimitModal(true)}
          />
        </Card>

        {/* App Settings */}
        <Text style={styles.sectionTitle}>App</Text>
        <Card style={styles.settingsCard}>
          <SettingItem
            icon="globe-outline"
            title="Language & Currency"
            subtitle="Portuguese (EUR)"
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="information-circle-outline"
            title="About"
            subtitle="Version 1.0.0"
            onPress={() => router.push('/about')}
          />
        </Card>

        {/* Developer Settings */}
        <Text style={styles.sectionTitle}>Developer</Text>
        <Card style={styles.settingsCard}>
          <SettingItem
            icon="bug-outline"
            title="Error Logs"
            subtitle="View app errors and issues"
            onPress={() => router.push('/error-logs')}
          />
        </Card>

        {/* Logout */}
        <Card style={styles.settingsCard}>
          <SettingItem
            icon="log-out-outline"
            title="Sign Out"
            onPress={() => setShowLogoutDialog(true)}
            danger
          />
        </Card>
      </ScrollView>

      <ConfirmDialog
        visible={showLogoutDialog}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        type="danger"
        confirmText="Sign Out"
        cancelText="Cancel"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutDialog(false)}
      />

      <BudgetLimitModal
        visible={showBudgetLimitModal}
        currentLimit={user?.monthlyBudgetLimit}
        limitType="monthly"
        onSave={handleSaveBudgetLimit}
        onClose={() => setShowBudgetLimitModal(false)}
      />

      <BudgetLimitModal
        visible={showAnnualBudgetLimitModal}
        currentLimit={user?.annualBudgetLimit}
        limitType="annual"
        onSave={handleSaveAnnualBudgetLimit}
        onClose={() => setShowAnnualBudgetLimitModal(false)}
      />

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 16,
  },
  headerWrapper: {
    backgroundColor: colors.background,
  },
  webHeader: {
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    width: '100%',
    maxWidth: 1200,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 60,
  },
  webContent: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1200,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    paddingVertical: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.surface,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 18,
    marginRight: 12,
  },
  profileName: {
    fontSize: 19,
    fontWeight: '600',
    color: colors.text,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsCard: {
    padding: 0,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 18,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerDanger: {
    backgroundColor: `${colors.danger}15`,
  },
  settingContent: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  settingTitleDanger: {
    color: colors.danger,
  },
  settingSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 64,
  },
});

export default SettingsScreen;
