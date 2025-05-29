/*
 * KONFIGURACJA REDIS - Kolejki ESB
 *
 * Problem: ESB potrzebuje kolejek do przetwarzania w tle
 * Rozwiązanie: Redis + BullMQ dla zadań asynchronicznych
 *
 * Tryb demo: Aplikacja działa bez Redis (tylko logi)
 * Produkcja: Redis wymagany dla kolejek
 *
 * W pełnej implementacji:
 * - Dodanie monitoring Redis
 * - Konfiguracja cluster Redis (dla produkcji)
 * - Retry logic dla połączeń
 * - Graceful shutdown
 */

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
