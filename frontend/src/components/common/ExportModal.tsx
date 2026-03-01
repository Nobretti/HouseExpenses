import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Icon } from './Icon';
import { colors } from '../../constants';
import { Button } from './Button';
import { ExportFormat } from '../../utils/exportUtils';

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat) => void;
  periodLabel: string;
  expenseCount: number;
  totalAmount: number;
  isExporting?: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  visible,
  onClose,
  onExport,
  periodLabel,
  expenseCount,
  totalAmount,
  isExporting = false,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');

  const formats: { key: ExportFormat; label: string; icon: string; description: string }[] = [
    { key: 'csv', label: 'CSV', icon: 'document-text-outline', description: 'Spreadsheet' },
    { key: 'json', label: 'JSON', icon: 'folder-outline', description: 'Developer' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              {/* Handle bar */}
              <View style={styles.handle} />

              {/* Header */}
              <View style={styles.header}>
                <View style={styles.iconBadge}>
                  <Icon name="download-outline" size={26} color={colors.primary} />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.title}>Export Expenses</Text>
                  <Text style={styles.subtitle}>{periodLabel}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Icon name="close" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Summary */}
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{expenseCount}</Text>
                  <Text style={styles.summaryLabel}>expenses</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{'\u20AC'}{totalAmount.toFixed(2)}</Text>
                  <Text style={styles.summaryLabel}>total</Text>
                </View>
              </View>

              {/* Format selector */}
              <Text style={styles.sectionLabel}>Export format</Text>
              <View style={styles.formatRow}>
                {formats.map(fmt => (
                  <TouchableOpacity
                    key={fmt.key}
                    style={[
                      styles.formatBtn,
                      selectedFormat === fmt.key && styles.formatBtnActive,
                    ]}
                    onPress={() => setSelectedFormat(fmt.key)}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name={fmt.icon}
                      size={24}
                      color={selectedFormat === fmt.key ? colors.surface : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.formatName,
                        selectedFormat === fmt.key && styles.formatNameActive,
                      ]}
                    >
                      {fmt.label}
                    </Text>
                    <Text
                      style={[
                        styles.formatDesc,
                        selectedFormat === fmt.key && styles.formatDescActive,
                      ]}
                    >
                      {fmt.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={onClose}
                  style={styles.actionBtn}
                />
                <Button
                  title={Platform.OS === 'web' ? 'Download' : 'Share'}
                  variant="primary"
                  onPress={() => onExport(selectedFormat)}
                  loading={isExporting}
                  disabled={expenseCount === 0}
                  style={styles.actionBtn}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.primary}18`,
    marginRight: 14,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formatRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  formatBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    gap: 4,
  },
  formatBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  formatName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  formatNameActive: {
    color: colors.surface,
  },
  formatDesc: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  formatDescActive: {
    color: `${colors.surface}CC`,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
  },
});
