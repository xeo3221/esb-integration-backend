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
