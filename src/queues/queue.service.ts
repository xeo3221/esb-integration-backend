import { Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { QUEUE_NAMES } from "./queue.constants";
import { WarehouseSyncJobData } from "./processors/warehouse.processor";
import { isRedisConfigured } from "../config/redis.config";

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  private redisAvailable = false;

  constructor(
    @InjectQueue(QUEUE_NAMES.WAREHOUSE_SYNC)
    private warehouseQueue: Queue,

    @InjectQueue(QUEUE_NAMES.INVOICE_PROCESSING)
    private invoiceQueue: Queue,

    @InjectQueue(QUEUE_NAMES.CRM_UPDATES)
    private crmQueue: Queue,

    @InjectQueue(QUEUE_NAMES.MARKETPLACE_SYNC)
    private marketplaceQueue: Queue,

    @InjectQueue(QUEUE_NAMES.INTEGRATION_LOG)
    private integrationLogQueue: Queue
  ) {
    this.checkRedisConnection();
  }

  private async checkRedisConnection() {
    if (!isRedisConfigured()) {
      this.logger.warn(
        "Redis not configured. Queue operations will be logged only."
      );
      this.logger.warn("To enable queues, add REDIS_HOST to your .env file");
      return;
    }

    try {
      // Sprawdzenie połączenia z Redis
      await this.warehouseQueue.client.ping();
      this.redisAvailable = true;
      this.logger.log("Redis connection established successfully");
    } catch (error) {
      this.logger.warn(
        "Redis connection failed. Queue operations will be logged only."
      );
      this.logger.warn("Error: " + error.message);
    }
  }

  // Metody dla kolejki magazynu
  async addWarehouseSync(data: WarehouseSyncJobData) {
    this.logger.log(`Adding warehouse sync job for product: ${data.productId}`);

    if (!this.redisAvailable) {
      this.logger.warn("Redis unavailable - job logged only (demo mode)");
      return { id: "demo-" + Date.now(), demo: true };
    }

    try {
      return await this.warehouseQueue.add(data.action, data, {
        priority: data.action === "stock_alert" ? 10 : 5, // alert ma wyższy priorytet
        delay: 0,
      });
    } catch (error) {
      this.logger.error("Failed to add warehouse sync job:", error.message);
      return { id: "failed-" + Date.now(), error: true };
    }
  }

  // Metody dla kolejki fakturowania
  async addInvoiceProcessing(invoiceData: any) {
    this.logger.log(`Adding invoice processing job`);

    if (!this.redisAvailable) {
      this.logger.warn("Redis unavailable - job logged only (demo mode)");
      return { id: "demo-" + Date.now(), demo: true };
    }

    try {
      return await this.invoiceQueue.add("process_invoice", invoiceData, {
        priority: 8, // faktury mają wysoki priorytet
      });
    } catch (error) {
      this.logger.error("Failed to add invoice processing job:", error.message);
      return { id: "failed-" + Date.now(), error: true };
    }
  }

  // Metody dla kolejki CRM
  async addCrmUpdate(crmData: any) {
    this.logger.log(`Adding CRM update job`);

    if (!this.redisAvailable) {
      this.logger.warn("Redis unavailable - job logged only (demo mode)");
      return { id: "demo-" + Date.now(), demo: true };
    }

    try {
      return await this.crmQueue.add("update_customer", crmData, {
        priority: 3, // CRM ma niższy priorytet
      });
    } catch (error) {
      this.logger.error("Failed to add CRM update job:", error.message);
      return { id: "failed-" + Date.now(), error: true };
    }
  }

  // Metody dla kolejki marketplace
  async addMarketplaceSync(marketplaceData: any) {
    this.logger.log(`Adding marketplace sync job`);

    if (!this.redisAvailable) {
      this.logger.warn("Redis unavailable - job logged only (demo mode)");
      return { id: "demo-" + Date.now(), demo: true };
    }

    try {
      return await this.marketplaceQueue.add("sync_product", marketplaceData, {
        priority: 7, // marketplace ma wysoki priorytet
      });
    } catch (error) {
      this.logger.error("Failed to add marketplace sync job:", error.message);
      return { id: "failed-" + Date.now(), error: true };
    }
  }

  // Logowanie operacji ESB
  async logIntegrationOperation(logData: any) {
    this.logger.log(`Logging integration operation`);

    if (!this.redisAvailable) {
      this.logger.warn("Redis unavailable - operation logged only (demo mode)");
      return { id: "demo-" + Date.now(), demo: true };
    }

    try {
      return await this.integrationLogQueue.add("log_operation", logData, {
        priority: 1, // logowanie ma najniższy priorytet
      });
    } catch (error) {
      this.logger.error("Failed to log integration operation:", error.message);
      return { id: "failed-" + Date.now(), error: true };
    }
  }

  // Metody monitoringu
  async getQueueStats() {
    if (!this.redisAvailable) {
      return {
        redis: { status: "unavailable", configured: isRedisConfigured() },
        warehouse: { status: "demo-mode" },
        invoice: { status: "demo-mode" },
        crm: { status: "demo-mode" },
        marketplace: { status: "demo-mode" },
        integrationLog: { status: "demo-mode" },
      };
    }

    try {
      const stats = {
        redis: { status: "connected" },
        warehouse: await this.getQueueInfo(this.warehouseQueue),
        invoice: await this.getQueueInfo(this.invoiceQueue),
        crm: await this.getQueueInfo(this.crmQueue),
        marketplace: await this.getQueueInfo(this.marketplaceQueue),
        integrationLog: await this.getQueueInfo(this.integrationLogQueue),
      };
      return stats;
    } catch (error) {
      this.logger.error("Failed to get queue stats:", error.message);
      return { redis: { status: "error", message: error.message } };
    }
  }

  private async getQueueInfo(queue: Queue) {
    return {
      waiting: await queue.getWaiting().then((jobs) => jobs.length),
      active: await queue.getActive().then((jobs) => jobs.length),
      completed: await queue.getCompleted().then((jobs) => jobs.length),
      failed: await queue.getFailed().then((jobs) => jobs.length),
    };
  }
}

/**
 * W pełnej implementacji:
 * - Batch operations dla wielu zadań jednocześnie
 * - Scheduler dla zadań cyklicznych
 * - Retry strategies per queue type
 * - Dead letter queue handling
 * - Custom job prioritization algorithms
 */
