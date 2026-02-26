FROM eclipse-temurin:17-jdk-jammy AS builder
WORKDIR /app
COPY . .
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew && ./gradlew bootJar -x test

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=builder /app/build/libs/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
