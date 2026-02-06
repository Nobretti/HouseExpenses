import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '../../components/common';
import { colors } from '../../constants';
import { errorMonitor, ErrorLog } from '../../services';
import { Card, ConfirmDialog, Toast } from '../../components/common';

export const ErrorLogsScreen: React.FC = () => {
  const router = useRouter();
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    const errorLogs = await errorMonitor.getLogs();
    setLogs(errorLogs);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleClearLogs = async () => {
    setShowClearDialog(false);
    await errorMonitor.clearLogs();
    setLogs([]);
    setToast({ visible: true, message: 'Error logs cleared', type: 'success' });
  };

  const getTypeColor = (type: ErrorLog['type']) => {
    switch (type) {
      case 'api':
        return colors.warning;
      case 'network':
        return colors.danger;
      case 'runtime':
        return colors.danger;
      case 'validation':
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  const getTypeIcon = (type: ErrorLog['type']) => {
    switch (type) {
      case 'api':
        return 'cloud-offline-outline';
      case 'network':
        return 'wifi-outline';
      case 'runtime':
        return 'bug-outline';
      case 'validation':
        return 'alert-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Error Logs</Text>
        {logs.length > 0 && (
          <TouchableOpacity onPress={() => setShowClearDialog(true)} style={styles.clearButton}>
            <Icon name="trash-outline" size={22} color={colors.danger} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadLogs}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {logs.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="checkmark-circle-outline" size={64} color={colors.success} />
            <Text style={styles.emptyTitle}>No Errors</Text>
            <Text style={styles.emptySubtitle}>Your app is running smoothly</Text>
          </View>
        ) : (
          <>
            <Text style={styles.logCount}>{logs.length} error{logs.length !== 1 ? 's' : ''} logged</Text>
            {logs.map((log) => (
              <Card key={log.id} style={styles.logCard}>
                <TouchableOpacity
                  style={styles.logHeader}
                  onPress={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                >
                  <View style={[styles.typeIcon, { backgroundColor: `${getTypeColor(log.type)}15` }]}>
                    <Icon
                      name={getTypeIcon(log.type) as any}
                      size={18}
                      color={getTypeColor(log.type)}
                    />
                  </View>
                  <View style={styles.logInfo}>
                    <View style={styles.logTitleRow}>
                      <Text style={[styles.logType, { color: getTypeColor(log.type) }]}>
                        {log.type.toUpperCase()}
                      </Text>
                      {log.statusCode && (
                        <Text style={styles.statusCode}>{log.statusCode}</Text>
                      )}
                    </View>
                    <Text style={styles.logMessage} numberOfLines={expandedLogId === log.id ? undefined : 2}>
                      {log.message}
                    </Text>
                    <Text style={styles.logTimestamp}>{formatDate(log.timestamp)}</Text>
                  </View>
                  <Icon
                    name={expandedLogId === log.id ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>

                {expandedLogId === log.id && (
                  <View style={styles.logDetails}>
                    {log.url && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>URL:</Text>
                        <Text style={styles.detailValue} selectable>{log.url}</Text>
                      </View>
                    )}
                    {log.details && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Details:</Text>
                        <Text style={styles.detailValue} selectable>{log.details}</Text>
                      </View>
                    )}
                    {log.context && Object.keys(log.context).length > 0 && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Context:</Text>
                        <Text style={styles.detailValue} selectable>
                          {JSON.stringify(log.context, null, 2)}
                        </Text>
                      </View>
                    )}
                    {log.stack && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Stack:</Text>
                        <ScrollView horizontal style={styles.stackScroll}>
                          <Text style={styles.stackTrace} selectable>{log.stack}</Text>
                        </ScrollView>
                      </View>
                    )}
                  </View>
                )}
              </Card>
            ))}
          </>
        )}
      </ScrollView>

      <ConfirmDialog
        visible={showClearDialog}
        title="Clear Error Logs"
        message="Are you sure you want to clear all error logs? This action cannot be undone."
        type="danger"
        confirmText="Clear All"
        cancelText="Cancel"
        onConfirm={handleClearLogs}
        onCancel={() => setShowClearDialog(false)}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  clearButton: {
    padding: 8,
    marginRight: -8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  logCount: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 8,
  },
  logCard: {
    marginBottom: 12,
    padding: 0,
    overflow: 'hidden',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logInfo: {
    flex: 1,
    marginRight: 8,
  },
  logTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  logType: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusCode: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 8,
    backgroundColor: colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  logMessage: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  logTimestamp: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 6,
  },
  logDetails: {
    backgroundColor: colors.background,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
    fontFamily: 'monospace',
  },
  stackScroll: {
    maxHeight: 120,
  },
  stackTrace: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
});

export default ErrorLogsScreen;
