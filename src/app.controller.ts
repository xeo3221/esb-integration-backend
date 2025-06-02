/*
 * API GATEWAY ESB - Security & Monitoring
 *
 * Problem do rozwiązania:
 * ESB potrzebuje centralnego punktu dostępu z bezpieczeństwem i monitoringiem.
 * DevOps, testerzy i inne systemy muszą sprawdzać stan ESB.
 *
 * Jak to rozwiązujemy:
 * Controller implementuje wzorzec API Gateway z centralnymi endpoints dla:
 * - Health checks (aplikacja, baza, adaptery, kolejki)
 * - Monitoring wszystkich komponentów ESB
 * - Testowanie poszczególnych adapterów
 * - Ręczne zarządzanie kolejkami (dla debugowania)
 *
 * W pełnej implementacji (jak w docs.md):
 * - Kong/Nginx jako reverse proxy z load balancing
 * - OAuth2 + JWT authentication dla wszystkich endpoints
 * - Rate limiting per client/endpoint
 * - Request/response validation z OpenAPI
 * - Correlation ID tracking przez wszystkie requesty
 * - Audit logging dla wszystkich operacji administracyjnych
 * - Circuit breaker protection dla external calls
 * - Prometheus metrics export
 *
 * Dlaczego API Gateway:
 * - Centralny punkt bezpieczeństwa dla całego ESB
 * - Uniwersalny dostęp (curl, Postman, inne systemy)
 * - Łatwe testowanie i monitoring
 * - Integration z systemami monitorującymi (Grafana)
 * - Dokumentacja OpenAPI w jednym miejscu
 */

import { Controller, Get, Post, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AppService } from "./app.service";
import { QueueService } from "./queues/queue.service";
import { AdaptersTestService } from "./adapters/adapters-test.service";

@ApiTags("health")
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly queueService: QueueService,
    private readonly adaptersTestService: AdaptersTestService
  ) {}

  @Get()
  @ApiOperation({ summary: "Informacje o API ESB" })
  @ApiResponse({
    status: 200,
    description: "Podstawowe informacje o aplikacji ESB",
  })
  getInfo(): string {
    return this.appService.getInfo();
  }

  @Get("/health")
  @ApiOperation({ summary: "Health check aplikacji" })
  @ApiResponse({ status: 200, description: "Status zdrowia aplikacji ESB" })
  getHealth(): object {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "ESB Integration API",
    };
  }

  @Get("/health/database")
  @ApiOperation({ summary: "Health check bazy danych" })
  @ApiResponse({
    status: 200,
    description: "Status połączenia z PostgreSQL (Neon)",
  })
  async getDatabaseHealth(): Promise<object> {
    const dbStatus = await this.appService.testDatabaseConnection();
    return {
      database: dbStatus,
      service: "ESB Integration API",
    };
  }

  @Get("/queues/stats")
  @ApiTags("queues")
  @ApiOperation({ summary: "Statystyki kolejek ESB" })
  @ApiResponse({
    status: 200,
    description: "Status wszystkich kolejek BullMQ/Redis",
  })
  async getQueueStats() {
    return this.queueService.getQueueStats();
  }

  @Post("/test/warehouse-sync")
  @ApiTags("queues")
  @ApiOperation({ summary: "Test kolejki magazynu" })
  @ApiResponse({
    status: 200,
    description: "Dodano zadanie do kolejki warehouse-sync",
  })
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
  @ApiTags("adapters")
  @ApiOperation({ summary: "Health check wszystkich adapterów" })
  @ApiResponse({
    status: 200,
    description: "Status połączeń z systemami zewnętrznymi",
  })
  async getAdaptersHealth() {
    return this.adaptersTestService.checkAllSystemsHealth();
  }

  @Get("/adapters/info")
  @ApiTags("adapters")
  @ApiOperation({ summary: "Informacje o systemach zewnętrznych" })
  @ApiResponse({
    status: 200,
    description: "Szczegóły konfiguracji wszystkich adapterów",
  })
  async getAdaptersInfo() {
    return this.adaptersTestService.getAllSystemsInfo();
  }

  @Get("/adapters/test-operations")
  @ApiTags("adapters")
  @ApiOperation({ summary: "Test operacji wszystkich adapterów" })
  @ApiResponse({
    status: 200,
    description: "Wykonanie testowych operacji na każdym adapterze",
  })
  async testAdapterOperations() {
    return this.adaptersTestService.testAdapterOperations();
  }
}
