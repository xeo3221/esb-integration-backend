/*
 * SERWIS PRZETWARZANIA ZAMÓWIEŃ ESB - DEMO
 *
 * Problem: Zamówienie musi przejść przez wszystkie systemy: magazyn → faktury → CRM → marketplace.
 * Rozwiązanie: Orchestrator zarządza całym flow przez kolejki ESB.
 *
 * Demo flow:
 * 1. Przyjęcie zamówienia → zapis do "bazy" (pamięć)
 * 2. Kolejka inventory → sprawdź/zarezerwuj produkty
 * 3. Kolejka invoice → wygeneruj fakturę
 * 4. Kolejka CRM → dodaj klienta + wyślij email
 * 5. Kolejka marketplace → aktualizuj status zamówienia
 *
 * W pełnej implementacji: saga pattern, compensation, distributed transactions
 */

import { Injectable, Logger } from "@nestjs/common";
import { QueueService } from "../queues/queue.service";
import {
  OrderRequest,
  OrderResponse,
  OrderStep,
  OrderProcessingData,
  OrderDetailResponse,
} from "./order.interfaces";

@Injectable()
export class OrderProcessingService {
  private readonly logger = new Logger(OrderProcessingService.name);
  private readonly orders = new Map<string, OrderResponse>(); // Demo "baza danych"
  private readonly orderDetails = new Map<string, OrderRequest>(); // Szczegóły zamówień

  constructor(private readonly queueService: QueueService) {}

  async processOrder(orderRequest: OrderRequest): Promise<OrderResponse> {
    const orderId = `order-${Date.now()}`;

    this.logger.log(
      `📦 DEMO: Nowe zamówienie ${orderId} od ${orderRequest.customerInfo.email}`
    );

    const orderResponse: OrderResponse = {
      orderId,
      status: "received",
      createdAt: new Date().toISOString(),
      steps: [
        { step: "inventory", status: "pending" },
        { step: "invoice", status: "pending" },
        { step: "crm", status: "pending" },
        { step: "marketplace", status: "pending" },
      ],
    };

    this.orders.set(orderId, orderResponse);
    this.orderDetails.set(orderId, orderRequest); // Zapisz szczegóły osobno
    await this.startInventoryStep(orderId, orderRequest);
    orderResponse.status = "processing";
    return orderResponse;
  }

  private async startInventoryStep(orderId: string, order: OrderRequest) {
    const jobData: OrderProcessingData = {
      orderId,
      order,
      currentStep: "inventory",
    };

    this.logger.log(`🏭 DEMO: Kolejka inventory dla zamówienia ${orderId}`);

    const job = await this.queueService.addWarehouseSync({
      productId: order.items[0]?.productId || "demo-product",
      action: "stock_update",
      data: jobData,
    });

    // Zaktualizuj step status
    this.updateOrderStep(orderId, "inventory", "queued", job.id?.toString());
  }

  async processInventoryComplete(orderId: string, success: boolean) {
    this.logger.log(
      `✅ DEMO: Inventory complete dla ${orderId}, success: ${success}`
    );

    if (success) {
      this.updateOrderStep(orderId, "inventory", "completed");
      await this.startInvoiceStep(orderId);
    } else {
      this.updateOrderStep(
        orderId,
        "inventory",
        "failed",
        undefined,
        "Brak produktu w magazynie"
      );
      this.updateOrderStatus(orderId, "failed");
    }
  }

  private async startInvoiceStep(orderId: string) {
    const order = this.orders.get(orderId);
    if (!order) return;

    this.logger.log(`💰 DEMO: Kolejka invoice dla zamówienia ${orderId}`);

    const job = await this.queueService.addInvoiceProcessing({
      orderId,
      amount: order.steps[0] ? 100 : 0, // demo amount
      currentStep: "invoice",
    });

    this.updateOrderStep(orderId, "invoice", "queued", job.id?.toString());
  }

  async processInvoiceComplete(orderId: string, success: boolean) {
    this.logger.log(
      `✅ DEMO: Invoice complete dla ${orderId}, success: ${success}`
    );

    if (success) {
      this.updateOrderStep(orderId, "invoice", "completed");
      await this.startCrmStep(orderId);
    } else {
      this.updateOrderStep(
        orderId,
        "invoice",
        "failed",
        undefined,
        "Błąd generowania faktury"
      );
    }
  }

  private async startCrmStep(orderId: string) {
    this.logger.log(`👥 DEMO: Kolejka CRM dla zamówienia ${orderId}`);

    const job = await this.queueService.addCrmUpdate({
      orderId,
      action: "new_customer",
      currentStep: "crm",
    });

    this.updateOrderStep(orderId, "crm", "queued", job.id?.toString());
  }

  async processCrmComplete(orderId: string, success: boolean) {
    this.logger.log(
      `✅ DEMO: CRM complete dla ${orderId}, success: ${success}`
    );

    if (success) {
      this.updateOrderStep(orderId, "crm", "completed");
      await this.startMarketplaceStep(orderId);
    } else {
      this.updateOrderStep(
        orderId,
        "crm",
        "failed",
        undefined,
        "Błąd aktualizacji CRM"
      );
    }
  }

  private async startMarketplaceStep(orderId: string) {
    this.logger.log(`🛒 DEMO: Kolejka marketplace dla zamówienia ${orderId}`);

    const job = await this.queueService.addMarketplaceSync({
      orderId,
      action: "update_order_status",
      currentStep: "marketplace",
    });

    this.updateOrderStep(orderId, "marketplace", "queued", job.id?.toString());
  }

  async processMarketplaceComplete(orderId: string, success: boolean) {
    this.logger.log(
      `✅ DEMO: Marketplace complete dla ${orderId}, success: ${success}`
    );

    if (success) {
      this.updateOrderStep(orderId, "marketplace", "completed");
      this.updateOrderStatus(orderId, "completed");
      this.logger.log(`🎉 DEMO: Zamówienie ${orderId} w pełni przetworzone!`);
    } else {
      this.updateOrderStep(
        orderId,
        "marketplace",
        "failed",
        undefined,
        "Błąd aktualizacji marketplace"
      );
    }
  }

  // Helper methods
  private updateOrderStep(
    orderId: string,
    step: OrderStep["step"],
    status: OrderStep["status"],
    jobId?: string,
    error?: string
  ) {
    const order = this.orders.get(orderId);
    if (!order) return;

    const stepIndex = order.steps.findIndex((s) => s.step === step);
    if (stepIndex >= 0) {
      order.steps[stepIndex].status = status;
      if (jobId) order.steps[stepIndex].jobId = jobId;
      if (error) order.steps[stepIndex].error = error;
      if (status === "completed")
        order.steps[stepIndex].completedAt = new Date().toISOString();
    }
  }

  private updateOrderStatus(orderId: string, status: OrderResponse["status"]) {
    const order = this.orders.get(orderId);
    if (order) {
      order.status = status;
    }
  }

  getOrderStatus(orderId: string): OrderResponse | undefined {
    return this.orders.get(orderId);
  }

  getOrderDetails(orderId: string): OrderDetailResponse | undefined {
    const order = this.orders.get(orderId);
    const details = this.orderDetails.get(orderId);

    if (!order || !details) return undefined;

    return {
      ...order,
      customerInfo: details.customerInfo,
      items: details.items,
      totalAmount: details.totalAmount,
    };
  }

  getAllOrders(): OrderResponse[] {
    return Array.from(this.orders.values());
  }
}
