export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  password: (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return { valid: errors.length === 0, errors };
  },

  amount: (amount: string): boolean => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
  },

  required: (value: string): boolean => {
    return value.trim().length > 0;
  },

  hexColor: (color: string): boolean => {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  },
};

export const validateExpense = (data: {
  categoryId?: string;
  amount?: string;
  date?: string;
}): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!data.categoryId) {
    errors.categoryId = 'Category is required';
  }
  if (!data.amount || !validators.amount(data.amount)) {
    errors.amount = 'Valid amount is required';
  }
  if (!data.date) {
    errors.date = 'Date is required';
  }

  return { valid: Object.keys(errors).length === 0, errors };
};
