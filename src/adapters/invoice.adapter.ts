import { Injectable } from "@nestjs/common";
import axios, { AxiosInstance } from "axios";
import { BaseAdapter, AdapterResponse } from "./base/base.adapter";

export interface Invoice {
  id: string;
  orderNumber: string;
  customerId: string;
  items: InvoiceItem[];
  totalAmount: number;
  currency: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
}

export interface CreateInvoiceRequest {
  orderNumber: string;
  customerId: string;
  items: Omit<InvoiceItem, "totalPrice">[];
  currency?: string;
  dueInDays?: number;
}

@Injectable()
export class InvoiceAdapter extends BaseAdapter {
  private httpClient: AxiosInstance;
  private readonly baseUrl: string;

  constructor() {
    super("Invoice", {
      timeout: 10000,
      retryAttempts: 3,
    });

    // W rzeczywistości z .env
    this.baseUrl =
      process.env.INVOICE_API_URL || "https://api.invoice-system.com/v1";

    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: this.config.timeout,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.INVOICE_API_KEY || "demo-key"}`,
        "User-Agent": "ESB-Integration/1.0",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.httpClient.interceptors.request.use(
      (config) => {
        this.logger.debug(
          `API Request: ${config.method?.toUpperCase()} ${config.url}`
        );
        return config;
      },
      (error) => {
        this.logger.error("Request interceptor error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug(
          `API Response: ${response.status} ${response.config.url}`
        );
        return response;
      },
      (error) => {
        if (error.response) {
          this.logger.error(
            `API Error: ${error.response.status} ${
              error.response.data?.message || error.message
            }`
          );
        } else {
          this.logger.error(`Network Error: ${error.message}`);
        }
        return Promise.reject(error);
      }
    );
  }

  async testConnection(): Promise<AdapterResponse<boolean>> {
    return this.executeWithRetry(async () => {
      // Dla demonstracji symulujemy sukces (prawdziwe API nie istnieje)
      this.logger.log("Simulating invoice API connection test");
      await this.simulateDelay(300);

      // W rzeczywistości:
      // const response = await this.httpClient.get('/health');
      // return response.status === 200;

      return true;
    }, "Testing invoice API connection");
  }

  async getSystemInfo(): Promise<AdapterResponse<any>> {
    return this.executeWithRetry(async () => {
      await this.simulateDelay(200);

      // Symulowane dane - w rzeczywistości z API
      return {
        system: "Invoice Pro v2.4.1",
        apiVersion: "v1",
        baseUrl: this.baseUrl,
        features: [
          "create_invoice",
          "send_email",
          "payment_tracking",
          "pdf_generation",
        ],
        limits: {
          requestsPerHour: 1000,
          invoicesPerMonth: 5000,
        },
        status: "operational",
      };
    }, "Getting invoice system info");
  }

  // Tworzenie faktury
  async createInvoice(
    request: CreateInvoiceRequest
  ): Promise<AdapterResponse<Invoice>> {
    return this.executeWithRetry(async () => {
      await this.simulateDelay(800);

      // Kalkulacja totali
      const items: InvoiceItem[] = request.items.map((item) => ({
        ...item,
        totalPrice: item.quantity * item.unitPrice * (1 + item.taxRate / 100),
      }));

      const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

      // Symulowana faktura - w rzeczywistości wywołanie API
      const invoice: Invoice = {
        id: `INV-${Date.now()}`,
        orderNumber: request.orderNumber,
        customerId: request.customerId,
        items,
        totalAmount: Math.round(totalAmount * 100) / 100, // Zaokrąglenie do 2 miejsc
        currency: request.currency || "PLN",
        status: "draft",
        issueDate: new Date(),
        dueDate: new Date(
          Date.now() + (request.dueInDays || 30) * 24 * 60 * 60 * 1000
        ),
      };

      this.logger.log(
        `Created invoice ${invoice.id} for order ${request.orderNumber}, total: ${invoice.totalAmount} ${invoice.currency}`
      );

      // W rzeczywistości:
      // const response = await this.httpClient.post('/invoices', invoice);
      // return response.data;

      return invoice;
    }, `Creating invoice for order ${request.orderNumber}`);
  }

  // Pobranie faktury
  async getInvoice(invoiceId: string): Promise<AdapterResponse<Invoice>> {
    return this.executeWithRetry(async () => {
      await this.simulateDelay(300);

      // Symulacja - w rzeczywistości wywołanie API
      if (invoiceId.startsWith("INV-")) {
        const mockInvoice: Invoice = {
          id: invoiceId,
          orderNumber: "ORD-" + invoiceId.slice(4),
          customerId: "CUST-001",
          items: [
            {
              productId: "PROD-001",
              productName: "Test Product",
              quantity: 1,
              unitPrice: 100,
              totalPrice: 123,
              taxRate: 23,
            },
          ],
          totalAmount: 123,
          currency: "PLN",
          status: "sent",
          issueDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
        };

        return mockInvoice;
      }

      throw new Error(`Invoice ${invoiceId} not found`);
    }, `Getting invoice ${invoiceId}`);
  }

  // Wysłanie faktury e-mailem
  async sendInvoice(
    invoiceId: string,
    email: string
  ): Promise<AdapterResponse<boolean>> {
    return this.executeWithRetry(async () => {
      await this.simulateDelay(1200); // Wysyłanie e-maila trwa dłużej

      this.logger.log(`Sending invoice ${invoiceId} to ${email}`);

      // W rzeczywistości:
      // const response = await this.httpClient.post(`/invoices/${invoiceId}/send`, { email });
      // return response.data.success;

      return true;
    }, `Sending invoice ${invoiceId} to ${email}`);
  }

  // Aktualizacja statusu faktury (np. po płatności)
  async updateInvoiceStatus(
    invoiceId: string,
    status: Invoice["status"],
    paidDate?: Date
  ): Promise<AdapterResponse<Invoice>> {
    return this.executeWithRetry(async () => {
      await this.simulateDelay(400);

      const updateData: any = { status };
      if (status === "paid" && paidDate) {
        updateData.paidDate = paidDate;
      }

      this.logger.log(`Updating invoice ${invoiceId} status to ${status}`);

      // W rzeczywistości:
      // const response = await this.httpClient.patch(`/invoices/${invoiceId}`, updateData);
      // return response.data;

      // Symulacja
      const updatedInvoice = await this.getInvoice(invoiceId);
      if (updatedInvoice.success && updatedInvoice.data) {
        updatedInvoice.data.status = status;
        if (paidDate) updatedInvoice.data.paidDate = paidDate;
      }

      return updatedInvoice.data!;
    }, `Updating invoice ${invoiceId} status`);
  }

  // Pobranie listy faktur
  async getInvoices(
    customerId?: string,
    status?: Invoice["status"]
  ): Promise<AdapterResponse<Invoice[]>> {
    return this.executeWithRetry(async () => {
      await this.simulateDelay(500);

      const params = new URLSearchParams();
      if (customerId) params.append("customerId", customerId);
      if (status) params.append("status", status);

      this.logger.log(`Getting invoices with filters: ${params.toString()}`);

      // W rzeczywistości:
      // const response = await this.httpClient.get(`/invoices?${params}`);
      // return response.data;

      // Symulacja
      return []; // Pusta lista dla demo
    }, "Getting invoices list");
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * W pełnej implementacji:
 * - Obsługa webhooków dla statusów płatności
 * - Bulk operations dla wielu faktur
 * - PDF generation i download
 * - Integracja z systemami płatności
 * - Obsługa różnych walut i podatków
 * - Automatyczne przypomnienia o płatnościach
 */
