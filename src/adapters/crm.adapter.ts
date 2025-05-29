import { Injectable } from "@nestjs/common";
import axios, { AxiosInstance } from "axios";
import { BaseAdapter, AdapterResponse } from "./base/base.adapter";

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  status: "active" | "inactive" | "blocked";
  createdAt: Date;
  lastActivity?: Date;
  totalOrders: number;
  totalSpent: number;
  tags: string[];
  preferences: CustomerPreferences;
}

export interface CustomerPreferences {
  newsletter: boolean;
  smsNotifications: boolean;
  preferredLanguage: string;
  marketingConsent: boolean;
}

export interface CreateCustomerRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  tags?: string[];
  preferences?: Partial<CustomerPreferences>;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  type: "email" | "sms" | "push";
  status: "draft" | "active" | "paused" | "completed";
  targetSegment: string;
  sentCount: number;
  openRate: number;
  clickRate: number;
  createdAt: Date;
  scheduledAt?: Date;
}

@Injectable()
export class CrmAdapter extends BaseAdapter {
  private httpClient: AxiosInstance;
  private readonly baseUrl: string;

  constructor() {
    super("CRM", {
      timeout: 8000,
      retryAttempts: 3,
    });

    this.baseUrl = process.env.CRM_API_URL || "https://api.crm-system.com/v2";

    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: this.config.timeout,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Api-Key ${process.env.CRM_API_KEY || "demo-key"}`,
        "User-Agent": "ESB-Integration/1.0",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.httpClient.interceptors.request.use(
      (config) => {
        this.logger.debug(
          `CRM API Request: ${config.method?.toUpperCase()} ${config.url}`
        );
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug(`CRM API Response: ${response.status}`);
        return response;
      },
      (error) => {
        if (error.response) {
          this.logger.error(
            `CRM API Error: ${error.response.status} ${
              error.response.data?.message || error.message
            }`
          );
        } else {
          this.logger.error(`CRM Network Error: ${error.message}`);
        }
        return Promise.reject(error);
      }
    );
  }

  async testConnection(): Promise<AdapterResponse<boolean>> {
    return this.executeWithRetry(async () => {
      this.logger.log("Simulating CRM API connection test");
      await this.simulateDelay(250);

      // W rzeczywistości:
      // const response = await this.httpClient.get('/health');
      // return response.status === 200;

      return true;
    }, "Testing CRM API connection");
  }

  async getSystemInfo(): Promise<AdapterResponse<any>> {
    return this.executeWithRetry(async () => {
      await this.simulateDelay(200);

      return {
        system: "HubSpot CRM v3.1.2",
        apiVersion: "v2",
        baseUrl: this.baseUrl,
        features: [
          "contacts",
          "campaigns",
          "automation",
          "analytics",
          "segmentation",
        ],
        limits: {
          requestsPerHour: 2000,
          contactsLimit: 50000,
          campaignsPerMonth: 100,
        },
        status: "operational",
      };
    }, "Getting CRM system info");
  }

  // Zarządzanie klientami
  async createCustomer(
    request: CreateCustomerRequest
  ): Promise<AdapterResponse<Customer>> {
    return this.executeWithRetry(async () => {
      await this.simulateDelay(600);

      const customer: Customer = {
        id: `CUST-${Date.now()}`,
        email: request.email,
        firstName: request.firstName,
        lastName: request.lastName,
        phone: request.phone,
        company: request.company,
        status: "active",
        createdAt: new Date(),
        totalOrders: 0,
        totalSpent: 0,
        tags: request.tags || [],
        preferences: {
          newsletter: true,
          smsNotifications: false,
          preferredLanguage: "pl",
          marketingConsent: true,
          ...request.preferences,
        },
      };

      this.logger.log(`Created customer ${customer.id} (${customer.email})`);

      // W rzeczywistości:
      // const response = await this.httpClient.post('/contacts', customer);
      // return response.data;

      return customer;
    }, `Creating customer ${request.email}`);
  }

  async getCustomer(customerId: string): Promise<AdapterResponse<Customer>> {
    return this.executeWithRetry(async () => {
      await this.simulateDelay(300);

      if (customerId.startsWith("CUST-")) {
        const mockCustomer: Customer = {
          id: customerId,
          email: "test@example.com",
          firstName: "Jan",
          lastName: "Kowalski",
          phone: "+48123456789",
          company: "Test Sp. z o.o.",
          status: "active",
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          totalOrders: 5,
          totalSpent: 1250.0,
          tags: ["vip", "b2b"],
          preferences: {
            newsletter: true,
            smsNotifications: false,
            preferredLanguage: "pl",
            marketingConsent: true,
          },
        };

        return mockCustomer;
      }

      throw new Error(`Customer ${customerId} not found`);
    }, `Getting customer ${customerId}`);
  }

  async updateCustomer(
    customerId: string,
    updates: Partial<Customer>
  ): Promise<AdapterResponse<Customer>> {
    return this.executeWithRetry(async () => {
      await this.simulateDelay(500);

      this.logger.log(`Updating customer ${customerId}`);

      // W rzeczywistości:
      // const response = await this.httpClient.patch(`/contacts/${customerId}`, updates);
      // return response.data;

      // Symulacja
      const customer = await this.getCustomer(customerId);
      if (customer.success && customer.data) {
        return { ...customer.data, ...updates };
      }

      throw new Error(`Failed to update customer ${customerId}`);
    }, `Updating customer ${customerId}`);
  }

  // Dodawanie aktywności klienta (np. po zamówieniu)
  async addCustomerActivity(
    customerId: string,
    activity: {
      type: "purchase" | "login" | "email_open" | "website_visit";
      details: any;
      value?: number;
    }
  ): Promise<AdapterResponse<boolean>> {
    return this.executeWithRetry(async () => {
      await this.simulateDelay(400);

      this.logger.log(
        `Adding ${activity.type} activity for customer ${customerId}`
      );

      // W rzeczywistości:
      // const response = await this.httpClient.post(`/contacts/${customerId}/activities`, activity);
      // return response.data.success;

      return true;
    }, `Adding activity for customer ${customerId}`);
  }

  // Segmentacja klientów
  async getCustomersBySegment(
    segment: string
  ): Promise<AdapterResponse<Customer[]>> {
    return this.executeWithRetry(async () => {
      await this.simulateDelay(700);

      this.logger.log(`Getting customers for segment: ${segment}`);

      // W rzeczywistości:
      // const response = await this.httpClient.get(`/contacts/segments/${segment}`);
      // return response.data;

      // Symulacja - zwracamy pustą listę
      return [];
    }, `Getting customers by segment: ${segment}`);
  }

  // Kampanie marketingowe
  async createCampaign(campaign: {
    name: string;
    type: MarketingCampaign["type"];
    targetSegment: string;
    content: any;
    scheduledAt?: Date;
  }): Promise<AdapterResponse<MarketingCampaign>> {
    return this.executeWithRetry(async () => {
      await this.simulateDelay(800);

      const newCampaign: MarketingCampaign = {
        id: `CAMP-${Date.now()}`,
        name: campaign.name,
        type: campaign.type,
        status: campaign.scheduledAt ? "draft" : "active",
        targetSegment: campaign.targetSegment,
        sentCount: 0,
        openRate: 0,
        clickRate: 0,
        createdAt: new Date(),
        scheduledAt: campaign.scheduledAt,
      };

      this.logger.log(
        `Created ${campaign.type} campaign: ${campaign.name} (${newCampaign.id})`
      );

      // W rzeczywistości:
      // const response = await this.httpClient.post('/campaigns', { ...campaign, id: newCampaign.id });
      // return response.data;

      return newCampaign;
    }, `Creating campaign: ${campaign.name}`);
  }

  async getCampaignStats(
    campaignId: string
  ): Promise<AdapterResponse<MarketingCampaign>> {
    return this.executeWithRetry(async () => {
      await this.simulateDelay(400);

      if (campaignId.startsWith("CAMP-")) {
        const mockCampaign: MarketingCampaign = {
          id: campaignId,
          name: "Promocja Black Friday",
          type: "email",
          status: "completed",
          targetSegment: "active_customers",
          sentCount: 1245,
          openRate: 24.5,
          clickRate: 3.2,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          scheduledAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        };

        return mockCampaign;
      }

      throw new Error(`Campaign ${campaignId} not found`);
    }, `Getting campaign stats ${campaignId}`);
  }

  // Synchronizacja danych o zamówieniach
  async syncOrderData(
    customerId: string,
    orderData: {
      orderId: string;
      amount: number;
      products: string[];
      date: Date;
    }
  ): Promise<AdapterResponse<boolean>> {
    return this.executeWithRetry(async () => {
      await this.simulateDelay(600);

      this.logger.log(
        `Syncing order ${orderData.orderId} for customer ${customerId}, amount: ${orderData.amount}`
      );

      // Aktualizacja statystyk klienta w CRM
      // W rzeczywistości:
      // await this.httpClient.post(`/contacts/${customerId}/orders`, orderData);

      // Dodanie aktywności
      await this.addCustomerActivity(customerId, {
        type: "purchase",
        details: orderData,
        value: orderData.amount,
      });

      return true;
    }, `Syncing order data for customer ${customerId}`);
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * W pełnej implementacji:
 * - Lead scoring algorithms
 * - Advanced customer segmentation
 * - A/B testing dla kampanii
 * - Real-time personalization
 * - Integracja z narzędziami analytics
 * - Automated workflows i triggers
 * - GDPR compliance tools
 */
