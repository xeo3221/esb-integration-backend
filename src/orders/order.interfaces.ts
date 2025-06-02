/*
 * TRANSFORM ENGINE - Standardowe interfejsy wymiany danych ESB
 *
 * Problem: ESB musi przetworzyć zamówienie przez wszystkie systemy
 * z różnymi formatami danych (legacy DB, REST APIs, CSV files).
 *
 * Rozwiązanie: Kanoniczne interfejsy + data mapping dla wszystkich systemów.
 *
 * Przepływ danych (jak w docs.md):
 * - Marketplace → OrderRequest (JSON REST)
 * - Magazyn → Multi-modal format (DB/CSV/UI)
 * - Faktury → REST API format
 * - CRM → Customer profile format
 *
 * W pełnej implementacji:
 * - Walidacja Zod dla wszystkich interfejsów
 * - Schema versioning i backward compatibility
 * - Data transformation między formatami systemów
 * - JSON Schema validation
 * - Audit trail dla wszystkich transformacji
 * - Error recovery przy błędach walidacji
 *
 * Demo flow: Order → Inventory → Invoice → CRM → Marketplace
 */

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface CustomerInfo {
  id: string;
  email: string;
  name: string;
  address: string;
}

export interface OrderRequest {
  customerId: string;
  customerInfo: CustomerInfo;
  items: OrderItem[];
  totalAmount: number;
}

export interface OrderResponse {
  orderId: string;
  status: "received" | "processing" | "completed" | "failed";
  steps: OrderStep[];
  createdAt: string;
}

export interface OrderDetailResponse extends OrderResponse {
  customerInfo: CustomerInfo;
  items: OrderItem[];
  totalAmount: number;
}

export interface OrderStep {
  step: "inventory" | "invoice" | "crm" | "marketplace";
  status: "pending" | "queued" | "processing" | "completed" | "failed";
  jobId?: string;
  completedAt?: string;
  error?: string;
}

export interface OrderProcessingData {
  orderId: string;
  order: OrderRequest;
  currentStep: string;
}
