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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from "@nestjs/swagger";
import { OrderProcessingService } from "./order-processing.service";
import {
  OrderRequest,
  OrderResponse,
  OrderDetailResponse,
} from "./order.interfaces";

@ApiTags("orders")
@Controller("orders")
export class OrdersController {
  constructor(
    private readonly orderProcessingService: OrderProcessingService
  ) {}

  @Post()
  @ApiOperation({
    summary: "Utwórz nowe zamówienie",
    description:
      "Rozpoczyna przetwarzanie zamówienia przez wszystkie systemy ESB: magazyn → faktury → CRM → marketplace",
  })
  @ApiResponse({
    status: 200,
    description: "Zamówienie utworzone i przekazane do przetwarzania",
  })
  @ApiBody({
    description: "Dane zamówienia z informacjami o kliencie i produktach",
  })
  async createOrder(
    @Body() orderRequest: OrderRequest
  ): Promise<OrderResponse> {
    return this.orderProcessingService.processOrder(orderRequest);
  }

  @Get(":orderId")
  @ApiOperation({
    summary: "Pobierz szczegóły zamówienia",
    description:
      "Zwraca pełne informacje o zamówieniu wraz z produktami, klientem i statusem każdego kroku ESB",
  })
  @ApiParam({
    name: "orderId",
    description: "Unikalny identyfikator zamówienia",
    example: "order-1234567890",
  })
  @ApiResponse({
    status: 200,
    description: "Szczegółowe informacje o zamówieniu",
  })
  getOrderDetails(
    @Param("orderId") orderId: string
  ): OrderDetailResponse | undefined {
    return this.orderProcessingService.getOrderDetails(orderId);
  }

  @Get()
  @ApiOperation({
    summary: "Lista wszystkich zamówień",
    description:
      "Zwraca listę wszystkich zamówień w systemie (dla development/debugging)",
  })
  @ApiResponse({
    status: 200,
    description: "Lista zamówień z podstawowymi informacjami",
  })
  getAllOrders(): OrderResponse[] {
    return this.orderProcessingService.getAllOrders();
  }

  // Demo endpoint - przykładowe zamówienie
  @Post("demo")
  @ApiOperation({
    summary: "Utwórz demo zamówienie",
    description:
      "Tworzy przykładowe zamówienie (Laptop + Mysz) do testowania przepływu ESB",
  })
  @ApiResponse({
    status: 200,
    description: "Demo zamówienie utworzone",
  })
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
