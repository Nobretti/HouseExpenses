import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '../../components/common';
import { colors } from '../../constants';
import { Card, EmptyState } from '../../components/common';
import { useDashboardStore } from '../../store';

export const AlertsScreen: React.FC = () => {
  const router = useRouter();
  const { unreadAlertCount } = useDashboardStore();

  const alerts = [
    {
      id: '1',
      type: 'warning',
      title: 'Budget Alert',
      message: 'You have used 80% of your monthly budget.',
      date: new Date().toISOString(),
      read: false,
    },
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return 'warning-outline';
      case 'danger':
        return 'alert-circle-outline';
      case 'success':
        return 'checkmark-circle-outline';
      default:
        return 'information-circle-outline';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning':
        return colors.warning;
      case 'danger':
        return colors.danger;
      case 'success':
        return colors.success;
      default:
        return colors.primary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alerts</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {alerts.length === 0 ? (
          <EmptyState
            icon="notifications-off-outline"
            title="No Alerts"
            description="You're all caught up! No new alerts at this time."
          />
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id} style={styles.alertCard}>
              <View style={styles.alertRow}>
                <View
                  style={[
                    styles.alertIcon,
                    { backgroundColor: `${getAlertColor(alert.type)}20` },
                  ]}
                >
                  <Icon
                    name={getAlertIcon(alert.type) as any}
                    size={24}
                    color={getAlertColor(alert.type)}
                  />
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                  <Text style={styles.alertDate}>
                    {new Date(alert.date).toLocaleDateString('pt-PT')}
                  </Text>
                </View>
                {!alert.read && <View style={styles.unreadDot} />}
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: colors.background,
    ...Platform.select({
      web: {
        maxWidth: 800,
        width: '100%',
        alignSelf: 'center',
      },
    }),
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    ...Platform.select({
      web: {
        maxWidth: 800,
        width: '100%',
        alignSelf: 'center',
      },
    }),
  },
  alertCard: {
    marginBottom: 12,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  alertIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  alertDate: {
    fontSize: 12,
    color: colors.textLight,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
});

export default AlertsScreen;
