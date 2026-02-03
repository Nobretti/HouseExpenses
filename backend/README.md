# House Expenses API - Backend

Spring Boot REST API for the House Expenses Management Application.

## Requirements

- Java 21+
- Maven 3.8+
- PostgreSQL 15+ (or Supabase)

## Quick Start

### 1. Configure Database

Set the following environment variables or update `application-dev.yml`:

```bash
export DB_USERNAME=postgres
export DB_PASSWORD=your_password
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_ANON_KEY=your-anon-key
export JWT_SECRET=your-256-bit-secret-key-minimum-32-characters
```

### 2. Run the Application

```bash
# Development mode
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Or with Maven wrapper on Windows
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
```

### 3. Access the API

- API Base URL: `http://localhost:8080/api`
- Swagger UI: `http://localhost:8080/api/swagger-ui.html`
- OpenAPI Docs: `http://localhost:8080/api/api-docs`

## Project Structure

```
src/main/java/com/houseexpenses/
├── HouseExpensesApplication.java    # Main application entry
├── config/                          # Configuration classes
│   ├── SecurityConfig.java          # Spring Security config
│   ├── JwtAuthenticationFilter.java # JWT filter
│   └── JwtTokenProvider.java        # JWT utilities
├── controller/                      # REST controllers
│   ├── AuthController.java
│   ├── ExpenseController.java
│   ├── CategoryController.java
│   ├── BudgetController.java
│   ├── DashboardController.java
│   └── AlertController.java
├── service/                         # Business logic
│   ├── AuthService.java
│   ├── ExpenseService.java
│   ├── CategoryService.java
│   ├── BudgetService.java
│   ├── DashboardService.java
│   └── AlertService.java
├── repository/                      # Data access
├── model/                           # JPA entities
├── dto/                             # Data transfer objects
├── exception/                       # Exception handling
└── util/                            # Utility classes
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/auth/session` | Create user session |
| POST | `/v1/auth/refresh` | Refresh tokens |
| GET | `/v1/auth/profile` | Get user profile |
| PUT | `/v1/auth/profile` | Update user profile |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/expenses` | List expenses |
| GET | `/v1/expenses/{id}` | Get expense |
| POST | `/v1/expenses` | Create expense |
| POST | `/v1/expenses/bulk` | Create bulk expenses |
| PUT | `/v1/expenses/{id}` | Update expense |
| DELETE | `/v1/expenses/{id}` | Delete expense |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/categories` | List categories |
| GET | `/v1/categories/{id}` | Get category |
| POST | `/v1/categories` | Create category |
| PUT | `/v1/categories/{id}` | Update category |
| DELETE | `/v1/categories/{id}` | Delete category |
| POST | `/v1/categories/{id}/subcategories` | Create subcategory |

### Budgets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/budgets` | List budgets |
| GET | `/v1/budgets/{id}` | Get budget |
| POST | `/v1/budgets` | Create budget |
| PUT | `/v1/budgets/{id}` | Update budget |
| DELETE | `/v1/budgets/{id}` | Delete budget |
| GET | `/v1/budgets/{id}/status` | Get budget status |
| GET | `/v1/budgets/status` | Get all budget statuses |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/dashboard/summary` | Get summary |
| GET | `/v1/dashboard/weekly` | Get weekly data |
| GET | `/v1/dashboard/monthly` | Get monthly data |
| GET | `/v1/dashboard/annual` | Get annual data |
| GET | `/v1/dashboard/category-breakdown` | Get category breakdown |

### Alerts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/alerts` | List alerts |
| GET | `/v1/alerts/unread` | Get unread alerts |
| GET | `/v1/alerts/count` | Get unread count |
| PUT | `/v1/alerts/{id}/read` | Mark as read |
| PUT | `/v1/alerts/read-all` | Mark all as read |

## Testing

```bash
# Run all tests
./mvnw test

# Run with coverage
./mvnw test jacoco:report
```

## Building for Production

```bash
# Build JAR
./mvnw clean package -Pprod -DskipTests

# Run JAR
java -jar target/house-expenses-api-1.0.0-SNAPSHOT.jar --spring.profiles.active=prod
```

## Docker

```bash
# Build image
docker build -t house-expenses-api .

# Run container
docker run -p 8080:8080 \
  -e DATABASE_URL=jdbc:postgresql://host:5432/db \
  -e DB_USERNAME=user \
  -e DB_PASSWORD=pass \
  -e JWT_SECRET=your-secret \
  house-expenses-api
```
