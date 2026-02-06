import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Icon } from '../common';
import { colors } from '../../constants';
import { formatCurrency } from '../../utils';
import { Button } from '../common';

type BudgetLimitType = 'monthly' | 'annual';

interface BudgetLimitModalProps {
  visible: boolean;
  currentLimit?: number;
  limitType?: BudgetLimitType;
  onSave: (limit: number | undefined) => void;
  onClose: () => void;
}

export const BudgetLimitModal: React.FC<BudgetLimitModalProps> = ({
  visible,
  currentLimit,
  limitType = 'monthly',
  onSave,
  onClose,
}) => {
  const title = limitType === 'monthly' ? 'Monthly Budget Limit' : 'Annual Budget Limit';
  const description = limitType === 'monthly'
    ? 'Set a monthly spending limit to help track your budget. You\'ll receive alerts when approaching or exceeding this limit.'
    : 'Set an annual spending limit to help track your yearly budget. You\'ll receive alerts when approaching or exceeding this limit.';
  const [limitValue, setLimitValue] = useState('');
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (visible) {
      setLimitValue(currentLimit ? currentLimit.toString() : '');
      setIsRemoving(false);
    }
  }, [visible, currentLimit]);

  const handleSave = () => {
    if (isRemoving) {
      onSave(undefined);
    } else {
      const numericValue = parseFloat(limitValue);
      if (!isNaN(numericValue) && numericValue > 0) {
        onSave(numericValue);
      }
    }
  };

  const handleRemove = () => {
    setIsRemoving(true);
    setLimitValue('');
  };

  const isValidInput = isRemoving || (limitValue && parseFloat(limitValue) > 0);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>{description}</Text>

          {isRemoving ? (
            <View style={styles.removeNotice}>
              <Icon name="information-circle" size={20} color={colors.warning} />
              <Text style={styles.removeNoticeText}>
                Budget limit will be removed
              </Text>
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>€</Text>
              <TextInput
                style={styles.input}
                value={limitValue}
                onChangeText={setLimitValue}
                placeholder="0.00"
                placeholderTextColor={colors.textLight}
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>
          )}

          {currentLimit && !isRemoving && (
            <Text style={styles.currentLimit}>
              Current limit: {formatCurrency(currentLimit)}
            </Text>
          )}

          <View style={styles.actions}>
            {currentLimit && !isRemoving && (
              <Button
                title="Remove Limit"
                variant="outline"
                onPress={handleRemove}
                style={styles.removeButton}
              />
            )}
            <Button
              title={isRemoving ? 'Confirm Remove' : 'Save'}
              onPress={handleSave}
              disabled={!isValidInput}
              style={styles.saveButton}
            />
          </View>

          {isRemoving && (
            <TouchableOpacity onPress={() => setIsRemoving(false)} style={styles.cancelRemove}>
              <Text style={styles.cancelRemoveText}>Cancel removal</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 12,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
  },
  currentLimit: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  removeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.warning}15`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  removeNoticeText: {
    fontSize: 15,
    color: colors.warning,
    fontWeight: '500',
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
  },
  removeButton: {
    flex: 1,
    marginRight: 12,
  },
  saveButton: {
    flex: 1,
  },
  cancelRemove: {
    alignItems: 'center',
    marginTop: 16,
  },
  cancelRemoveText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
});
