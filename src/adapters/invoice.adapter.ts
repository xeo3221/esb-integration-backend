/*
 * ADAPTER SYSTEMU FAKTUROWANIA - ESB Integration
 *
 * Problem do rozwiązania:
 * Mamy system fakturowania z REST API, ale potrzebujemy go zintegrować z ESB.
 * Gdy przyjdzie zamówienie - automatycznie tworzymy fakturę.
 *
 * Jak to rozwiązujemy:
 * Adapter łączy się z API fakturowania i tłumaczy nasze żądania.
 * Obsługuje błędy, retry, różne formaty danych.
 *
 * Dlaczego adapter:
 * - API może się zmienić - zmienimy tylko adapter
 * - Centralne logowanie wszystkich operacji fakturowania
 * - Można dodać cache, rate limiting, batch operations
 */

import { Injectable } from "@nestjs/common";
import axios, { AxiosInstance } from "axios";
import { BaseAdapter, AdapterResponse } from "./base/base.adapter";

// Podstawowe typy faktur
export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  amount: number;
  status: "draft" | "sent" | "paid";
  dueDate: Date;
}

export interface CreateInvoiceRequest {
  customerId: string;
  items: Array<{ description: string; quantity: number; unitPrice: number }>;
}

@Injectable()
export class InvoiceAdapter extends BaseAdapter {
  private httpClient: AxiosInstance;

  constructor() {
    super("Invoice", { timeout: 10000, retryAttempts: 3 });

    this.httpClient = axios.create({
      baseURL: process.env.INVOICE_API_URL || "https://api.invoice.com/v1",
      headers: {
        Authorization: `Bearer ${process.env.INVOICE_TOKEN || "demo"}`,
        "Content-Type": "application/json",
      },
    });
  }

  async testConnection(): Promise<AdapterResponse<boolean>> {
    return this.executeWithRetry(async () => {
      // Prawdziwe: GET /health
      await new Promise((resolve) => setTimeout(resolve, 400));
      return true;
    }, "Test API faktur");
  }

  async getSystemInfo(): Promise<AdapterResponse<any>> {
    return this.executeWithRetry(async () => {
      await new Promise((resolve) => setTimeout(resolve, 250));
      return {
        system: "InvoiceGen Pro v2.1",
        limits: { perMonth: 5000 },
        currencies: ["PLN", "EUR", "USD"],
      };
    }, "Info systemu faktur");
  }

  // GŁÓWNA FUNKCJA: Stwórz fakturę
  async createInvoice(
    request: CreateInvoiceRequest
  ): Promise<AdapterResponse<Invoice>> {
    return this.executeWithRetry(async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const total = request.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      );

      // Prawdziwe: POST /invoices
      const invoice: Invoice = {
        id: `INV-${Date.now()}`,
        invoiceNumber: `2024/${Math.floor(Math.random() * 10000)}`,
        customerId: request.customerId,
        amount: total,
        status: "draft",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      return invoice;
    }, "Tworzenie faktury");
  }
}
