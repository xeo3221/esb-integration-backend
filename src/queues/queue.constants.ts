/*
 * STAŁE NAZW KOLEJEK ESB
 *
 * Problem do rozwiązania:
 * ESB używa wielu kolejek, nazwy muszą być spójne w całej aplikacji.
 * Hard-coded stringi prowadzą do błędów i trudności w refaktoringu.
 *
 * Jak to rozwiązujemy:
 * Centralne miejsce z nazwami wszystkich kolejek:
 * - Type-safe dzięki TypeScript
 * - Łatwe zmiany nazw w jednym miejscu
 * - Intellisense w całej aplikacji
 *
 * Nazwy kolejek odzwierciedlają systemy ESB:
 * - warehouse-sync: operacje magazynowe
 * - invoice-processing: generowanie faktur
 * - crm-updates: aktualizacje danych klientów
 * - marketplace-sync: synchronizacja z platformami
 * - integration-log: logowanie operacji ESB
 *
 * W pełnej implementacji:
 * - Dead letter queues (.dlq suffix)
 * - Priority queues (.priority suffix)
 * - Retry queues (.retry suffix)
 * - Environment-specific prefixes (dev., prod.)
 */

// Nazwy kolejek dla różnych operacji ESB
export const QUEUE_NAMES = {
  WAREHOUSE_SYNC: "warehouse-sync",
  INVOICE_PROCESSING: "invoice-processing",
  CRM_UPDATES: "crm-updates",
  MARKETPLACE_SYNC: "marketplace-sync",
  INTEGRATION_LOG: "integration-log",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
