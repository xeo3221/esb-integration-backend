/*
 * ORDERS MODULE - Moduł przetwarzania zamówień i synchronizacji magazynu
 *
 * Problem: Zamówienia i synchronizacja magazynu to główne przepływy ESB
 * Rozwiązanie: Moduł zawiera wszystkie services i controllers dla business logic
 *
 * Zawiera:
 * - OrderProcessingService - przepływ zamówień
 * - InventorySyncService - synchronizacja magazynu
 * - OrdersController - API zamówień
 * - InventoryController - API synchronizacji
 *
 * W pełnej implementacji: validation, caching, monitoring
 */

import { Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { InventoryController } from "./inventory.controller";
import { OrderProcessingService } from "./order-processing.service";
import { InventorySyncService } from "./inventory-sync.service";
import { QueuesModule } from "../queues/queues.module";

@Module({
  imports: [QueuesModule],
  controllers: [OrdersController, InventoryController],
  providers: [OrderProcessingService, InventorySyncService],
  exports: [OrderProcessingService, InventorySyncService],
})
export class OrdersModule {}
