/*
 * CONTROLLER ZAMÓWIEŃ ESB - DEMO
 *
 * Problem: ESB potrzebuje endpoints do przyjmowania zamówień i śledzenia statusu.
 * Rozwiązanie: REST API do order processing flow.
 *
 * Demo endpoints:
 * - POST /orders - przyjęcie nowego zamówienia
 * - GET /orders/:id - status zamówienia
 * - GET /orders - wszystkie zamówienia (dev purpose)
 *
 * W pełnej implementacji: webhook callbacks, real-time status updates, security
 */

import { Controller, Post, Get, Body, Param } from "@nestjs/common";
import { OrderProcessingService } from "./order-processing.service";
import {
  OrderRequest,
  OrderResponse,
  OrderDetailResponse,
} from "./order.interfaces";

@Controller("orders")
export class OrdersController {
  constructor(
    private readonly orderProcessingService: OrderProcessingService
  ) {}

  @Post()
  async createOrder(
    @Body() orderRequest: OrderRequest
  ): Promise<OrderResponse> {
    return this.orderProcessingService.processOrder(orderRequest);
  }

  @Get(":orderId")
  getOrderDetails(
    @Param("orderId") orderId: string
  ): OrderDetailResponse | undefined {
    return this.orderProcessingService.getOrderDetails(orderId);
  }

  @Get()
  getAllOrders(): OrderResponse[] {
    return this.orderProcessingService.getAllOrders();
  }

  // Demo endpoint - przykładowe zamówienie
  @Post("demo")
  async createDemoOrder(): Promise<OrderResponse> {
    const demoOrder: OrderRequest = {
      customerId: "demo-customer-123",
      customerInfo: {
        id: "demo-customer-123",
        email: "demo@example.com",
        name: "Jan Kowalski",
        address: "ul. Testowa 123, Warszawa",
      },
      items: [
        {
          productId: "prod-123",
          productName: "Laptop Dell XPS",
          quantity: 1,
          price: 4999.99,
        },
        {
          productId: "prod-456",
          productName: "Mysz bezprzewodowa",
          quantity: 2,
          price: 129.99,
        },
      ],
      totalAmount: 5259.97,
    };

    return this.orderProcessingService.processOrder(demoOrder);
  }
}
