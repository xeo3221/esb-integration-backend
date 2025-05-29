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
export class DatabaseModule {
  /**
   * W pełnej implementacji:
   * - Dodanie healthcheck połączenia
   * - Graceful shutdown przy zamykaniu aplikacji
   * - Retry logic dla połączeń
   * - Monitoring połączeń
   */
}
