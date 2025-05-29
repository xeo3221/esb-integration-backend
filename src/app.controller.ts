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
    return this.adaptersTestService.testAllSystems();
  }

  @Get("/adapters/info")
  async getAdaptersInfo() {
    return this.adaptersTestService.getSystemsInfo();
  }

  @Get("/adapters/test-operations")
  async testAdapterOperations() {
    return this.adaptersTestService.testAdapterOperations();
  }
}
