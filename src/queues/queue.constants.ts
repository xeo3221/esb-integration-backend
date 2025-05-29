// Nazwy kolejek dla różnych operacji ESB
export const QUEUE_NAMES = {
  WAREHOUSE_SYNC: "warehouse-sync",
  INVOICE_PROCESSING: "invoice-processing",
  CRM_UPDATES: "crm-updates",
  MARKETPLACE_SYNC: "marketplace-sync",
  INTEGRATION_LOG: "integration-log",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
