/*
 * KONFIGURACJA POŁĄCZENIA Z BAZĄ DANYCH
 *
 * Problem do rozwiązania:
 * ESB potrzebuje niezawodnego połączenia z PostgreSQL.
 * Różne środowiska (dev/prod) mają różne wymagania bezpieczeństwa.
 *
 * Jak to rozwiązujemy:
 * Funkcja tworzy połączenie z Neon PostgreSQL:
 * - Connection pooling (max 20 połączeń)
 * - SSL dla produkcji, bez SSL dla developmentu
 * - Timeouty zapobiegające zawieszeniu
 * - Drizzle ORM z type-safe schema
 *
 * Dlaczego Neon:
 * - Serverless PostgreSQL - autoscaling
 * - Bez zarządzania infrastrukturą
 * - Automatyczne backupy i wysoką dostępność
 * - Darmowy tier dla prototypów
 *
 * W pełnej implementacji:
 * - Read replicas dla odczytów
 * - Connection retries z exponential backoff
 * - Monitoring metryk połączeń
 * - Circuit breaker dla reliability
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../drizzle/schema";

export const createDatabaseConnection = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const pool = new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  const db = drizzle(pool, { schema });

  return { db, pool };
};

export type Database = ReturnType<typeof createDatabaseConnection>["db"];
