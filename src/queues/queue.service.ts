/*
 * SERWIS KOLEJEK ESB
 *
 * Problem do rozwiązania:
 * ESB musi przetwarzać operacje asynchronicznie - nie można blokować API.
 * Operacje jak "wyślij fakturę" czy "zaktualizuj magazyn" mogą trwać długo.
 *
 * Jak to rozwiązujemy:
 * Kolejki Redis (BullMQ) przetwarzają zadania w tle.
 * API dodaje zadanie → kolejka przetwarza → wynik w bazie.
 *
 * Dlaczego kolejki:
 * - API odpowiada natychmiast (nie czeka 30 sekund na faktury)
 * - Retry automatyczny przy błędach
 * - Priorytetyzacja (faktury ważniejsze niż logi)
 * - Skalowanie - można dodać więcej workerów
 *
 * W pełnej implementacji:
 * - Batch operations dla wielu zadań jednocześnie
 * - Scheduler dla zadań cyklicznych
 * - Retry strategies per queue type
 * - Dead letter queue handling
 * - Custom job prioritization algorithms
 */

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
    @InjectQueue(QUEUE_NAMES.WAREHOUSE_SYNC) private warehouseQueue: Queue,
    @InjectQueue(QUEUE_NAMES.INVOICE_PROCESSING) private invoiceQueue: Queue,
    @InjectQueue(QUEUE_NAMES.CRM_UPDATES) private crmQueue: Queue,
    @InjectQueue(QUEUE_NAMES.MARKETPLACE_SYNC) private marketplaceQueue: Queue,
    @InjectQueue(QUEUE_NAMES.INTEGRATION_LOG) private integrationLogQueue: Queue
  ) {
    this.checkRedisConnection();
  }

  private async checkRedisConnection() {
    if (!isRedisConfigured()) {
      this.logger.warn("Redis brak - kolejki w trybie demo (tylko logi)");
      return;
    }

    try {
      await this.warehouseQueue.client.ping();
      this.redisAvailable = true;
      this.logger.log("Redis połączony - kolejki działają");
    } catch (error) {
      this.logger.warn("Redis nie działa - tryb demo (tylko logi)");
    }
  }

  // Ogólna metoda do dodawania zadań - unika powtarzania kodu
  private async addJob(
    queue: Queue,
    jobType: string,
    data: any,
    priority: number = 5
  ) {
    this.logger.log(`Dodaję zadanie: ${jobType}`);

    if (!this.redisAvailable) {
      this.logger.warn("Redis brak - zadanie tylko zalogowane (demo)");
      return { id: "demo-" + Date.now(), demo: true };
    }

    try {
      return await queue.add(jobType, data, { priority });
    } catch (error) {
      this.logger.error(`Błąd dodawania zadania ${jobType}: ${error.message}`);
      return { id: "failed-" + Date.now(), error: true };
    }
  }

  // GŁÓWNE FUNKCJE: Dodawanie zadań do kolejek
  async addWarehouseSync(data: WarehouseSyncJobData) {
    const priority = data.action === "stock_alert" ? 10 : 7; // alerty mają wyższy priorytet
    return this.addJob(this.warehouseQueue, data.action, data, priority);
  }

  async addInvoiceProcessing(data: any) {
    return this.addJob(this.invoiceQueue, "process_invoice", data, 9); // faktury wysokй priorytet
  }

  async addCrmUpdate(data: any) {
    return this.addJob(this.crmQueue, "update_customer", data, 4); // CRM niższy priorytet
  }

  async addMarketplaceSync(data: any) {
    return this.addJob(this.marketplaceQueue, "sync_product", data, 8); // marketplace wysoki priorytet
  }

  async logIntegrationOperation(data: any) {
    return this.addJob(this.integrationLogQueue, "log_operation", data, 1); // logi najniższy priorytet
  }

  // Status wszystkich kolejek
  async getQueueStats() {
    if (!this.redisAvailable) {
      return {
        redis: { status: "brak", configured: isRedisConfigured() },
        queues: { status: "tryb-demo" },
      };
    }

    try {
      return {
        redis: { status: "połączony" },
        warehouse: await this.getQueueInfo(this.warehouseQueue),
        invoice: await this.getQueueInfo(this.invoiceQueue),
        crm: await this.getQueueInfo(this.crmQueue),
        marketplace: await this.getQueueInfo(this.marketplaceQueue),
        logs: await this.getQueueInfo(this.integrationLogQueue),
      };
    } catch (error) {
      this.logger.error("Błąd pobierania statystyk kolejek:", error.message);
      return { redis: { status: "błąd", message: error.message } };
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
