/*
 * MODUŁ ADAPTERÓW ESB
 *
 * Problem do rozwiązania:
 * ESB musi łączyć się z 4 różnymi systemami zewnętrznymi.
 * Każdy system ma inne API, protokoły i wymagania.
 *
 * Jak to rozwiązujemy:
 * Moduł grupuje wszystkie adaptery systemów:
 * - WarehouseAdapter - system magazynowy (CSV/FTP/DB)
 * - InvoiceAdapter - system fakturowania (REST API)
 * - CrmAdapter - system CRM (REST API)
 * - MarketplaceAdapter - platformy sprzedażowe (REST API)
 * - AdaptersTestService - testowanie wszystkich adapterów
 *
 * Dlaczego osobny moduł:
 * - Izolacja odpowiedzialności za integracje
 * - Łatwe mockowanie w testach
 * - Możliwość wyłączenia pojedynczych systemów
 * - Centralne zarządzanie dependency injection
 *
 * W pełnej implementacji:
 * - Configuration service dla ustawień adapterów
 * - Circuit breaker factory dla każdego adaptera
 * - Metrics collector dla monitorowania integracji
 * - Adapter registry z dynamic loading
 */

import { Module } from "@nestjs/common";
import { WarehouseAdapter } from "./warehouse.adapter";
import { InvoiceAdapter } from "./invoice.adapter";
import { CrmAdapter } from "./crm.adapter";
import { MarketplaceAdapter } from "./marketplace.adapter";
import { AdaptersTestService } from "./adapters-test.service";

@Module({
  providers: [
    WarehouseAdapter,
    InvoiceAdapter,
    CrmAdapter,
    MarketplaceAdapter,
    AdaptersTestService,
  ],
  exports: [
    WarehouseAdapter,
    InvoiceAdapter,
    CrmAdapter,
    MarketplaceAdapter,
    AdaptersTestService,
  ],
})
export class AdaptersModule {}
