# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Cache dependencies first
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build the application
COPY src ./src
RUN mvn clean package -Pprod -DskipTests -B

# Stage 2: Run
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Add non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=build /app/target/house-expenses-api-1.0.0-SNAPSHOT.jar app.jar

# Use non-root user
USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-Xmx256m", "-Xms128m", "-jar", "app.jar", "--spring.profiles.active=prod"]
