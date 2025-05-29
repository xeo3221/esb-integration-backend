/*
 * MODUŁ ZAMÓWIEŃ ESB - DEMO
 *
 * Problem: Order processing flow potrzebuje swojego modułu z serwisami i controllerami.
 * Rozwiązanie: OrdersModule grupuje wszystkie komponenty order processing.
 *
 * Komponenty:
 * - OrdersController - REST endpoints
 * - OrderProcessingService - orchestrator flow
 * - Importuje QueuesModule do wysyłania zadań
 *
 * W pełnej implementacji: walidacja DTOs, repositories, event handlers
 */

import { Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { OrderProcessingService } from "./order-processing.service";
import { QueuesModule } from "../queues/queues.module";

@Module({
  imports: [QueuesModule],
  controllers: [OrdersController],
  providers: [OrderProcessingService],
  exports: [OrderProcessingService],
})
export class OrdersModule {}
