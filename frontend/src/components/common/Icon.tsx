import React from 'react';
import { SvgIcon } from './SvgIcon';

/**
 * Drop-in replacement for Ionicons that uses SVG rendering instead of font glyphs.
 * This ensures compatibility with all Android devices including Huawei EMUI.
 *
 * Usage: Replace `import Ionicons from 'react-native-vector-icons/Ionicons'`
 * with `import { Icon } from '../components/common'` (or appropriate path)
 *
 * Then replace `<Ionicons name="..." />` with `<Icon name="..." />`
 */

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: object;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = '#000000',
  style,
}) => {
  return (
    <SvgIcon
      name={name}
      size={size}
      color={color}
      style={style}
    />
  );
};

// Also export as default for drop-in replacement compatibility
export default Icon;
