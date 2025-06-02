/*
 * MESSAGE ROUTER - Centralne zarządzanie kolejkami ESB
 *
 * Problem: ESB ma wiele kolejek (warehouse, invoice, CRM, marketplace)
 * i potrzebuje niezawodnego routingu wiadomości między systemami.
 *
 * Rozwiązanie: Centralny Message Router oparty na BullMQ + Redis
 * z asynchroniczną orkiestracją i retry logic.
 *
 * Kolejki ESB (jak w docs.md):
 * - warehouse.sync - synchronizacja zapasów
 * - invoice.processing - generowanie faktur
 * - crm.updates - aktualizacje profili klientów
 * - marketplace.sync - synchronizacja statusów zamówień
 * - integration.log - audit trail wszystkich operacji
 *
 * W pełnej implementacji:
 * - Redis Cluster z high availability
 * - Priority queues dla urgent transactions
 * - Dead letter queues dla failed messages
 * - Rate limiting per adapter
 * - Circuit breaker protection
 * - Prometheus metrics i monitoring
 * - Graceful shutdown i data persistence
 *
 * Demo mode: zadania są logowane ale nie ma prawdziwych workerów
 * (Redis opcjonalny - fallback do in-memory)
 */

import { Injectable, Logger } from "@nestjs/common";
import { QUEUE_NAMES } from "./queue.constants";
import { isRedisConfigured } from "../config/redis.config";

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  private redisAvailable = false;

  constructor() {
    this.checkRedisConnection();
  }

  private async checkRedisConnection() {
    if (!isRedisConfigured()) {
      this.logger.warn("Redis brak - kolejki w trybie demo (tylko logi)");
      this.redisAvailable = false;
      return;
    }

    // W demo mode nie próbujemy połączyć się z Redis
    this.logger.warn("DEMO MODE: Kolejki działają w trybie symulacji");
    this.redisAvailable = false;
  }

  // Uniwersalna metoda dodawania zadań - DEMO MODE
  async addJob(queueName: string, jobData: any, options: any = {}) {
    this.logger.log(`📋 DEMO: Dodaję zadanie do kolejki ${queueName}`);
    this.logger.log(
      `📋 DEMO: Dane zadania - ${JSON.stringify(jobData, null, 2)}`
    );

    // W trybie demo zawsze zwracamy fake job
    const demoJob = {
      id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      demo: true,
      queueName,
      data: jobData,
      createdAt: new Date(),
      status: "completed",
    };

    this.logger.log(
      `✅ DEMO: Zadanie ${demoJob.id} "przetworzone" natychmiast`
    );
    return demoJob;
  }

  // Metody dla konkretnych kolejek
  async addWarehouseSync(jobData: any) {
    return this.addJob(QUEUE_NAMES.WAREHOUSE_SYNC, jobData);
  }

  async addInvoiceSync(jobData: any) {
    return this.addJob(QUEUE_NAMES.INVOICE_PROCESSING, jobData);
  }

  async addCrmSync(jobData: any) {
    return this.addJob(QUEUE_NAMES.CRM_UPDATES, jobData);
  }

  async addMarketplaceSync(jobData: any) {
    return this.addJob(QUEUE_NAMES.MARKETPLACE_SYNC, jobData);
  }

  async logIntegrationOperation(data: any) {
    return this.addJob(QUEUE_NAMES.INTEGRATION_LOG, data);
  }

  // Statystyki wszystkich kolejek - DEMO MODE
  async getQueueStats() {
    return {
      redis: { status: "demo-mode", configured: isRedisConfigured() },
      queues: {
        [QUEUE_NAMES.WAREHOUSE_SYNC]: {
          waiting: 0,
          active: 0,
          completed: 5,
          failed: 0,
        },
        [QUEUE_NAMES.INVOICE_PROCESSING]: {
          waiting: 0,
          active: 0,
          completed: 3,
          failed: 0,
        },
        [QUEUE_NAMES.CRM_UPDATES]: {
          waiting: 0,
          active: 0,
          completed: 2,
          failed: 0,
        },
        [QUEUE_NAMES.MARKETPLACE_SYNC]: {
          waiting: 0,
          active: 0,
          completed: 1,
          failed: 0,
        },
        [QUEUE_NAMES.INTEGRATION_LOG]: {
          waiting: 0,
          active: 0,
          completed: 10,
          failed: 0,
        },
      },
      note: "Demo mode - wszystkie zadania są symulowane",
    };
  }
}
