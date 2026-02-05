#!/bin/bash
set -e

echo "=== EAS Build Pre-Install Hook ==="

# Check if android folder exists
if [ -d "android" ]; then
  echo "Android folder exists, checking gradle wrapper..."

  # Check if gradle wrapper JAR exists
  if [ ! -f "android/gradle/wrapper/gradle-wrapper.jar" ]; then
    echo "Gradle wrapper JAR missing, downloading..."
    mkdir -p android/gradle/wrapper
    curl -L -o android/gradle/wrapper/gradle-wrapper.jar \
      "https://github.com/gradle/gradle/raw/v8.10.2/gradle/wrapper/gradle-wrapper.jar"
    echo "Gradle wrapper JAR downloaded."
  else
    echo "Gradle wrapper JAR exists."
  fi

  # Verify the JAR file
  if [ -f "android/gradle/wrapper/gradle-wrapper.jar" ]; then
    echo "JAR file size: $(wc -c < android/gradle/wrapper/gradle-wrapper.jar) bytes"
  fi
fi

echo "=== Pre-Install Hook Complete ==="
