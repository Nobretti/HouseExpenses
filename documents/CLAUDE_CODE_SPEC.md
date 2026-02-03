# House Expenses Manager - Complete Project Specification

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technical Architecture](#technical-architecture)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [Backend API Design](#backend-api-design)
6. [Frontend Architecture](#frontend-architecture)
7. [Features Specification](#features-specification)
8. [Categories Definition](#categories-definition)
9. [UI/UX Guidelines](#uiux-guidelines)
10. [Authentication Flow](#authentication-flow)
11. [Implementation Phases](#implementation-phases)
12. [Testing Strategy](#testing-strategy)

---

## Project Overview

### Description
A cross-platform application (Mobile, Tablet, Desktop) designed for families to manage household expenses with support for weekly, monthly, and annual tracking. The app provides budget limits per category, visual dashboards with progress indicators, and alerts when spending exceeds defined thresholds.

### Key Objectives
- **Simplicity**: Easy to use for non-technical family members
- **Visual Feedback**: Intuitive charts and progress bars
- **Budget Control**: Proactive alerts before overspending
- **Cross-Platform**: Single codebase for all devices
- **Family-Friendly**: Icons and colors that make expense tracking enjoyable

### Target Users
- Portuguese-speaking families
- Users managing household budgets
- Multiple family members sharing expense tracking

---

## Technical Architecture

### Technology Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Frontend** | React Native + Expo | Cross-platform (iOS, Android, Web, Desktop) from single codebase |
| **Backend** | Spring Boot 3.x (Java 21) | Robust, well-documented, excellent for REST APIs |
| **Database** | Supabase (PostgreSQL) | Managed PostgreSQL with built-in auth and real-time capabilities |
| **Authentication** | Supabase Auth | Email verification, password reset, session management |
| **Charts** | react-native-chart-kit or Victory Native | Cross-platform charting |
| **State Management** | Zustand or React Context | Lightweight, simple state management |
| **API Communication** | Axios / React Query | Caching, retry logic, optimistic updates |

### Architecture Diagram

```
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|  React Native    |<--->|  Spring Boot     |<--->|    Supabase      |
|  (Frontend)      |     |  (Backend API)   |     |  (PostgreSQL)    |
|                  |     |                  |     |                  |
|  - Mobile        |     |  - REST API      |     |  - Users         |
|  - Tablet        |     |  - Business      |     |  - Expenses      |
|  - Desktop       |     |    Logic         |     |  - Categories    |
|  - Web           |     |  - Calculations  |     |  - Budgets       |
|                  |     |  - Predictions   |     |  - Settings      |
+------------------+     +------------------+     +------------------+
         |                       |                        |
         |                       v                        |
         |              +------------------+              |
         +------------->|  Supabase Auth   |<-------------+
                        |  (Email/JWT)     |
                        +------------------+
```

---

## Project Structure

### Root Directory Layout

```
HouseExpenses/
├── backend/                    # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/houseexpenses/
│   │   │   │   ├── HouseExpensesApplication.java
│   │   │   │   ├── config/
│   │   │   │   │   ├── SecurityConfig.java
│   │   │   │   │   ├── SupabaseConfig.java
│   │   │   │   │   └── CorsConfig.java
│   │   │   │   ├── controller/
│   │   │   │   │   ├── AuthController.java
│   │   │   │   │   ├── ExpenseController.java
│   │   │   │   │   ├── CategoryController.java
│   │   │   │   │   ├── BudgetController.java
│   │   │   │   │   └── DashboardController.java
│   │   │   │   ├── service/
│   │   │   │   │   ├── AuthService.java
│   │   │   │   │   ├── ExpenseService.java
│   │   │   │   │   ├── CategoryService.java
│   │   │   │   │   ├── BudgetService.java
│   │   │   │   │   ├── DashboardService.java
│   │   │   │   │   └── AlertService.java
│   │   │   │   ├── repository/
│   │   │   │   │   ├── ExpenseRepository.java
│   │   │   │   │   ├── CategoryRepository.java
│   │   │   │   │   ├── SubCategoryRepository.java
│   │   │   │   │   └── BudgetRepository.java
│   │   │   │   ├── model/
│   │   │   │   │   ├── User.java
│   │   │   │   │   ├── Expense.java
│   │   │   │   │   ├── Category.java
│   │   │   │   │   ├── SubCategory.java
│   │   │   │   │   ├── Budget.java
│   │   │   │   │   └── Alert.java
│   │   │   │   ├── dto/
│   │   │   │   │   ├── ExpenseDTO.java
│   │   │   │   │   ├── CategoryDTO.java
│   │   │   │   │   ├── BudgetDTO.java
│   │   │   │   │   ├── DashboardDTO.java
│   │   │   │   │   └── AlertDTO.java
│   │   │   │   ├── exception/
│   │   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   │   ├── BudgetExceededException.java
│   │   │   │   │   └── ResourceNotFoundException.java
│   │   │   │   └── util/
│   │   │   │       ├── DateUtils.java
│   │   │   │       └── CalculationUtils.java
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       ├── application-dev.yml
│   │   │       └── application-prod.yml
│   │   └── test/
│   ├── pom.xml
│   └── README.md
│
├── frontend/                   # React Native Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Alert.tsx
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   └── IconButton.tsx
│   │   │   ├── expenses/
│   │   │   │   ├── ExpenseForm.tsx
│   │   │   │   ├── ExpenseList.tsx
│   │   │   │   ├── ExpenseItem.tsx
│   │   │   │   ├── ExpenseFilter.tsx
│   │   │   │   └── QuickExpenseSelector.tsx
│   │   │   ├── categories/
│   │   │   │   ├── CategoryCard.tsx
│   │   │   │   ├── CategoryIcon.tsx
│   │   │   │   ├── CategoryList.tsx
│   │   │   │   └── SubCategoryPicker.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── WeeklyChart.tsx
│   │   │   │   ├── MonthlyChart.tsx
│   │   │   │   ├── AnnualChart.tsx
│   │   │   │   ├── BudgetProgress.tsx
│   │   │   │   ├── CategoryBreakdown.tsx
│   │   │   │   └── SpendingTrend.tsx
│   │   │   └── auth/
│   │   │       ├── LoginForm.tsx
│   │   │       ├── SignUpForm.tsx
│   │   │       └── EmailVerification.tsx
│   │   ├── screens/
│   │   │   ├── auth/
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   ├── SignUpScreen.tsx
│   │   │   │   ├── ForgotPasswordScreen.tsx
│   │   │   │   └── VerifyEmailScreen.tsx
│   │   │   ├── main/
│   │   │   │   ├── DashboardScreen.tsx
│   │   │   │   ├── ExpensesScreen.tsx
│   │   │   │   ├── AddExpenseScreen.tsx
│   │   │   │   ├── QuickAddScreen.tsx
│   │   │   │   └── ExpenseDetailScreen.tsx
│   │   │   ├── categories/
│   │   │   │   ├── CategoriesScreen.tsx
│   │   │   │   └── CategoryDetailScreen.tsx
│   │   │   └── settings/
│   │   │       ├── SettingsScreen.tsx
│   │   │       ├── BudgetSettingsScreen.tsx
│   │   │       ├── CategorySettingsScreen.tsx
│   │   │       └── ProfileScreen.tsx
│   │   ├── navigation/
│   │   │   ├── AppNavigator.tsx
│   │   │   ├── AuthNavigator.tsx
│   │   │   ├── MainNavigator.tsx
│   │   │   └── TabNavigator.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── authService.ts
│   │   │   ├── expenseService.ts
│   │   │   ├── categoryService.ts
│   │   │   ├── budgetService.ts
│   │   │   └── dashboardService.ts
│   │   ├── store/
│   │   │   ├── useAuthStore.ts
│   │   │   ├── useExpenseStore.ts
│   │   │   ├── useCategoryStore.ts
│   │   │   └── useSettingsStore.ts
│   │   ├── hooks/
│   │   │   ├── useExpenses.ts
│   │   │   ├── useCategories.ts
│   │   │   ├── useBudgets.ts
│   │   │   └── useAlerts.ts
│   │   ├── types/
│   │   │   ├── expense.ts
│   │   │   ├── category.ts
│   │   │   ├── budget.ts
│   │   │   ├── user.ts
│   │   │   └── dashboard.ts
│   │   ├── constants/
│   │   │   ├── colors.ts
│   │   │   ├── icons.ts
│   │   │   ├── categories.ts
│   │   │   └── config.ts
│   │   ├── utils/
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   ├── dateUtils.ts
│   │   │   └── currencyUtils.ts
│   │   └── assets/
│   │       ├── icons/
│   │       ├── images/
│   │       └── fonts/
│   ├── App.tsx
│   ├── app.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── babel.config.js
│   └── README.md
│
├── docs/                       # Documentation
│   ├── API.md
│   ├── SETUP.md
│   └── DEPLOYMENT.md
│
├── scripts/                    # Utility scripts
│   ├── setup-dev.sh
│   └── seed-categories.sql
│
├── .gitignore
├── CLAUDE_CODE_SPEC.md         # This file
└── README.md
```

---

## Database Schema

### Entity Relationship Diagram

```
+---------------+       +------------------+       +------------------+
|    users      |       |    categories    |       |  subcategories   |
+---------------+       +------------------+       +------------------+
| id (PK)       |       | id (PK)          |       | id (PK)          |
| email         |       | name             |       | category_id (FK) |
| created_at    |       | icon             |       | name             |
| updated_at    |       | color            |       | icon             |
+---------------+       | type (monthly/   |       | created_at       |
       |                |       annual)    |       +------------------+
       |                | user_id (FK)     |               |
       |                | created_at       |               |
       |                +------------------+               |
       |                        |                         |
       |                        |                         |
       v                        v                         v
+------------------+    +------------------+    +------------------+
|    expenses      |    |     budgets      |    |     alerts       |
+------------------+    +------------------+    +------------------+
| id (PK)          |    | id (PK)          |    | id (PK)          |
| user_id (FK)     |    | user_id (FK)     |    | user_id (FK)     |
| category_id (FK) |    | category_id (FK) |    | budget_id (FK)   |
| subcategory_id   |    | subcategory_id   |    | message          |
|   (FK, nullable) |    |   (FK, nullable) |    | type (warning/   |
| amount           |    | limit_amount     |    |       exceeded)  |
| description      |    | period (weekly/  |    | percentage       |
| date             |    |   monthly/annual)|    | is_read          |
| created_at       |    | created_at       |    | created_at       |
| updated_at       |    | updated_at       |    +------------------+
+------------------+    +------------------+
```

### SQL Schema Definition

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (managed by Supabase Auth, extended here)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(100),
    currency VARCHAR(3) DEFAULT 'EUR',
    locale VARCHAR(10) DEFAULT 'pt-PT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(7) NOT NULL, -- Hex color code
    expense_type VARCHAR(10) NOT NULL CHECK (expense_type IN ('monthly', 'annual')),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subcategories table
CREATE TABLE subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budgets table
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
    limit_amount DECIMAL(10, 2) NOT NULL,
    warning_threshold INTEGER DEFAULT 80, -- Percentage to trigger warning
    period VARCHAR(10) NOT NULL CHECK (period IN ('weekly', 'monthly', 'annual')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category_id, subcategory_id, period)
);

-- Expenses table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
    subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    expense_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts table
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
    alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('warning', 'exceeded')),
    message TEXT NOT NULL,
    percentage DECIMAL(5, 2) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_expenses_user_date ON expenses(user_id, expense_date);
CREATE INDEX idx_expenses_category ON expenses(category_id);
CREATE INDEX idx_budgets_user ON budgets(user_id);
CREATE INDEX idx_alerts_user_unread ON alerts(user_id, is_read) WHERE NOT is_read;

-- Row Level Security Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for categories
CREATE POLICY "Users can view own categories" ON categories
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON categories
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON categories
    FOR DELETE USING (auth.uid() = user_id);

-- Similar RLS policies for other tables...
```

### Seed Data for Default Categories

```sql
-- Function to seed default categories for new users
CREATE OR REPLACE FUNCTION seed_default_categories(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Monthly Categories
    -- Casa
    INSERT INTO categories (user_id, name, icon, color, expense_type, display_order)
    VALUES (p_user_id, 'Casa', 'home', '#4A90D9', 'monthly', 1);

    INSERT INTO subcategories (category_id, name, icon, display_order)
    SELECT id, unnest(ARRAY['Credito Habitacao', 'Condominio', 'Limpeza', 'Agua', 'Eletricidade / Gas']),
           unnest(ARRAY['bank', 'building', 'sparkles', 'droplet', 'zap']),
           unnest(ARRAY[1, 2, 3, 4, 5])
    FROM categories WHERE user_id = p_user_id AND name = 'Casa';

    -- Educacao
    INSERT INTO categories (user_id, name, icon, color, expense_type, display_order)
    VALUES (p_user_id, 'Educacao', 'graduation-cap', '#9B59B6', 'monthly', 2);

    INSERT INTO subcategories (category_id, name, display_order)
    SELECT id, unnest(ARRAY['Escola Leonor', 'Mestrado Joana']),
           unnest(ARRAY[1, 2])
    FROM categories WHERE user_id = p_user_id AND name = 'Educacao';

    -- Saude
    INSERT INTO categories (user_id, name, icon, color, expense_type, display_order)
    VALUES (p_user_id, 'Saude', 'heart-pulse', '#E74C3C', 'monthly', 3);

    INSERT INTO subcategories (category_id, name, display_order)
    SELECT id, unnest(ARRAY['Consultas', 'Farmacias']),
           unnest(ARRAY[1, 2])
    FROM categories WHERE user_id = p_user_id AND name = 'Saude';

    -- Alimentacao / Necessidades
    INSERT INTO categories (user_id, name, icon, color, expense_type, display_order)
    VALUES (p_user_id, 'Alimentacao / Necessidades', 'utensils', '#27AE60', 'monthly', 4);

    INSERT INTO subcategories (category_id, name, display_order)
    SELECT id, unnest(ARRAY['Supermercado', 'Restaurantes', 'Take Away', 'Talho']),
           unnest(ARRAY[1, 2, 3, 4])
    FROM categories WHERE user_id = p_user_id AND name = 'Alimentacao / Necessidades';

    -- Seguros (Monthly)
    INSERT INTO categories (user_id, name, icon, color, expense_type, display_order)
    VALUES (p_user_id, 'Seguros', 'shield-check', '#F39C12', 'monthly', 5);

    INSERT INTO subcategories (category_id, name, display_order)
    SELECT id, 'Seguro Goncalo', 1
    FROM categories WHERE user_id = p_user_id AND name = 'Seguros' AND expense_type = 'monthly';

    -- Carros (Monthly)
    INSERT INTO categories (user_id, name, icon, color, expense_type, display_order)
    VALUES (p_user_id, 'Carros', 'car', '#3498DB', 'monthly', 6);

    INSERT INTO subcategories (category_id, name, display_order)
    SELECT id, 'Gasolina', 1
    FROM categories WHERE user_id = p_user_id AND name = 'Carros' AND expense_type = 'monthly';

    -- Filhos
    INSERT INTO categories (user_id, name, icon, color, expense_type, display_order)
    VALUES (p_user_id, 'Filhos', 'baby', '#E91E63', 'monthly', 7);

    INSERT INTO subcategories (category_id, name, display_order)
    SELECT id, unnest(ARRAY['Roupa', 'Brinquedos']),
           unnest(ARRAY[1, 2])
    FROM categories WHERE user_id = p_user_id AND name = 'Filhos';

    -- Operadores
    INSERT INTO categories (user_id, name, icon, color, expense_type, display_order)
    VALUES (p_user_id, 'Operadores', 'wifi', '#00BCD4', 'monthly', 8);

    -- Outros
    INSERT INTO categories (user_id, name, icon, color, expense_type, display_order)
    VALUES (p_user_id, 'Outros', 'more-horizontal', '#95A5A6', 'monthly', 9);

    INSERT INTO subcategories (category_id, name, display_order)
    SELECT id, unnest(ARRAY['Musica Leonor', 'Piscina', 'Via Verde']),
           unnest(ARRAY[1, 2, 3])
    FROM categories WHERE user_id = p_user_id AND name = 'Outros';

    -- Annual Categories
    -- Viagens / Passeios
    INSERT INTO categories (user_id, name, icon, color, expense_type, display_order)
    VALUES (p_user_id, 'Viagens / Passeios', 'plane', '#1ABC9C', 'annual', 1);

    -- Festa de anos
    INSERT INTO categories (user_id, name, icon, color, expense_type, display_order)
    VALUES (p_user_id, 'Festa de anos Leonor E Goncalo', 'cake', '#FF6B6B', 'annual', 2);

    -- Seguros (Annual)
    INSERT INTO categories (user_id, name, icon, color, expense_type, display_order)
    VALUES (p_user_id, 'Seguros Anuais', 'shield', '#F39C12', 'annual', 3);

    INSERT INTO subcategories (category_id, name, display_order)
    SELECT id, unnest(ARRAY['Seguro Carro Ford Focus', 'Seguro Carro Renault Captur',
                            'Seguro de Vida', 'Seguro Multiriscos', 'IUC', 'IMI']),
           unnest(ARRAY[1, 2, 3, 4, 5, 6])
    FROM categories WHERE user_id = p_user_id AND name = 'Seguros Anuais';

    -- Carros (Annual)
    INSERT INTO categories (user_id, name, icon, color, expense_type, display_order)
    VALUES (p_user_id, 'Carros Anuais', 'car', '#3498DB', 'annual', 4);

    INSERT INTO subcategories (category_id, name, display_order)
    SELECT id, unnest(ARRAY['Inspeccao', 'Revisao', 'Manutencao']),
           unnest(ARRAY[1, 2, 3])
    FROM categories WHERE user_id = p_user_id AND name = 'Carros Anuais';
END;
$$ LANGUAGE plpgsql;
```

---

## Backend API Design

### Base URL
```
Production: https://api.houseexpenses.app/v1
Development: http://localhost:8080/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | Authenticate user |
| POST | `/auth/logout` | End session |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password with token |
| GET | `/auth/verify-email` | Verify email address |

### Expense Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/expenses` | List expenses (with filters) |
| GET | `/expenses/:id` | Get expense details |
| POST | `/expenses` | Create new expense |
| POST | `/expenses/bulk` | Create multiple expenses |
| PUT | `/expenses/:id` | Update expense |
| DELETE | `/expenses/:id` | Delete expense |

**Query Parameters for GET /expenses:**
- `startDate`: ISO date string
- `endDate`: ISO date string
- `categoryId`: UUID
- `subcategoryId`: UUID
- `minAmount`: number
- `maxAmount`: number
- `page`: number (default: 0)
- `size`: number (default: 20)
- `sort`: field,direction (e.g., `date,desc`)

### Category Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List all categories |
| GET | `/categories/:id` | Get category with subcategories |
| POST | `/categories` | Create category |
| PUT | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |
| POST | `/categories/:id/subcategories` | Add subcategory |
| PUT | `/subcategories/:id` | Update subcategory |
| DELETE | `/subcategories/:id` | Delete subcategory |

### Budget Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/budgets` | List all budgets |
| GET | `/budgets/:id` | Get budget details |
| POST | `/budgets` | Create budget |
| PUT | `/budgets/:id` | Update budget |
| DELETE | `/budgets/:id` | Delete budget |
| GET | `/budgets/:id/status` | Get current spending vs budget |

### Dashboard Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/summary` | Overall spending summary |
| GET | `/dashboard/weekly` | Weekly breakdown |
| GET | `/dashboard/monthly` | Monthly breakdown |
| GET | `/dashboard/annual` | Annual breakdown |
| GET | `/dashboard/category-breakdown` | Spending by category |
| GET | `/dashboard/trends` | Spending trends over time |
| GET | `/dashboard/predictions` | Predicted month-end spending |

### Alert Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/alerts` | List alerts |
| GET | `/alerts/unread` | List unread alerts |
| PUT | `/alerts/:id/read` | Mark alert as read |
| PUT | `/alerts/read-all` | Mark all alerts as read |

### Response Formats

**Success Response:**
```json
{
    "success": true,
    "data": { ... },
    "message": "Operation successful"
}
```

**Error Response:**
```json
{
    "success": false,
    "error": {
        "code": "BUDGET_EXCEEDED",
        "message": "Category budget limit exceeded",
        "details": {
            "categoryId": "uuid",
            "limit": 500.00,
            "current": 520.50,
            "exceeded_by": 20.50
        }
    }
}
```

**Paginated Response:**
```json
{
    "success": true,
    "data": [ ... ],
    "pagination": {
        "page": 0,
        "size": 20,
        "totalElements": 150,
        "totalPages": 8,
        "hasNext": true,
        "hasPrevious": false
    }
}
```

---

## Frontend Architecture

### Navigation Structure

```
App
├── AuthNavigator (when not authenticated)
│   ├── LoginScreen
│   ├── SignUpScreen
│   ├── ForgotPasswordScreen
│   └── VerifyEmailScreen
│
└── MainNavigator (when authenticated)
    └── TabNavigator
        ├── DashboardTab
        │   └── DashboardScreen
        │
        ├── ExpensesTab
        │   ├── ExpensesScreen (list)
        │   ├── AddExpenseScreen
        │   ├── QuickAddScreen
        │   └── ExpenseDetailScreen
        │
        ├── CategoriesTab
        │   ├── CategoriesScreen
        │   └── CategoryDetailScreen
        │
        └── SettingsTab
            ├── SettingsScreen
            ├── BudgetSettingsScreen
            ├── CategorySettingsScreen
            └── ProfileScreen
```

### State Management Structure

```typescript
// useAuthStore.ts
interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

// useExpenseStore.ts
interface ExpenseState {
    expenses: Expense[];
    isLoading: boolean;
    filters: ExpenseFilters;
    fetchExpenses: () => Promise<void>;
    addExpense: (expense: CreateExpenseDTO) => Promise<void>;
    updateExpense: (id: string, expense: UpdateExpenseDTO) => Promise<void>;
    deleteExpense: (id: string) => Promise<void>;
    setFilters: (filters: ExpenseFilters) => void;
}

// useCategoryStore.ts
interface CategoryState {
    categories: Category[];
    isLoading: boolean;
    fetchCategories: () => Promise<void>;
    getMonthlyCategories: () => Category[];
    getAnnualCategories: () => Category[];
}

// useSettingsStore.ts
interface SettingsState {
    budgets: Budget[];
    alerts: Alert[];
    unreadAlertCount: number;
    fetchBudgets: () => Promise<void>;
    updateBudget: (id: string, limit: number) => Promise<void>;
    fetchAlerts: () => Promise<void>;
    markAlertAsRead: (id: string) => Promise<void>;
}
```

### Component Props Interfaces

```typescript
// Expense Components
interface ExpenseFormProps {
    initialValues?: Partial<Expense>;
    onSubmit: (expense: CreateExpenseDTO) => void;
    onCancel: () => void;
}

interface ExpenseItemProps {
    expense: Expense;
    onPress: () => void;
    onDelete: () => void;
}

interface QuickExpenseSelectorProps {
    categories: Category[];
    onSelectItems: (items: QuickExpenseItem[]) => void;
}

// Dashboard Components
interface BudgetProgressProps {
    budget: Budget;
    currentSpending: number;
    showAlert?: boolean;
}

interface CategoryBreakdownProps {
    data: CategorySpending[];
    period: 'weekly' | 'monthly' | 'annual';
}

// Chart Components
interface ChartDataPoint {
    label: string;
    value: number;
    color?: string;
}

interface ExpenseChartProps {
    data: ChartDataPoint[];
    type: 'bar' | 'line' | 'pie';
    height?: number;
}
```

---

## Features Specification

### F1: User Authentication

**F1.1 Sign Up**
- Email and password registration
- Password strength validation (min 8 chars, 1 uppercase, 1 number)
- Email verification required before access
- Auto-seed default categories on first login

**F1.2 Login**
- Email/password authentication
- Remember me option
- Session persistence using secure tokens
- Auto-refresh expired tokens

**F1.3 Password Recovery**
- Email-based password reset
- Secure token with 1-hour expiration
- Password reset confirmation

### F2: Expense Management

**F2.1 Add Single Expense**
- Select category (required)
- Select subcategory (optional)
- Enter amount (required, EUR format)
- Enter description (optional)
- Select date (default: today)
- Real-time budget status indicator

**F2.2 Quick Add Multiple Expenses**
- Selection list view with all categories/subcategories
- Checkboxes for quick selection
- Bulk amount entry
- Single-tap submission for common expenses
- Recently used items at top

**F2.3 View Expenses**
- Chronological list view
- Filter by date range, category, amount
- Search by description
- Swipe to delete
- Tap to edit

**F2.4 Edit/Delete Expense**
- Full editing capability
- Confirmation for deletion
- Recalculates budget status on change

### F3: Budget Management

**F3.1 Set Budget Limits**
- Per category budget limits
- Per subcategory budget limits (optional)
- Weekly, monthly, and annual periods
- Warning threshold configuration (default 80%)

**F3.2 Budget Alerts**
- Warning alert at threshold (e.g., 80%)
- Exceeded alert at 100%
- Push notification support
- In-app notification badge
- Alert history

**F3.3 Budget Status**
- Visual progress bar per category
- Color-coded status (green/yellow/red)
- Remaining amount display
- Days remaining in period

### F4: Dashboard

**F4.1 Summary View**
- Total spending (current period)
- Budget utilization percentage
- Top spending categories
- Quick add expense button

**F4.2 Weekly View**
- Daily spending bar chart
- Week-over-week comparison
- Weekly total and average

**F4.3 Monthly View**
- Weekly breakdown bar chart
- Category pie chart
- Month-over-month comparison
- Projected month-end spending

**F4.4 Annual View**
- Monthly breakdown chart
- Year-to-date totals
- Annual expense categories
- Year-over-year comparison

**F4.5 Spending Predictions**
- Linear regression based projections
- End-of-period spending estimate
- Budget impact prediction

### F5: Categories Configuration

**F5.1 View Categories**
- Grouped by monthly/annual
- Visual icons and colors
- Budget status per category

**F5.2 Edit Categories**
- Rename category/subcategory
- Change icon and color
- Reorder categories
- Add/remove subcategories

**F5.3 Custom Categories**
- Create new categories
- Assign to monthly or annual
- Set default budget

### F6: Settings

**F6.1 Profile Settings**
- Display name
- Currency preference (EUR default)
- Language/locale (pt-PT default)

**F6.2 Budget Settings**
- Configure all budget limits
- Set warning thresholds
- Reset to defaults option

**F6.3 Notification Settings**
- Push notification toggle
- Alert frequency
- Daily spending reminder

---

## Categories Definition

### Monthly Categories Structure

```typescript
const monthlyCategories = [
    {
        name: "Casa",
        icon: "home",
        color: "#4A90D9",
        subcategories: [
            { name: "Credito Habitacao", icon: "bank" },
            { name: "Condominio", icon: "building" },
            { name: "Limpeza", icon: "sparkles" },
            { name: "Agua", icon: "droplet" },
            { name: "Eletricidade / Gas", icon: "zap" }
        ]
    },
    {
        name: "Educacao",
        icon: "graduation-cap",
        color: "#9B59B6",
        subcategories: [
            { name: "Escola Leonor", icon: "school" },
            { name: "Mestrado Joana", icon: "book-open" }
        ]
    },
    {
        name: "Saude",
        icon: "heart-pulse",
        color: "#E74C3C",
        subcategories: [
            { name: "Consultas", icon: "stethoscope" },
            { name: "Farmacias", icon: "pill" }
        ]
    },
    {
        name: "Alimentacao / Necessidades",
        icon: "utensils",
        color: "#27AE60",
        subcategories: [
            { name: "Supermercado", icon: "shopping-cart" },
            { name: "Restaurantes", icon: "utensils" },
            { name: "Take Away", icon: "package" },
            { name: "Talho", icon: "beef" }
        ]
    },
    {
        name: "Seguros",
        icon: "shield-check",
        color: "#F39C12",
        subcategories: [
            { name: "Seguro Goncalo", icon: "user-shield" }
        ]
    },
    {
        name: "Carros",
        icon: "car",
        color: "#3498DB",
        subcategories: [
            { name: "Gasolina", icon: "fuel" }
        ]
    },
    {
        name: "Filhos",
        icon: "baby",
        color: "#E91E63",
        subcategories: [
            { name: "Roupa", icon: "shirt" },
            { name: "Brinquedos", icon: "gamepad-2" }
        ]
    },
    {
        name: "Operadores",
        icon: "wifi",
        color: "#00BCD4",
        subcategories: []
    },
    {
        name: "Outros",
        icon: "more-horizontal",
        color: "#95A5A6",
        subcategories: [
            { name: "Musica Leonor", icon: "music" },
            { name: "Piscina", icon: "waves" },
            { name: "Via Verde", icon: "road" }
        ]
    }
];
```

### Annual Categories Structure

```typescript
const annualCategories = [
    {
        name: "Viagens / Passeios",
        icon: "plane",
        color: "#1ABC9C",
        subcategories: []
    },
    {
        name: "Festa de anos Leonor E Goncalo",
        icon: "cake",
        color: "#FF6B6B",
        subcategories: []
    },
    {
        name: "Seguros Anuais",
        icon: "shield",
        color: "#F39C12",
        subcategories: [
            { name: "Seguro Carro Ford Focus", icon: "car" },
            { name: "Seguro Carro Renault Captur", icon: "car" },
            { name: "Seguro de Vida", icon: "heart" },
            { name: "Seguro Multiriscos", icon: "home" },
            { name: "IUC", icon: "file-text" },
            { name: "IMI", icon: "landmark" }
        ]
    },
    {
        name: "Carros Anuais",
        icon: "car",
        color: "#3498DB",
        subcategories: [
            { name: "Inspeccao", icon: "clipboard-check" },
            { name: "Revisao", icon: "wrench" },
            { name: "Manutencao", icon: "settings" }
        ]
    }
];
```

---

## UI/UX Guidelines

### Design Principles

1. **Family-Friendly**: Use friendly icons, soft colors, and clear typography
2. **Minimal Friction**: Maximum 3 taps to complete any action
3. **Visual Feedback**: Progress bars, animations, and color coding
4. **Accessibility**: Large touch targets, readable fonts, color contrast

### Color Palette

```typescript
const colors = {
    // Primary
    primary: '#4A90D9',
    primaryDark: '#357ABD',
    primaryLight: '#6BA3E0',

    // Status
    success: '#27AE60',
    warning: '#F39C12',
    danger: '#E74C3C',

    // Neutrals
    background: '#F5F7FA',
    surface: '#FFFFFF',
    text: '#2C3E50',
    textSecondary: '#7F8C8D',
    border: '#E0E6ED',

    // Category Colors (as defined above)
    casa: '#4A90D9',
    educacao: '#9B59B6',
    saude: '#E74C3C',
    alimentacao: '#27AE60',
    seguros: '#F39C12',
    carros: '#3498DB',
    filhos: '#E91E63',
    operadores: '#00BCD4',
    outros: '#95A5A6',
    viagens: '#1ABC9C',
    festas: '#FF6B6B',
};
```

### Typography

```typescript
const typography = {
    fontFamily: {
        regular: 'Inter-Regular',
        medium: 'Inter-Medium',
        semiBold: 'Inter-SemiBold',
        bold: 'Inter-Bold',
    },
    sizes: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 24,
        xxl: 32,
    },
};
```

### Icon Library
Use **Lucide Icons** (React Native compatible) for consistent iconography.

### Screen Layouts

**Dashboard Screen:**
```
┌─────────────────────────────────────┐
│  Header: "Dashboard"    [Bell Icon] │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │   Total This Month          │    │
│  │   €2,450.00 / €3,500.00    │    │
│  │   ████████████░░░░ 70%     │    │
│  └─────────────────────────────┘    │
│                                      │
│  Period: [Weekly] [Monthly] [Annual] │
│                                      │
│  ┌─────────────────────────────┐    │
│  │      📊 Expense Chart       │    │
│  │                             │    │
│  │   [Bar/Line Chart Here]    │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                      │
│  Top Categories                      │
│  ┌──────────┐ ┌──────────┐          │
│  │ 🏠 Casa  │ │ 🍽️ Food  │          │
│  │ €800     │ │ €450     │          │
│  └──────────┘ └──────────┘          │
│                                      │
│           [+ Add Expense]            │
└─────────────────────────────────────┘
```

**Add Expense Screen:**
```
┌─────────────────────────────────────┐
│  ← Back    "Add Expense"            │
├─────────────────────────────────────┤
│                                      │
│  Amount                              │
│  ┌─────────────────────────────┐    │
│  │  €  [        0.00        ]  │    │
│  └─────────────────────────────┘    │
│                                      │
│  Category *                          │
│  ┌─────────────────────────────┐    │
│  │  🏠 Select category      ▼  │    │
│  └─────────────────────────────┘    │
│                                      │
│  Subcategory                         │
│  ┌─────────────────────────────┐    │
│  │  Select subcategory      ▼  │    │
│  └─────────────────────────────┘    │
│                                      │
│  Date                                │
│  ┌─────────────────────────────┐    │
│  │  📅 January 9, 2026         │    │
│  └─────────────────────────────┘    │
│                                      │
│  Description                         │
│  ┌─────────────────────────────┐    │
│  │  Optional description...    │    │
│  └─────────────────────────────┘    │
│                                      │
│  ⚠️ Warning: 85% of Casa budget used │
│                                      │
│  ┌─────────────────────────────┐    │
│  │        Save Expense         │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

**Quick Add Screen:**
```
┌─────────────────────────────────────┐
│  ← Back    "Quick Add"              │
├─────────────────────────────────────┤
│  [Search categories...]              │
│                                      │
│  🏠 Casa                             │
│  ├─ ☐ Credito Habitacao    [€    ]  │
│  ├─ ☐ Condominio           [€    ]  │
│  ├─ ☐ Agua                 [€    ]  │
│  └─ ☐ Eletricidade         [€    ]  │
│                                      │
│  🍽️ Alimentacao                      │
│  ├─ ☑️ Supermercado        [€85.50] │
│  ├─ ☐ Restaurantes         [€    ]  │
│  └─ ☐ Take Away            [€    ]  │
│                                      │
│  💊 Saude                            │
│  ├─ ☑️ Farmacia            [€23.00] │
│  └─ ☐ Consultas            [€    ]  │
│                                      │
│  ─────────────────────────────────   │
│  Selected: 2 items | Total: €108.50  │
│                                      │
│  ┌─────────────────────────────┐    │
│  │      Save All Expenses      │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

---

## Authentication Flow

### Sign Up Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Sign Up   │────>│   Supabase  │────>│ Send Email  │
│   Form      │     │   Create    │     │ Verification│
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               v
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Seed      │<────│   Verify    │<────│ User Clicks │
│   Categories│     │   Email     │     │ Email Link  │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       v
┌─────────────┐
│  Dashboard  │
└─────────────┘
```

### Login Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │────>│   Supabase  │────>│   Return    │
│   Form      │     │   Auth      │     │   JWT       │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               v
                                        ┌─────────────┐
                                        │  Dashboard  │
                                        └─────────────┘
```

### JWT Token Management

```typescript
// Token storage and refresh
interface TokenManager {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;

    setTokens(access: string, refresh: string, expiresIn: number): void;
    getAccessToken(): string | null;
    isTokenExpired(): boolean;
    refreshTokens(): Promise<void>;
    clearTokens(): void;
}
```

---

## Implementation Phases

### Phase 1: Project Setup & Authentication
**Deliverables:**
- Initialize React Native project with Expo
- Initialize Spring Boot project
- Configure Supabase project and database
- Implement authentication (signup, login, email verification)
- Basic navigation structure
- Auth state management

### Phase 2: Core Data Models & API
**Deliverables:**
- Database schema implementation
- Spring Boot entities and repositories
- CRUD endpoints for expenses, categories, budgets
- API documentation
- Default category seeding

### Phase 3: Expense Management
**Deliverables:**
- Add single expense screen
- Quick add multiple expenses screen
- Expense list with filters
- Edit/delete expense functionality
- Category/subcategory selection components

### Phase 4: Budget & Alerts
**Deliverables:**
- Budget configuration screen
- Budget limit enforcement
- Alert generation service
- Alert display components
- Push notification integration

### Phase 5: Dashboard & Analytics
**Deliverables:**
- Dashboard summary view
- Weekly/monthly/annual charts
- Category breakdown visualization
- Spending trends
- Prediction algorithms

### Phase 6: Settings & Polish
**Deliverables:**
- Profile settings
- Category management
- Notification preferences
- UI refinements
- Performance optimization
- Testing and bug fixes

---

## Testing Strategy

### Backend Testing

```java
// Unit Tests
@Test
void shouldCalculateMonthlyTotal() {
    // Given
    List<Expense> expenses = createTestExpenses();

    // When
    BigDecimal total = expenseService.calculateTotal(expenses, Period.MONTHLY);

    // Then
    assertThat(total).isEqualTo(new BigDecimal("1250.00"));
}

// Integration Tests
@SpringBootTest
@AutoConfigureMockMvc
class ExpenseControllerTest {
    @Test
    void shouldCreateExpense() {
        // Test expense creation endpoint
    }
}
```

### Frontend Testing

```typescript
// Component Tests
describe('ExpenseForm', () => {
    it('should submit valid expense', async () => {
        const onSubmit = jest.fn();
        render(<ExpenseForm onSubmit={onSubmit} />);

        fireEvent.changeText(getByTestId('amount-input'), '50.00');
        fireEvent.press(getByTestId('category-select'));
        // ... complete form
        fireEvent.press(getByTestId('submit-button'));

        expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
            amount: 50.00
        }));
    });
});

// Integration Tests
describe('Dashboard', () => {
    it('should display correct monthly total', async () => {
        // Mock API response
        // Render dashboard
        // Assert totals displayed correctly
    });
});
```

### E2E Testing

```typescript
// Detox E2E Tests
describe('Expense Flow', () => {
    it('should add expense and see it in list', async () => {
        await element(by.id('add-expense-button')).tap();
        await element(by.id('amount-input')).typeText('50.00');
        await element(by.id('category-select')).tap();
        await element(by.text('Alimentacao')).tap();
        await element(by.id('save-button')).tap();

        await expect(element(by.text('€50.00'))).toBeVisible();
    });
});
```

---

## Development Commands

### Backend (Spring Boot)

```bash
# Navigate to backend directory
cd backend

# Run development server
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Run tests
./mvnw test

# Build production JAR
./mvnw clean package -Pprod

# Generate API documentation
./mvnw springdoc-openapi:generate
```

### Frontend (React Native)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Expo development server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android

# Run tests
npm test

# Build for production
eas build --platform all
```

### Database

```bash
# Apply migrations (using Supabase CLI)
supabase db push

# Generate types from database
supabase gen types typescript --local > src/types/database.ts

# Reset database
supabase db reset
```

---

## Environment Variables

### Backend (application.yml)

```yaml
spring:
  datasource:
    url: ${SUPABASE_DB_URL}
    username: ${SUPABASE_DB_USER}
    password: ${SUPABASE_DB_PASSWORD}

supabase:
  url: ${SUPABASE_URL}
  anon-key: ${SUPABASE_ANON_KEY}
  service-key: ${SUPABASE_SERVICE_KEY}

jwt:
  secret: ${JWT_SECRET}
  expiration: 3600000  # 1 hour
```

### Frontend (.env)

```env
EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Security Considerations

1. **Authentication**: All API endpoints (except auth) require valid JWT
2. **Authorization**: Row-level security ensures users only access their data
3. **Input Validation**: All inputs validated on both frontend and backend
4. **HTTPS**: All production traffic encrypted
5. **Password Security**: Bcrypt hashing via Supabase Auth
6. **Rate Limiting**: API rate limits to prevent abuse
7. **CORS**: Properly configured for allowed origins only

---

## Appendix: API DTOs

```typescript
// Request DTOs
interface CreateExpenseDTO {
    categoryId: string;
    subcategoryId?: string;
    amount: number;
    description?: string;
    date: string; // ISO format
}

interface CreateBudgetDTO {
    categoryId: string;
    subcategoryId?: string;
    limitAmount: number;
    warningThreshold?: number;
    period: 'weekly' | 'monthly' | 'annual';
}

// Response DTOs
interface ExpenseDTO {
    id: string;
    category: CategoryDTO;
    subcategory?: SubCategoryDTO;
    amount: number;
    description?: string;
    date: string;
    createdAt: string;
}

interface DashboardSummaryDTO {
    totalSpending: number;
    budgetLimit: number;
    utilizationPercentage: number;
    topCategories: CategorySpendingDTO[];
    recentExpenses: ExpenseDTO[];
    alerts: AlertDTO[];
}

interface BudgetStatusDTO {
    budget: BudgetDTO;
    currentSpending: number;
    remainingAmount: number;
    utilizationPercentage: number;
    status: 'ok' | 'warning' | 'exceeded';
    daysRemaining: number;
}
```

---

*This specification document serves as the complete blueprint for the House Expenses Manager application. Follow the implementation phases sequentially, referring to relevant sections as needed.*
