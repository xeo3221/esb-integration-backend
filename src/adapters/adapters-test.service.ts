/*
 * SERWIS TESTOWY ADAPTERÓW ESB
 *
 * Problem do rozwiązania:
 * Musimy sprawdzić czy wszystkie systemy działają przed uruchomieniem ESB.
 * DevOps potrzebuje szybkiego health check wszystkich integracji.
 *
 * Jak to rozwiązujemy:
 * Jeden serwis testuje wszystkie adaptery i zwraca jasny raport.
 * Sprawdza połączenia, podstawowe operacje i mierzy czasy odpowiedzi.
 *
 * Dlaczego to ważne:
 * - Szybka diagnoza problemów z integracją
 * - Monitoring stanu systemów zewnętrznych
 * - Health check endpoint dla DevOps
 */

import { Injectable } from "@nestjs/common";
import { WarehouseAdapter } from "./warehouse.adapter";
import { InvoiceAdapter } from "./invoice.adapter";
import { CrmAdapter } from "./crm.adapter";
import { MarketplaceAdapter } from "./marketplace.adapter";

export interface SystemHealthReport {
  systemName: string;
  isHealthy: boolean;
  responseTimeMs?: number;
  lastChecked: Date;
  error?: string;
}

export interface AdapterTestResult {
  adapterName: string;
  testPassed: boolean;
  responseTimeMs: number;
  error?: string;
  result?: any;
}

@Injectable()
export class AdaptersTestService {
  constructor(
    private readonly warehouseAdapter: WarehouseAdapter,
    private readonly invoiceAdapter: InvoiceAdapter,
    private readonly crmAdapter: CrmAdapter,
    private readonly marketplaceAdapter: MarketplaceAdapter
  ) {}

  // GŁÓWNA FUNKCJA: Sprawdź stan wszystkich systemów ESB
  async checkAllSystemsHealth(): Promise<SystemHealthReport[]> {
    const adapters = [
      { name: "Magazyn", adapter: this.warehouseAdapter },
      { name: "Fakturowanie", adapter: this.invoiceAdapter },
      { name: "CRM", adapter: this.crmAdapter },
      { name: "Marketplace", adapter: this.marketplaceAdapter },
    ];

    const healthReports: SystemHealthReport[] = [];

    for (const { name, adapter } of adapters) {
      const testStart = Date.now();

      try {
        const result = await adapter.testConnection();
        healthReports.push({
          systemName: name,
          isHealthy: result.success,
          responseTimeMs: Date.now() - testStart,
          lastChecked: new Date(),
          error: result.error,
        });
      } catch (error) {
        healthReports.push({
          systemName: name,
          isHealthy: false,
          responseTimeMs: Date.now() - testStart,
          lastChecked: new Date(),
          error: error.message,
        });
      }
    }

    return healthReports;
  }

  // Pobierz informacje o wszystkich systemach
  async getAllSystemsInfo(): Promise<any[]> {
    const adapters = [
      { name: "Magazyn", adapter: this.warehouseAdapter },
      { name: "Fakturowanie", adapter: this.invoiceAdapter },
      { name: "CRM", adapter: this.crmAdapter },
      { name: "Marketplace", adapter: this.marketplaceAdapter },
    ];

    const systemsInfo = [];

    for (const { name, adapter } of adapters) {
      try {
        const result = await adapter.getSystemInfo();
        systemsInfo.push({
          adapterName: name,
          info: result.data,
          success: result.success,
        });
      } catch (error) {
        systemsInfo.push({
          adapterName: name,
          error: error.message,
          success: false,
        });
      }
    }

    return systemsInfo;
  }

  // Test podstawowych operacji każdego adaptera
  async testAdapterOperations(): Promise<AdapterTestResult[]> {
    const results: AdapterTestResult[] = [];

    // Test magazynu - aktualizacja stanu
    try {
      const startTime = Date.now();
      const result = await this.warehouseAdapter.updateStock({
        productId: "PROD-001",
        newQuantity: 10,
        operation: "set",
      });

      results.push({
        adapterName: "Magazyn - aktualizacja stanu",
        testPassed: result.success,
        responseTimeMs: Date.now() - startTime,
        result: result.data,
        error: result.error,
      });
    } catch (error) {
      results.push({
        adapterName: "Magazyn - aktualizacja stanu",
        testPassed: false,
        responseTimeMs: 0,
        error: error.message,
      });
    }

    // Test fakturowania - tworzenie faktury
    try {
      const startTime = Date.now();
      const result = await this.invoiceAdapter.createInvoice({
        customerId: "CUST-001",
        items: [{ description: "Test produkt", quantity: 1, unitPrice: 100 }],
      });

      results.push({
        adapterName: "Fakturowanie - tworzenie faktury",
        testPassed: result.success,
        responseTimeMs: Date.now() - startTime,
        result: result.data,
        error: result.error,
      });
    } catch (error) {
      results.push({
        adapterName: "Fakturowanie - tworzenie faktury",
        testPassed: false,
        responseTimeMs: 0,
        error: error.message,
      });
    }

    // Test CRM - dodanie klienta
    try {
      const startTime = Date.now();
      const result = await this.crmAdapter.createCustomer({
        email: "test@example.com",
        firstName: "Jan",
        lastName: "Testowy",
      });

      results.push({
        adapterName: "CRM - dodanie klienta",
        testPassed: result.success,
        responseTimeMs: Date.now() - startTime,
        result: result.data,
        error: result.error,
      });
    } catch (error) {
      results.push({
        adapterName: "CRM - dodanie klienta",
        testPassed: false,
        responseTimeMs: 0,
        error: error.message,
      });
    }

    // Test Marketplace - synchronizacja produktu
    try {
      const startTime = Date.now();
      const result = await this.marketplaceAdapter.syncProduct({
        productId: "PROD-001",
        stockQuantity: 15,
        price: 4999,
      });

      results.push({
        adapterName: "Marketplace - sync produktu",
        testPassed: result.success,
        responseTimeMs: Date.now() - startTime,
        result: result.data,
        error: result.error,
      });
    } catch (error) {
      results.push({
        adapterName: "Marketplace - sync produktu",
        testPassed: false,
        responseTimeMs: 0,
        error: error.message,
      });
    }

    return results;
  }
}
