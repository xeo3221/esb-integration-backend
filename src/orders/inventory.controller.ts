/*
 * INVENTORY CONTROLLER - API dla synchronizacji magazynu
 *
 * Problem: Potrzebne są endpointy do zarządzania synchronizacją magazynu
 * Rozwiązanie: REST API do uruchamiania i monitorowania sync procesów
 *
 * Endpointy:
 * - POST /inventory/sync - uruchom synchronizację
 * - GET /inventory/sync/:id - status synchronizacji
 * - GET /inventory/sync - lista aktywnych synchronizacji
 * - POST /inventory/sync/demo - demo synchronizacja
 */

import { Controller, Post, Get, Body, Param } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from "@nestjs/swagger";
import {
  InventorySyncService,
  InventorySyncRequest,
  InventorySyncResponse,
} from "./inventory-sync.service";

@ApiTags("inventory")
@Controller("inventory")
export class InventoryController {
  constructor(private readonly inventorySyncService: InventorySyncService) {}

  @Post("sync")
  @ApiOperation({
    summary: "Uruchom synchronizację magazynu",
    description:
      "Rozpoczyna synchronizację stanów magazynowych przez wszystkie systemy ESB: magazyn → CRM → marketplace",
  })
  @ApiResponse({
    status: 200,
    description: "Synchronizacja rozpoczęta",
  })
  @ApiBody({
    description: "Parametry synchronizacji magazynu",
  })
  async startSync(
    @Body() request: InventorySyncRequest
  ): Promise<InventorySyncResponse> {
    return this.inventorySyncService.startInventorySync(request);
  }

  @Get("sync/:syncId")
  @ApiOperation({
    summary: "Status synchronizacji",
    description: "Zwraca aktualny status procesu synchronizacji magazynu",
  })
  @ApiParam({
    name: "syncId",
    description: "Identyfikator synchronizacji",
    example: "sync-1234567890",
  })
  @ApiResponse({
    status: 200,
    description: "Status synchronizacji",
  })
  getSyncStatus(
    @Param("syncId") syncId: string
  ): InventorySyncResponse | undefined {
    return this.inventorySyncService.getSyncStatus(syncId);
  }

  @Get("sync")
  @ApiOperation({
    summary: "Lista aktywnych synchronizacji",
    description: "Zwraca wszystkie aktywne procesy synchronizacji magazynu",
  })
  @ApiResponse({
    status: 200,
    description: "Lista synchronizacji",
  })
  getAllSyncs(): InventorySyncResponse[] {
    return this.inventorySyncService.getAllActiveSyncs();
  }

  @Post("sync/demo")
  @ApiOperation({
    summary: "Demo synchronizacja",
    description:
      "Uruchamia przykładową synchronizację magazynu (incremental, 10 produktów)",
  })
  @ApiResponse({
    status: 200,
    description: "Demo synchronizacja rozpoczęta",
  })
  async startDemoSync(): Promise<InventorySyncResponse> {
    const demoRequest: InventorySyncRequest = {
      syncType: "incremental",
      productIds: ["prod-123", "prod-456", "prod-789"],
      forceUpdate: false,
    };

    return this.inventorySyncService.startInventorySync(demoRequest);
  }
}
