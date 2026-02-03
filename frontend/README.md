# House Expenses - Frontend

React Native mobile application for the House Expenses Management system.

**Expo SDK 52** | React Native 0.76 | New Architecture Enabled

## Requirements

- Node.js 18+ (recommended: 20+)
- npm or yarn
- Expo Go app (SDK 52) on your device, or
- iOS Simulator (Mac) / Android Emulator

## Expo Go Compatibility

This project uses **Expo SDK 52** and is compatible with:
- Expo Go SDK 52 (latest)
- iOS 15.1+
- Android 6+ (API 23+)

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Copy the example environment file and update with your values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
EXPO_PUBLIC_API_URL=http://localhost:8080/api
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Start Development Server

```bash
# Start Expo development server
npx expo start

# Or run directly on a platform
npx expo start --ios
npx expo start --android
npx expo start --web
```

## Project Structure

```
frontend/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Dashboard
│   │   ├── expenses.tsx   # Expenses list
│   │   ├── categories.tsx # Categories
│   │   └── settings.tsx   # Settings
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Entry/splash
│   ├── login.tsx          # Login screen
│   ├── signup.tsx         # Signup screen
│   └── add-expense.tsx    # Add expense modal
├── src/
│   ├── components/        # Reusable components
│   │   ├── common/        # Generic UI components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── expenses/      # Expense components
│   │   └── categories/    # Category components
│   ├── screens/           # Screen components
│   │   ├── auth/          # Authentication screens
│   │   ├── main/          # Main app screens
│   │   ├── categories/    # Category screens
│   │   └── settings/      # Settings screens
│   ├── services/          # API services
│   ├── store/             # Zustand state stores
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript definitions
│   ├── constants/         # App constants
│   └── utils/             # Utility functions
├── assets/                # Images, fonts, icons
├── app.json              # Expo configuration
├── package.json
└── tsconfig.json
```

## Key Features

- **Dashboard**: Overview of spending with charts
- **Expense Tracking**: Add, edit, delete expenses
- **Categories**: Manage expense categories
- **Budget Alerts**: Visual progress and notifications
- **Multi-platform**: iOS, Android, and Web support

## Available Scripts

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web

# Run tests
npm test

# Type check
npm run type-check

# Lint
npm run lint
```

## State Management

The app uses Zustand for state management:

- `useAuthStore` - Authentication state
- `useExpenseStore` - Expenses data and operations
- `useCategoryStore` - Categories data
- `useDashboardStore` - Dashboard and analytics data

## Navigation

Uses Expo Router for file-based navigation:

- `/` - Splash/loading screen
- `/login` - Login screen
- `/signup` - Registration screen
- `/(tabs)` - Main tab navigator
  - `/(tabs)/` - Dashboard
  - `/(tabs)/expenses` - Expenses list
  - `/(tabs)/categories` - Categories
  - `/(tabs)/settings` - Settings
- `/add-expense` - Add expense modal

## Building for Production

### Expo Application Services (EAS)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both
eas build --platform all
```

### Local Builds

```bash
# iOS (requires Mac)
npx expo run:ios --configuration Release

# Android
npx expo run:android --variant release
```

## Contributing

1. Follow the existing code style
2. Write meaningful commit messages
3. Test on both iOS and Android
4. Update types when adding new features
