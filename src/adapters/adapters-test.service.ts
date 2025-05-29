import { Injectable, Logger } from "@nestjs/common";
import { WarehouseAdapter } from "./warehouse.adapter";
import { InvoiceAdapter } from "./invoice.adapter";
import { CrmAdapter } from "./crm.adapter";
import { MarketplaceAdapter } from "./marketplace.adapter";
import { AdapterResponse } from "./base/base.adapter";

export interface SystemHealthCheck {
  system: string;
  status: "healthy" | "unhealthy" | "degraded";
  responseTime: number;
  error?: string;
  details?: any;
}

export interface ESBHealthReport {
  overall: "healthy" | "unhealthy" | "degraded";
  systems: SystemHealthCheck[];
  timestamp: Date;
  totalSystems: number;
  healthySystems: number;
}

@Injectable()
export class AdaptersTestService {
  private readonly logger = new Logger(AdaptersTestService.name);

  constructor(
    private readonly warehouseAdapter: WarehouseAdapter,
    private readonly invoiceAdapter: InvoiceAdapter,
    private readonly crmAdapter: CrmAdapter,
    private readonly marketplaceAdapter: MarketplaceAdapter
  ) {}

  // Test połączeń ze wszystkimi systemami
  async testAllSystems(): Promise<ESBHealthReport> {
    this.logger.log("Running health check for all ESB systems...");

    const systems: SystemHealthCheck[] = [];

    // Test każdego adaptera
    systems.push(
      await this.testAdapter("Warehouse", () =>
        this.warehouseAdapter.testConnection()
      )
    );
    systems.push(
      await this.testAdapter("Invoice", () =>
        this.invoiceAdapter.testConnection()
      )
    );
    systems.push(
      await this.testAdapter("CRM", () => this.crmAdapter.testConnection())
    );
    systems.push(
      await this.testAdapter("Marketplace", () =>
        this.marketplaceAdapter.testConnection()
      )
    );

    const healthySystems = systems.filter((s) => s.status === "healthy").length;
    const degradedSystems = systems.filter(
      (s) => s.status === "degraded"
    ).length;

    let overall: "healthy" | "unhealthy" | "degraded" = "healthy";
    if (healthySystems === 0) {
      overall = "unhealthy";
    } else if (degradedSystems > 0 || healthySystems < systems.length) {
      overall = "degraded";
    }

    const report: ESBHealthReport = {
      overall,
      systems,
      timestamp: new Date(),
      totalSystems: systems.length,
      healthySystems,
    };

    this.logger.log(
      `ESB Health Check completed: ${overall} (${healthySystems}/${systems.length} systems healthy)`
    );

    return report;
  }

  // Test pojedynczego adaptera
  private async testAdapter(
    systemName: string,
    testFunction: () => Promise<AdapterResponse<boolean>>
  ): Promise<SystemHealthCheck> {
    const startTime = Date.now();

    try {
      const result = await testFunction();
      const responseTime = Date.now() - startTime;

      return {
        system: systemName,
        status: result.success ? "healthy" : "unhealthy",
        responseTime,
        error: result.error,
        details: result.data,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        system: systemName,
        status: "unhealthy",
        responseTime,
        error: error.message,
      };
    }
  }

  // Pobierz informacje o wszystkich systemach
  async getSystemsInfo() {
    this.logger.log("Getting info for all ESB systems...");

    const results = {
      warehouse: null,
      invoice: null,
      crm: null,
      marketplace: null,
    };

    try {
      const [warehouseInfo, invoiceInfo, crmInfo, marketplaceInfo] =
        await Promise.allSettled([
          this.warehouseAdapter.getSystemInfo(),
          this.invoiceAdapter.getSystemInfo(),
          this.crmAdapter.getSystemInfo(),
          this.marketplaceAdapter.getSystemInfo(),
        ]);

      results.warehouse =
        warehouseInfo.status === "fulfilled"
          ? warehouseInfo.value
          : { error: warehouseInfo.reason };
      results.invoice =
        invoiceInfo.status === "fulfilled"
          ? invoiceInfo.value
          : { error: invoiceInfo.reason };
      results.crm =
        crmInfo.status === "fulfilled"
          ? crmInfo.value
          : { error: crmInfo.reason };
      results.marketplace =
        marketplaceInfo.status === "fulfilled"
          ? marketplaceInfo.value
          : { error: marketplaceInfo.reason };
    } catch (error) {
      this.logger.error("Error getting systems info:", error);
    }

    return results;
  }

  // Test specyficznych operacji każdego adaptera
  async testAdapterOperations() {
    this.logger.log("Testing specific adapter operations...");

    const results = {
      warehouse: await this.testWarehouseOperations(),
      invoice: await this.testInvoiceOperations(),
      crm: await this.testCrmOperations(),
      marketplace: await this.testMarketplaceOperations(),
    };

    return results;
  }

  private async testWarehouseOperations() {
    try {
      // Test pobrania produktu
      const product = await this.warehouseAdapter.getProduct("PROD-001");

      if (product.success) {
        // Test aktualizacji stanu
        const stockUpdate = await this.warehouseAdapter.updateStock({
          productId: "PROD-001",
          newQuantity: 1,
          operation: "add",
          reason: "ESB test operation",
        });

        return {
          getProduct: product.success,
          updateStock: stockUpdate.success,
          responseTime: product.executionTime + stockUpdate.executionTime,
        };
      }

      return { error: product.error };
    } catch (error) {
      return { error: error.message };
    }
  }

  private async testInvoiceOperations() {
    try {
      // Test tworzenia faktury
      const invoice = await this.invoiceAdapter.createInvoice({
        orderNumber: "TEST-001",
        customerId: "CUST-001",
        items: [
          {
            productId: "PROD-001",
            productName: "Test Product",
            quantity: 1,
            unitPrice: 100,
            taxRate: 23,
          },
        ],
      });

      return {
        createInvoice: invoice.success,
        invoiceId: invoice.data?.id,
        responseTime: invoice.executionTime,
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  private async testCrmOperations() {
    try {
      // Test tworzenia klienta
      const customer = await this.crmAdapter.createCustomer({
        email: "test@esb.com",
        firstName: "ESB",
        lastName: "Test",
      });

      return {
        createCustomer: customer.success,
        customerId: customer.data?.id,
        responseTime: customer.executionTime,
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  private async testMarketplaceOperations() {
    try {
      // Test pobrania zamówienia
      const order = await this.marketplaceAdapter.getOrder("ORD-12345");

      if (order.success) {
        // Test synchronizacji inventory
        const syncResult = await this.marketplaceAdapter.syncInventory([
          { productId: "PROD-001", stockQuantity: 10 },
        ]);

        return {
          getOrder: order.success,
          syncInventory: syncResult.success,
          responseTime: order.executionTime + syncResult.executionTime,
        };
      }

      return { error: order.error };
    } catch (error) {
      return { error: error.message };
    }
  }
}
