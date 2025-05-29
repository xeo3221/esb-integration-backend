/*
 * MODUŁ BAZY DANYCH ESB
 *
 * Problem do rozwiązania:
 * ESB potrzebuje centralnej bazy danych do przechowywania:
 * - Statusów integracji i logów
 * - Konfiguracji systemów zewnętrznych
 * - Historii operacji i błędów
 *
 * Jak to rozwiązujemy:
 * Globalny moduł udostępnia połączenie PostgreSQL (Neon):
 * - Drizzle ORM dla type-safety
 * - Connection pooling dla wydajności
 * - Dependency injection dla łatwego testowania
 *
 * Dlaczego PostgreSQL:
 * - ACID transactions dla krytycznych operacji
 * - JSON support dla elastycznych danych
 * - Skalowanie i wydajność
 * - Neon - managed database bez administracji
 *
 * W pełnej implementacji:
 * - Health check połączenia
 * - Graceful shutdown przy zamykaniu aplikacji
 * - Retry logic dla połączeń
 * - Monitoring połączeń i performance metrics
 * - Migration management i backup strategies
 */

import { Module, Global } from "@nestjs/common";
import { createDatabaseConnection } from "./database.config";

export const DATABASE_CONNECTION = "DATABASE_CONNECTION";

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: () => {
        const { db } = createDatabaseConnection();
        return db;
      },
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
