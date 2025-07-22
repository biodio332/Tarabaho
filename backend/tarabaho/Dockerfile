# Use Eclipse Temurin base image with Java 17
FROM eclipse-temurin:17-jdk-jammy

# Set working directory
WORKDIR /app

# Copy Maven wrapper and POM file
COPY mvnw* pom.xml ./

# Copy Maven wrapper folder (now exists!)
COPY .mvn .mvn

# Copy the rest of the app
COPY src ./src

# Give permission to mvnw
RUN chmod +x mvnw

# Build the app without tests
RUN ./mvnw clean package -DskipTests

# Expose port
EXPOSE 8080

# Run the Spring Boot app
CMD ["./mvnw", "spring-boot:run"]
