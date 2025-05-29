import { Injectable } from "@nestjs/common";
import { BaseAdapter, AdapterResponse } from "./base/base.adapter";

export interface Product {
  id: string;
  name: string;
  stockLevel: number;
  location: string;
  lastUpdated: Date;
}

export interface StockUpdate {
  productId: string;
  newQuantity: number;
  operation: "set" | "add" | "subtract";
  reason: string;
}

@Injectable()
export class WarehouseAdapter extends BaseAdapter {
  // Symulowana baza magazynu (w rzeczywistości byłby to CSV, FTP lub baza)
  private mockWarehouseData: Map<string, Product> = new Map([
    [
      "PROD-001",
      {
        id: "PROD-001",
        name: "Laptop Dell XPS 13",
        stockLevel: 15,
        location: "A1-01",
        lastUpdated: new Date(),
      },
    ],
    [
      "PROD-002",
      {
        id: "PROD-002",
        name: "iPhone 15 Pro",
        stockLevel: 8,
        location: "B2-05",
        lastUpdated: new Date(),
      },
    ],
    [
      "PROD-003",
      {
        id: "PROD-003",
        name: 'Samsung Monitor 27"',
        stockLevel: 23,
        location: "C1-12",
        lastUpdated: new Date(),
      },
    ],
  ]);

  constructor() {
    super("Warehouse", {
      timeout: 15000, // Magazyn może być wolniejszy
      retryAttempts: 2,
    });
  }

  async testConnection(): Promise<AdapterResponse<boolean>> {
    return this.executeWithRetry(async () => {
      // Symulacja sprawdzenia połączenia z systemem magazynowym
      await this.simulateDelay(500);
      return true;
    }, "Testing warehouse connection");
  }

  async getSystemInfo(): Promise<AdapterResponse<any>> {
    return this.executeWithRetry(async () => {
      await this.simulateDelay(300);

      return {
        system: "WMS v3.2.1",
        totalProducts: this.mockWarehouseData.size,
        totalStock: Array.from(this.mockWarehouseData.values()).reduce(
          (sum, product) => sum + product.stockLevel,
          0
        ),
        lastSync: new Date(),
        connectionType: "Direct Database Access",
      };
    }, "Getting warehouse system info");
  }

  // Pobranie informacji o produkcie
  async getProduct(productId: string): Promise<AdapterResponse<Product>> {
    return this.executeWithRetry(async () => {
      await this.simulateDelay(200);

      const product = this.mockWarehouseData.get(productId);
      if (!product) {
        throw new Error(`Product ${productId} not found in warehouse`);
      }

      return product;
    }, `Getting product ${productId}`);
  }

  // Aktualizacja stanu magazynowego
  async updateStock(update: StockUpdate): Promise<AdapterResponse<Product>> {
    return this.executeWithRetry(async () => {
      await this.simulateDelay(800); // Aktualizacje są wolniejsze

      const product = this.mockWarehouseData.get(update.productId);
      if (!product) {
        throw new Error(`Product ${update.productId} not found`);
      }

      let newStock: number;
      switch (update.operation) {
        case "set":
          newStock = update.newQuantity;
          break;
        case "add":
          newStock = product.stockLevel + update.newQuantity;
          break;
        case "subtract":
          newStock = product.stockLevel - update.newQuantity;
          break;
      }

      if (newStock < 0) {
        throw new Error(
          `Insufficient stock. Current: ${product.stockLevel}, requested: ${update.newQuantity}`
        );
      }

      // Aktualizacja produktu
      const updatedProduct: Product = {
        ...product,
        stockLevel: newStock,
        lastUpdated: new Date(),
      };

      this.mockWarehouseData.set(update.productId, updatedProduct);

      this.logger.log(
        `Stock updated for ${update.productId}: ${product.stockLevel} → ${newStock} (${update.reason})`
      );

      return updatedProduct;
    }, `Updating stock for ${update.productId}`);
  }

  // Pobranie wszystkich produktów o niskim stanie
  async getLowStockProducts(
    threshold: number = 10
  ): Promise<AdapterResponse<Product[]>> {
    return this.executeWithRetry(async () => {
      await this.simulateDelay(400);

      const lowStockProducts = Array.from(
        this.mockWarehouseData.values()
      ).filter((product) => product.stockLevel <= threshold);

      return lowStockProducts;
    }, `Getting low stock products (threshold: ${threshold})`);
  }

  // Eksport danych magazynowych (symulacja generowania CSV)
  async exportInventory(): Promise<AdapterResponse<string>> {
    return this.executeWithRetry(async () => {
      await this.simulateDelay(1500); // Eksport trwa dłużej

      const products = Array.from(this.mockWarehouseData.values());
      const csvData = [
        "ProductID,Name,StockLevel,Location,LastUpdated",
        ...products.map(
          (p) =>
            `${p.id},${p.name},${p.stockLevel},${
              p.location
            },${p.lastUpdated.toISOString()}`
        ),
      ].join("\n");

      // W rzeczywistości zapisalibyśmy do pliku lub wysłali przez FTP
      this.logger.log(`Exported ${products.length} products to CSV`);

      return csvData;
    }, "Exporting inventory data");
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * W pełnej implementacji:
 * - Rzeczywiste połączenie FTP/SFTP
 * - Parser CSV/XML/EDI
 * - Bezpośredni dostęp do bazy magazynu
 * - Synchronizacja plików z systemem magazynowym
 * - Obsługa różnych formatów danych (CSV, XML, Excel)
 * - Monitoring zmian w plikach (file watchers)
 */
