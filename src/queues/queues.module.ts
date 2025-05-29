/*
 * MODUŁ KOLEJEK ESB
 *
 * Problem do rozwiązania:
 * ESB musi przetwarzać operacje asynchronicznie w tle.
 * Każdy system (magazyn, faktury, CRM) potrzebuje swojej kolejki.
 *
 * Jak to rozwiązujemy:
 * Moduł konfiguruje BullMQ z Redis:
 * - Rejestruje wszystkie kolejki ESB
 * - Łączy procesory do obsługi zadań
 * - Udostępnia QueueService do dodawania zadań
 *
 * Dlaczego BullMQ:
 * - Mature library z długą historią
 * - Redis backend - szybki i niezawodny
 * - Built-in retry logic i error handling
 * - Dashboard do monitorowania kolejek
 *
 * W pełnej implementacji:
 * - Dead letter queues dla nieudanych zadań
 * - Priorytetyzacja zadań (faktury > logi)
 * - Rate limiting dla zewnętrznych API
 * - Monitoring i metryki kolejek
 * - Graceful shutdown handling
 * - Horizontal scaling z wieloma workerami
 */

import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { redisConfig } from "../config/redis.config";
import { WarehouseProcessor } from "./processors/warehouse.processor";
import { QueueService } from "./queue.service";
import { QUEUE_NAMES } from "./queue.constants";

@Module({
  imports: [
    // Główna konfiguracja BullMQ
    BullModule.forRoot(redisConfig),

    // Rejestracja kolejek
    BullModule.registerQueue(
      { name: QUEUE_NAMES.WAREHOUSE_SYNC },
      { name: QUEUE_NAMES.INVOICE_PROCESSING },
      { name: QUEUE_NAMES.CRM_UPDATES },
      { name: QUEUE_NAMES.MARKETPLACE_SYNC },
      { name: QUEUE_NAMES.INTEGRATION_LOG }
    ),
  ],
  providers: [WarehouseProcessor, QueueService],
  exports: [BullModule, QueueService],
})
export class QueuesModule {}
