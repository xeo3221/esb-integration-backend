/*
 * GŁÓWNY SERWIS APLIKACJI ESB
 *
 * Problem do rozwiązania:
 * Aplikacja potrzebuje podstawowych operacji jak info, health checks.
 * Inne kontrolery i serwisy potrzebują współdzielonych funkcji.
 *
 * Jak to rozwiązujemy:
 * Centralny serwis udostępnia:
 * - Informacje o aplikacji (nazwa, wersja)
 * - Test połączenia z bazą danych
 * - Wspólne operacje dla całej aplikacji
 *
 * Dlaczego osobny serwis:
 * - Separacja logiki biznesowej od kontrolera
 * - Możliwość reużycia w innych miejscach
 * - Łatwiejsze testowanie (mockowanie)
 * - Centralne miejsce dla wspólnych operacji
 *
 * W pełnej implementacji:
 * - Więcej szczegółowych health checks
 * - Sprawdzanie stanu połączeń zewnętrznych
 * - Metryki wydajności i statystyki
 * - Graceful shutdown handling
 */

import { Injectable, Inject } from "@nestjs/common";
import { DATABASE_CONNECTION } from "./config/database.module";
import { Database } from "./config/database.config";

@Injectable()
export class AppService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  getInfo(): string {
    return "ESB Integration API - E-commerce Systems Integration";
  }

  /**
   * Test połączenia z bazą danych
   * W pełnej implementacji:
   * - Więcej szczegółowych testów
   * - Sprawdzanie stanu połączenia
   * - Metryki wydajności
   */
  async testDatabaseConnection(): Promise<{
    connected: boolean;
    timestamp: string;
  }> {
    try {
      // Prosty test połączenia - wykonanie zapytania SQL
      await this.db.execute("SELECT 1");
      return {
        connected: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        connected: false,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
