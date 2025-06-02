/*
 * ADAPTER SYSTEMU CRM - REST Integration & Customer Segmentation
 *
 * Problem do rozwiązania:
 * Mamy CRM do zarządzania klientami z REST API, ale potrzebujemy integracji z ESB.
 * Gdy ktoś złoży zamówienie - automatycznie aktualizujemy profil i uruchamiamy kampanie.
 *
 * Strategia integracji (jak w docs.md):
 * - Aktualizacja profilu klienta przez REST API
 * - Segmentacja klienta na podstawie wartości zamówienia
 * - Trigger kampanii marketingowych (potwierdzenie + cross-sell)
 * - Real-time events dla behaviour tracking
 *
 * Jak to rozwiązujemy:
 * - REST client z circuit breaker i rate limiting
 * - Connection pooling dla wydajności
 * - Retry logic z exponential backoff
 * - Data validation i error handling
 *
 * W pełnej implementacji:
 * - OAuth2 authentication z token refresh
 * - Webhook handling dla CRM events
 * - Customer journey tracking
 * - Automated marketing campaigns
 * - GDPR compliance dla customer data
 * - Real-time segmentation engine
 *
 * Dlaczego adapter:
 * - CRM może mieć skomplikowane API z wieloma polami
 * - Upraszczamy to do podstawowych operacji dla ESB
 * - Centralne miejsce logiki segmentacji klientów
 * - Isolacja od zmian w CRM API
 */

import { Injectable } from "@nestjs/common";
import axios, { AxiosInstance } from "axios";
import { BaseAdapter, AdapterResponse } from "./base/base.adapter";

// Podstawowe typy klientów
export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: "lead" | "active" | "inactive";
  tags: string[];
}

export interface CreateCustomerRequest {
  email: string;
  firstName: string;
  lastName: string;
  source?: string;
}

@Injectable()
export class CrmAdapter extends BaseAdapter {
  private httpClient: AxiosInstance;

  constructor() {
    super("CRM", { timeout: 8000, retryAttempts: 3 });

    this.httpClient = axios.create({
      baseURL: process.env.CRM_API_URL || "https://api.crm.com/v2",
      headers: {
        "X-API-Key": process.env.CRM_API_KEY || "demo",
        "Content-Type": "application/json",
      },
    });
  }

  async testConnection(): Promise<AdapterResponse<boolean>> {
    return this.executeWithRetry(async () => {
      // Prawdziwe: GET /ping
      await new Promise((resolve) => setTimeout(resolve, 350));
      return true;
    }, "Test CRM API");
  }

  async getSystemInfo(): Promise<AdapterResponse<any>> {
    return this.executeWithRetry(async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        system: "CRM Pro v4.5",
        features: ["customers", "campaigns", "analytics"],
        limits: { contacts: 50000 },
      };
    }, "Info CRM");
  }

  // GŁÓWNA FUNKCJA: Dodaj klienta do CRM
  async createCustomer(
    request: CreateCustomerRequest
  ): Promise<AdapterResponse<Customer>> {
    return this.executeWithRetry(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Prawdziwe: POST /customers
      const customer: Customer = {
        id: `CRM-${Date.now()}`,
        email: request.email,
        firstName: request.firstName,
        lastName: request.lastName,
        status: "lead",
        tags: request.source ? [request.source, "new"] : ["new"],
      };

      return customer;
    }, "Tworzenie klienta");
  }
}
