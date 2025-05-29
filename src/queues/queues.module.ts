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

/**
 * W pełnej implementacji:
 * - Dead letter queues dla nieudanych zadań
 * - Priorytetyzacja zadań
 * - Rate limiting dla zewnętrznych API
 * - Monitoring i metryki kolejek
 * - Graceful shutdown obsługa
 */
