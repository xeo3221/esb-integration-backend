/*
 * GŁÓWNY CONTROLLER ESB API
 *
 * Problem do rozwiązania:
 * ESB potrzebuje API endpoints do monitoringu i zarządzania.
 * DevOps, testerzy i inne systemy muszą sprawdzać stan ESB.
 *
 * Jak to rozwiązujemy:
 * Controller udostępnia REST endpoints dla:
 * - Health checks (aplikacja, baza, adaptery)
 * - Monitoring kolejek i ich statusu
 * - Testowanie poszczególnych adapterów
 * - Ręczne uruchamianie zadań (dla debugowania)
 *
 * Dlaczego REST API:
 * - Uniwersalny dostęp (curl, Postman, inne systemy)
 * - Łatwe testowanie i monitoring
 * - Integration z systemami monitorującymi
 * - Dokumentacja w jednym miejscu
 *
 * W pełnej implementacji:
 * - Swagger/OpenAPI documentation
 * - Rate limiting dla endpointów
 * - Authentication/Authorization (JWT)
 * - Request/response validation
 * - Audit logging dla wszystkich operacji
 */

import { Controller, Get, Post, Body } from "@nestjs/common";
import { AppService } from "./app.service";
import { QueueService } from "./queues/queue.service";
import { AdaptersTestService } from "./adapters/adapters-test.service";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly queueService: QueueService,
    private readonly adaptersTestService: AdaptersTestService
  ) {}

  @Get()
  getInfo(): string {
    return this.appService.getInfo();
  }

  @Get("/health")
  getHealth(): object {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "ESB Integration API",
    };
  }

  @Get("/health/database")
  async getDatabaseHealth(): Promise<object> {
    const dbStatus = await this.appService.testDatabaseConnection();
    return {
      database: dbStatus,
      service: "ESB Integration API",
    };
  }

  @Get("/queues/stats")
  async getQueueStats() {
    return this.queueService.getQueueStats();
  }

  @Post("/test/warehouse-sync")
  async testWarehouseSync(@Body() data: { productId: string }) {
    const jobData = {
      productId: data.productId,
      action: "stock_update" as const,
      data: { quantity: 10 },
    };

    const job = await this.queueService.addWarehouseSync(jobData);
    return { success: true, jobId: job.id };
  }

  // Endpointy testowania adapterów
  @Get("/adapters/health")
  async getAdaptersHealth() {
    return this.adaptersTestService.checkAllSystemsHealth();
  }

  @Get("/adapters/info")
  async getAdaptersInfo() {
    return this.adaptersTestService.getAllSystemsInfo();
  }

  @Get("/adapters/test-operations")
  async testAdapterOperations() {
    return this.adaptersTestService.testAdapterOperations();
  }
}
