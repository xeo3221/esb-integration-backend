import { BullRootModuleOptions } from "@nestjs/bull";

// Sprawdzenie czy Redis jest dostępny
export const isRedisConfigured = () => {
  return !!(process.env.REDIS_HOST || process.env.REDIS_URL);
};

export const redisConfig: BullRootModuleOptions = {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD || undefined,
    // Konfiguracja dla różnych środowisk
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    lazyConnect: true,
    // Dla demonstracji - nie blokuj aplikacji jeśli Redis niedostępny
    connectTimeout: 5000,
  },
  // Domyślne ustawienia kolejek
  defaultJobOptions: {
    removeOnComplete: 50, // zachowaj 50 zakończonych zadań
    removeOnFail: 50, // zachowaj 50 nieudanych zadań
    attempts: 3, // 3 próby dla każdego zadania
    backoff: {
      type: "exponential",
      delay: 2000, // rozpocznij od 2 sekund
    },
  },
};

/**
 * Konfiguracja opcjonalna dla środowiska deweloperskiego
 * - Aplikacja działa bez Redis z ostrzeżeniem
 * - W produkcji Redis jest wymagany
 *
 * Opcje deploymentu Redis:
 * 1. Lokalny Redis: redis://localhost:6379
 * 2. Redis Cloud (darmowy): https://redis.com/try-free/
 * 3. Upstash Redis: https://upstash.com/
 * 4. Railway Redis addon
 */

/**
 * W pełnej implementacji:
 * - Dodanie monitoring Redis
 * - Konfiguracja cluster Redis (dla produkcji)
 * - Retry logic dla połączeń
 * - Graceful shutdown
 */
