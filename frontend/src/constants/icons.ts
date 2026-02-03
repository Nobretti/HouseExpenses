export const categoryIcons: Record<string, string> = {
  // Category icons mapping to Ionicons names
  'home': 'home-outline',
  'bank': 'business-outline',
  'building': 'business-outline',
  'sparkles': 'sparkles-outline',
  'droplet': 'water-outline',
  'zap': 'flash-outline',
  'graduation-cap': 'school-outline',
  'book-open': 'book-outline',
  'school': 'school-outline',
  'heart-pulse': 'heart-outline',
  'stethoscope': 'medkit-outline',
  'pill': 'medical-outline',
  'utensils': 'restaurant-outline',
  'shopping-cart': 'cart-outline',
  'package': 'cube-outline',
  'beef': 'nutrition-outline',
  'shield-check': 'shield-checkmark-outline',
  'shield': 'shield-outline',
  'user-shield': 'person-outline',
  'car': 'car-outline',
  'fuel': 'speedometer-outline',
  'baby': 'happy-outline',
  'shirt': 'shirt-outline',
  'gamepad-2': 'game-controller-outline',
  'wifi': 'wifi-outline',
  'more-horizontal': 'ellipsis-horizontal-outline',
  'music': 'musical-notes-outline',
  'waves': 'water-outline',
  'road': 'navigate-outline',
  'plane': 'airplane-outline',
  'cake': 'gift-outline',
  'clipboard-check': 'clipboard-outline',
  'wrench': 'build-outline',
  'settings': 'settings-outline',
  'file-text': 'document-text-outline',
  'landmark': 'business-outline',
  'heart': 'heart-outline',
  'help-circle': 'help-circle-outline',
};

export const getIconName = (icon: string): string => {
  // If icon already ends with '-outline' or is a valid Ionicons name, return as is
  if (icon && (icon.endsWith('-outline') || icon.endsWith('-sharp'))) {
    return icon;
  }
  // Otherwise, look up in the mapping
  return categoryIcons[icon] || icon || 'help-circle-outline';
};

// Navigation icons
export const navIcons = {
  dashboard: 'grid-outline',
  dashboardFocused: 'grid',
  expenses: 'wallet-outline',
  expensesFocused: 'wallet',
  categories: 'layers-outline',
  categoriesFocused: 'layers',
  settings: 'settings-outline',
  settingsFocused: 'settings',
  add: 'add-circle',
} as const;
