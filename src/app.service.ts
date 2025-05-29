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
