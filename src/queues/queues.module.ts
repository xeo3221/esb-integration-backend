/*
 * MODUŁ KOLEJEK ESB - DEMO MODE
 *
 * Problem do rozwiązania:
 * ESB musi przetwarzać operacje asynchronicznie w tle.
 * Każdy system (magazyn, faktury, CRM) potrzebuje swojej kolejki.
 *
 * Jak to rozwiązujemy w DEMO MODE:
 * Moduł dostarcza QueueService który symuluje kolejki:
 * - Loguje wszystkie operacje
 * - Zwraca fake job IDs
 * - Pokazuje jak by działały prawdziwe kolejki
 *
 * W pełnej implementacji:
 * - BullMQ + Redis configuration
 * - Dead letter queues dla nieudanych zadań
 * - Priorytetyzacja zadań (faktury > logi)
 * - Rate limiting dla zewnętrznych API
 * - Monitoring i metryki kolejek
 * - Graceful shutdown handling
 * - Horizontal scaling z wieloma workerami
 */

import { Module } from "@nestjs/common";
import { QueueService } from "./queue.service";

@Module({
  imports: [],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueuesModule {}
