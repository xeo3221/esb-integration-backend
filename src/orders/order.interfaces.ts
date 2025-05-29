/*
 * INTERFEJSY ZAMÓWIEŃ ESB - DEMO
 *
 * Problem: ESB musi przetworzyć zamówienie przez wszystkie systemy.
 * Rozwiązanie: Standardowe interfejsy dla order processing flow.
 *
 * Demo flow: Order → Inventory → Invoice → CRM → Marketplace
 * W pełnej implementacji: walidacja Zod, audit trail, error recovery
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
