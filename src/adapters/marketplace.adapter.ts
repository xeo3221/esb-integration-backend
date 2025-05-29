import { Injectable } from "@nestjs/common";
import axios, { AxiosInstance } from "axios";
import { BaseAdapter, AdapterResponse } from "./base/base.adapter";

export interface MarketplaceOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  status:
    | "pending"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  createdAt: Date;
  updatedAt: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  company?: string;
}

export interface MarketplaceProduct {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  stockQuantity: number;
  category: string;
  images: string[];
  isActive: boolean;
  lastUpdated: Date;
}

export interface UpdateProductRequest {
  price?: number;
  stockQuantity?: number;
  description?: string;
  isActive?: boolean;
}

@Injectable()
export class MarketplaceAdapter extends BaseAdapter {
  private httpClient: AxiosInstance;
  private readonly baseUrl: string;

  constructor() {
    super("Marketplace", {
      timeout: 12000, // Marketplace może być wolniejsze
      retryAttempts: 3,
    });

    this.baseUrl =
      process.env.MARKETPLACE_API_URL || "https://api.marketplace.com/v1";

    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: this.config.timeout,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          process.env.MARKETPLACE_API_TOKEN || "demo-token"
        }`,
        "User-Agent": "ESB-Integration/1.0",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.httpClient.interceptors.request.use(
      (config) => {
        this.logger.debug(
          `Marketplace API Request: ${config.method?.toUpperCase()} ${
            config.url
          }`
        );
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug(`Marketplace API Response: ${response.status}`);
        return response;
      },
      (error) => {
        if (error.response) {
          this.logger.error(
            `Marketplace API Error: ${error.response.status} ${
              error.response.data?.message || error.message
            }`
          );
        } else {
          this.logger.error(`Marketplace Network Error: ${error.message}`);
        }
        return Promise.reject(error);
      }
    );
  }

  async testConnection(): Promise<AdapterResponse<boolean>> {
    return this.executeWithRetry(async () => {
      this.logger.log("Simulating marketplace API connection test");
      await this.simulateDelay(400);

      // W rzeczywistości:
      // const response = await this.httpClient.get('/health');
      // return response.status === 200;

      return true;
    }, "Testing marketplace API connection");
  }

  async getSystemInfo(): Promise<AdapterResponse<any>> {
    return this.executeWithRetry(async () => {
      await this.simulateDelay(300);

      return {
        system: "E-commerce Platform v4.2.0",
        apiVersion: "v1",
        baseUrl: this.baseUrl,
        features: ["orders", "products", "inventory", "payments", "shipping"],
        limits: {
          requestsPerHour: 5000,
          orderProcessingTime: "2-24h",
          productLimit: 10000,
        },
        supportedCurrencies: ["PLN", "EUR", "USD"],
        status: "operational",
      };
    }, "Getting marketplace system info");
  }

  // Zarządzanie zamówieniami
  async getOrder(orderId: string): Promise<AdapterResponse<MarketplaceOrder>> {
    return this.executeWithRetry(async () => {
      await this.simulateDelay(400);

      if (orderId.startsWith("ORD-")) {
        const mockOrder: MarketplaceOrder = {
          id: orderId,
          orderNumber: `MP-${orderId.slice(4)}`,
          customerId: "CUST-001",
          status: "confirmed",
          items: [
            {
              productId: "PROD-001",
              productName: "Laptop Dell XPS 13",
              sku: "DELL-XPS13-001",
              quantity: 1,
              unitPrice: 4999.0,
              totalPrice: 4999.0,
            },
          ],
          totalAmount: 4999.0,
          currency: "PLN",
          shippingAddress: {
            street: "ul. Testowa 123",
            city: "Warszawa",
            postalCode: "00-001",
            country: "PL",
          },
          billingAddress: {
            street: "ul. Testowa 123",
            city: "Warszawa",
            postalCode: "00-001",
            country: "PL",
          },
          paymentMethod: "credit_card",
          paymentStatus: "paid",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
          updatedAt: new Date(Date.now() - 60 * 60 * 1000), // 1h ago
        };

        return mockOrder;
      }

      throw new Error(`Order ${orderId} not found`);
    }, `Getting order ${orderId}`);
  }

  async getNewOrders(
    since?: Date
  ): Promise<AdapterResponse<MarketplaceOrder[]>> {
    return this.executeWithRetry(async () => {
      await this.simulateDelay(600);

      const sinceParam = since ? `?since=${since.toISOString()}` : "";
      this.logger.log(`Getting new orders${sinceParam}`);

      // W rzeczywistości:
      // const response = await this.httpClient.get(`/orders${sinceParam}`);
      // return response.data;

      // Symulacja - zwracamy pustą listę
      return [];
    }, "Getting new orders");
  }

  async updateOrderStatus(
    orderId: string,
    status: MarketplaceOrder["status"],
    trackingNumber?: string
  ): Promise<AdapterResponse<MarketplaceOrder>> {
    return this.executeWithRetry(async () => {
      await this.simulateDelay(500);

      const updateData: any = { status };
      if (trackingNumber) updateData.trackingNumber = trackingNumber;

      this.logger.log(`Updating order ${orderId} status to ${status}`);

      // W rzeczywistości:
      // const response = await this.httpClient.patch(`/orders/${orderId}`, updateData);
      // return response.data;

      // Symulacja
      const order = await this.getOrder(orderId);
      if (order.success && order.data) {
        order.data.status = status;
        order.data.updatedAt = new Date();
        if (status === "shipped") order.data.shippedAt = new Date();
        if (status === "delivered") order.data.deliveredAt = new Date();
      }

      return order.data!;
    }, `Updating order ${orderId} status`);
  }

  // Zarządzanie produktami
  async getProduct(
    productId: string
  ): Promise<AdapterResponse<MarketplaceProduct>> {
    return this.executeWithRetry(async () => {
      await this.simulateDelay(300);

      if (productId.startsWith("PROD-")) {
        const mockProduct: MarketplaceProduct = {
          id: productId,
          sku: `SKU-${productId.slice(5)}`,
          name: "Laptop Dell XPS 13",
          description: "Powerful ultrabook with latest Intel processor",
          price: 4999.0,
          currency: "PLN",
          stockQuantity: 15,
          category: "Electronics > Laptops",
          images: [
            "https://example.com/laptop1.jpg",
            "https://example.com/laptop2.jpg",
          ],
          isActive: true,
          lastUpdated: new Date(),
        };

        return mockProduct;
      }

      throw new Error(`Product ${productId} not found`);
    }, `Getting product ${productId}`);
  }

  async updateProduct(
    productId: string,
    updates: UpdateProductRequest
  ): Promise<AdapterResponse<MarketplaceProduct>> {
    return this.executeWithRetry(async () => {
      await this.simulateDelay(700);

      this.logger.log(`Updating product ${productId}:`, updates);

      // W rzeczywistości:
      // const response = await this.httpClient.patch(`/products/${productId}`, updates);
      // return response.data;

      // Symulacja
      const product = await this.getProduct(productId);
      if (product.success && product.data) {
        const updatedProduct = { ...product.data, ...updates };
        updatedProduct.lastUpdated = new Date();
        return updatedProduct;
      }

      throw new Error(`Failed to update product ${productId}`);
    }, `Updating product ${productId}`);
  }

  // Synchronizacja stanu magazynowego
  async syncInventory(
    products: Array<{ productId: string; stockQuantity: number }>
  ): Promise<AdapterResponse<boolean>> {
    return this.executeWithRetry(async () => {
      await this.simulateDelay(1000);

      this.logger.log(`Syncing inventory for ${products.length} products`);

      // W rzeczywistości:
      // const response = await this.httpClient.post('/inventory/sync', { products });
      // return response.data.success;

      for (const product of products) {
        this.logger.debug(
          `Updated stock for ${product.productId}: ${product.stockQuantity}`
        );
      }

      return true;
    }, `Syncing inventory for ${products.length} products`);
  }

  // Synchronizacja cen
  async syncPrices(
    prices: Array<{ productId: string; price: number }>
  ): Promise<AdapterResponse<boolean>> {
    return this.executeWithRetry(async () => {
      await this.simulateDelay(800);

      this.logger.log(`Syncing prices for ${prices.length} products`);

      // W rzeczywistości:
      // const response = await this.httpClient.post('/prices/sync', { prices });
      // return response.data.success;

      for (const priceUpdate of prices) {
        this.logger.debug(
          `Updated price for ${priceUpdate.productId}: ${priceUpdate.price}`
        );
      }

      return true;
    }, `Syncing prices for ${prices.length} products`);
  }

  // Raportowanie sprzedaży
  async getSalesReport(from: Date, to: Date): Promise<AdapterResponse<any>> {
    return this.executeWithRetry(async () => {
      await this.simulateDelay(1200);

      this.logger.log(
        `Getting sales report from ${from.toISOString()} to ${to.toISOString()}`
      );

      // W rzeczywistości:
      // const response = await this.httpClient.get(`/reports/sales?from=${from.toISOString()}&to=${to.toISOString()}`);
      // return response.data;

      // Symulacja
      return {
        period: { from, to },
        totalOrders: 125,
        totalRevenue: 89750.0,
        currency: "PLN",
        topProducts: [
          { productId: "PROD-001", sales: 45, revenue: 22450.0 },
          { productId: "PROD-002", sales: 32, revenue: 15680.0 },
        ],
      };
    }, "Getting sales report");
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * W pełnej implementacji:
 * - Multi-marketplace support (Allegro, Amazon, eBay)
 * - Real-time inventory synchronization
 * - Advanced pricing strategies
 * - Order fulfillment automation
 * - Returns and refunds handling
 * - Performance analytics i insights
 * - Competitor price monitoring
 */
