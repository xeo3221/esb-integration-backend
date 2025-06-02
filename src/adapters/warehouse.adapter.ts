/*
 * ADAPTER SYSTEMU MAGAZYNOWEGO - Multi-Modal Access
 *
 * Problem do rozwiązania:
 * System magazynowy nie ma API - jest to legacy system AS400/Oracle.
 * Potrzebujemy hierarchii dostępu z automatycznym failover.
 *
 * Strategia Multi-Modal Access (jak w docs.md):
 * 1. PRIMARY: Bezpośredni dostęp do bazy (JDBC read-only)
 * 2. FALLBACK: Polling plików CSV z FTP/SFTP (co 15 min)
 * 3. LAST RESORT: Screen scraping legacy UI
 *
 * Jak to rozwiązujemy:
 * - Circuit breaker dla każdego typu połączenia
 * - Automatyczny failover między metodami dostępu
 * - Metryki sukcesu per metoda dostępu
 * - Exponential backoff przy błędach sieci
 *
 * W pełnej implementacji:
 * - JDBC connector do AS400/Oracle z connection pooling
 * - FTP client z scheduled polling (CRON job co 15 min)
 * - UI scraping z Selenium/Puppeteer jako last resort
 * - Schema validation i data transformation
 * - Audit logging wszystkich operacji magazynowych
 *
 * Dlaczego adapter:
 * - Inne systemy myślą że to normalne API
 * - Można zmienić sposób połączenia nie ruszając reszty kodu
 * - Jedno miejsce obsługi błędów dla magazynu
 * - Centralne monitoring dostępności legacy systemu
 */

import { Injectable } from "@nestjs/common";
import { BaseAdapter, AdapterResponse } from "./base/base.adapter";

// Podstawowe typy danych magazynu
export interface Product {
  id: string;
  name: string;
  stockLevel: number;
  location: string;
}

export interface StockUpdate {
  productId: string;
  newQuantity: number;
  operation: "set" | "add" | "subtract";
}

@Injectable()
export class WarehouseAdapter extends BaseAdapter {
  // Demo data - w rzeczywistości z CSV/bazy
  private mockData: Map<string, Product> = new Map([
    [
      "PROD-001",
      { id: "PROD-001", name: "Laptop Dell", stockLevel: 15, location: "A1" },
    ],
    [
      "PROD-002",
      { id: "PROD-002", name: "iPhone 15", stockLevel: 8, location: "B2" },
    ],
  ]);

  constructor() {
    super("Warehouse", { timeout: 15000, retryAttempts: 2 });
  }

  async testConnection(): Promise<AdapterResponse<boolean>> {
    return this.executeWithRetry(async () => {
      // Prawdziwe: sprawdź FTP/bazę magazynu
      await new Promise((resolve) => setTimeout(resolve, 500));
      return true;
    }, "Test magazynu");
  }

  async getSystemInfo(): Promise<AdapterResponse<any>> {
    return this.executeWithRetry(async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        system: "WMS v3.2.1",
        connection: "FTP + Database",
        products: this.mockData.size,
      };
    }, "Info magazynu");
  }

  // GŁÓWNA FUNKCJA: Zmień stan towaru
  async updateStock(update: StockUpdate): Promise<AdapterResponse<Product>> {
    return this.executeWithRetry(async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const product = this.mockData.get(update.productId);
      if (!product) throw new Error(`Brak produktu ${update.productId}`);

      let newStock =
        update.operation === "set"
          ? update.newQuantity
          : update.operation === "add"
          ? product.stockLevel + update.newQuantity
          : product.stockLevel - update.newQuantity;

      if (newStock < 0) throw new Error("Za mało towaru");

      const updated = { ...product, stockLevel: newStock };
      this.mockData.set(update.productId, updated);

      return updated;
    }, "Aktualizacja stanu");
  }
}
