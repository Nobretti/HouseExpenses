import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getIconName, colors } from '../../constants';

interface CategoryIconProps {
  icon: string;
  color: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

const sizeMap = {
  small: { container: 32, icon: 16 },
  medium: { container: 44, icon: 22 },
  large: { container: 56, icon: 28 },
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  icon,
  color,
  size = 'medium',
  style,
}) => {
  const dimensions = sizeMap[size];
  // Provide fallbacks for undefined icon/color
  const safeIcon = icon || 'help-circle-outline';
  const safeColor = color || colors.textSecondary;
  const iconName = getIconName(safeIcon);

  return (
    <View
      style={[
        styles.container,
        {
          width: dimensions.container,
          height: dimensions.container,
          backgroundColor: `${safeColor}20`,
        },
        style,
      ]}
    >
      <Ionicons name={iconName} size={dimensions.icon} color={safeColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
