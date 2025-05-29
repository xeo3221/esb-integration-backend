/*
 * ADAPTER SYSTEMU CRM - ESB Integration
 *
 * Problem do rozwiązania:
 * Mamy CRM do zarządzania klientami, ale inne systemy też potrzebują danych klientów.
 * Gdy ktoś złoży zamówienie - musimy dodać go do CRM jako potencjalnego klienta.
 *
 * Jak to rozwiązujemy:
 * Adapter synchronizuje dane klientów między ESB a CRM.
 * Automatycznie tworzy profile klientów, aktualizuje statusy, dodaje tagi.
 *
 * Dlaczego adapter:
 * - CRM może mieć skomplikowane API z wieloma polami
 * - Upraszczamy to do podstawowych operacji dla ESB
 * - Można dodać logikę biznesową (np. automatyczne tagi)
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
