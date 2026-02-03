# House Expenses Manager

A cross-platform application for managing household expenses with budget tracking, alerts, and visual analytics.

## Overview

House Expenses Manager helps families track their weekly, monthly, and annual expenses with:

- Categorized expense tracking
- Budget limits and alerts
- Visual dashboards and charts
- Multi-platform support (iOS, Android, Web, Desktop)

## Project Structure

```
HouseExpenses/
├── backend/           # Spring Boot REST API
├── frontend/          # React Native (Expo) App
├── docs/              # Documentation
└── CLAUDE_CODE_SPEC.md  # Full specification
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React Native + Expo |
| Backend | Spring Boot 3.x (Java 21) |
| Database | PostgreSQL (Supabase) |
| Auth | Supabase Auth |
| State | Zustand |

## Quick Start

### Prerequisites

- Java 21+
- Node.js 18+
- PostgreSQL or Supabase account

### Backend Setup

```bash
cd backend

# Configure database (edit application-dev.yml or set env vars)
export DB_USERNAME=postgres
export DB_PASSWORD=your_password
export JWT_SECRET=your-secret-key

# Run
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

API will be available at `http://localhost:8080/api`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API URL and Supabase keys

# Run
npx expo start
```

## Features

### Expense Categories

**Monthly:**
- Casa (House)
- Educacao (Education)
- Saude (Health)
- Alimentacao (Food)
- Seguros (Insurance)
- Carros (Cars)
- Filhos (Children)
- Operadores (Utilities)
- Outros (Others)

**Annual:**
- Viagens (Travel)
- Festas (Celebrations)
- Seguros Anuais (Annual Insurance)
- Carros Anuais (Annual Car Expenses)

### Budget Alerts

- Warning at 80% of budget (configurable)
- Exceeded alert at 100%
- In-app notifications
- Visual progress indicators

### Dashboard

- Total spending overview
- Category breakdown charts
- Weekly/Monthly/Annual views
- Recent transactions
- Budget status indicators

## API Documentation

When running the backend, access:
- Swagger UI: `http://localhost:8080/api/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/api/api-docs`

## Development

### Backend Development

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Frontend Development

```bash
cd frontend
npx expo start
```

### Running Tests

```bash
# Backend tests
cd backend && ./mvnw test

# Frontend tests
cd frontend && npm test
```

## Deployment

See detailed deployment instructions in:
- `backend/README.md`
- `frontend/README.md`

## License

Private project - All rights reserved
