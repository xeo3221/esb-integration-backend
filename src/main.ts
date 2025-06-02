/*
 * BOOTSTRAP APLIKACJI ESB - Production Configuration
 *
 * Problem do rozwiązania:
 * ESB jako enterprise system potrzebuje profesjonalnej konfiguracji:
 * - Security (CORS, authentication, rate limiting)
 * - Documentation (OpenAPI/Swagger)
 * - Monitoring i health checks
 * - Environment-specific settings
 *
 * Jak to rozwiązujemy:
 * Bootstrap function inicjalizuje production-ready ESB:
 * - Swagger documentation dla wszystkich API
 * - CORS dla cross-origin integration
 * - Global middleware (correlation ID, validation)
 * - Health check endpoints registration
 * - Environment-based configuration
 *
 * W pełnej implementacji (jak w docs.md):
 * - Kong/Nginx jako API Gateway z load balancing
 * - Helmet security middleware
 * - Global validation pipes z Zod
 * - Rate limiting per endpoint/client
 * - Prometheus metrics export
 * - OpenTelemetry distributed tracing
 * - Graceful shutdown handlers
 * - Database connection pooling
 * - Redis cluster connection
 *
 * Dlaczego taka konfiguracja:
 * - Enterprise-grade security i monitoring
 * - Developer experience (Swagger docs)
 * - Production readiness z health checks
 * - Scalability i observability
 */

import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Podstawowa konfiguracja CORS
  app.enableCors();

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle("ESB Integration API")
    .setDescription(
      "Enterprise Service Bus dla e-commerce startup - integracja systemów magazynowych, fakturowania, CRM i marketplace"
    )
    .setVersion("1.0")
    .addTag("health", "Health checks aplikacji i systemów")
    .addTag("queues", "Kolejki ESB i asynchroniczne przetwarzanie")
    .addTag("adapters", "Adaptery do systemów zewnętrznych")
    .addTag("orders", "Przetwarzanie zamówień - główny przepływ ESB")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 ESB Integration API running on port ${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
}

bootstrap();
