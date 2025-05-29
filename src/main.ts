/*
 * BOOTSTRAP APLIKACJI ESB
 *
 * Problem do rozwiązania:
 * Aplikacja Nest.js musi być uruchomiona z odpowiednią konfiguracją.
 * CORS, port, middleware - wszystko musi być skonfigurowane.
 *
 * Jak to rozwiązujemy:
 * Bootstrap function inicjalizuje aplikację:
 * - Tworzy instancję Nest.js
 * - Konfiguruje CORS dla integracji
 * - Ustawia port z environment variables
 * - Uruchamia serwer HTTP
 *
 * Dlaczego taka konfiguracja:
 * - CORS umożliwia dostęp z frontendu/innych domen
 * - Dynamiczny port dla różnych środowisk (dev/prod)
 * - Proste logowanie startu aplikacji
 *
 * W pełnej implementacji:
 * - Swagger documentation setup
 * - Global validation pipes
 * - Security middleware (helmet, rate limiting)
 * - Graceful shutdown handlers
 * - Health check endpoints registration
 */

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Podstawowa konfiguracja CORS
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 ESB Integration API running on port ${port}`);
}

bootstrap();
