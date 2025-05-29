/*
 * BAZOWA KLASA ADAPTERA ESB
 *
 * Problem: Każdy adapter (magazyn, faktury, CRM, marketplace) potrzebuje retry logic,
 * timeoutów, logowania i wspólnych interfejsów.
 *
 * Rozwiązanie: Bazowa klasa z executeWithRetry() - automatyczne ponowienia z exponential backoff,
 * standardowe response format z metrykami.
 *
 * Dlaczego: DRY principle, spójność wszystkich adapterów, łatwość debugowania.
 *
 * W pełnej implementacji: circuit breaker, rate limiting, caching, health monitoring.
 */

import { Logger } from "@nestjs/common";

export interface AdapterConfig {
  name: string;
  enabled: boolean;
  retryAttempts: number;
  timeout: number;
}

export interface AdapterResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
  executionTime: number;
}

export abstract class BaseAdapter {
  protected readonly logger: Logger;
  protected readonly config: AdapterConfig;

  constructor(
    protected readonly adapterName: string,
    config: Partial<AdapterConfig> = {}
  ) {
    this.logger = new Logger(`${adapterName}Adapter`);
    this.config = {
      name: adapterName,
      enabled: true,
      retryAttempts: 3,
      timeout: 30000,
      ...config,
    };
  }

  protected async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<AdapterResponse<T>> {
    const startTime = Date.now();
    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        this.logger.log(
          `${context} - próba ${attempt}/${this.config.retryAttempts}`
        );

        const data = await Promise.race([
          operation(),
          this.createTimeoutPromise<T>(),
        ]);
        const executionTime = Date.now() - startTime;

        this.logger.log(`${context} - sukces w ${executionTime}ms`);
        return { success: true, data, timestamp: new Date(), executionTime };
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(
          `${context} - próba ${attempt} nieudana: ${error.message}`
        );

        if (attempt < this.config.retryAttempts) {
          await this.delay(1000 * attempt); // exponential backoff
        }
      }
    }

    const executionTime = Date.now() - startTime;
    this.logger.error(
      `${context} - wszystkie próby nieudane: ${lastError.message}`
    );

    return {
      success: false,
      error: lastError.message,
      timestamp: new Date(),
      executionTime,
    };
  }

  private createTimeoutPromise<T>(): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error(`Timeout po ${this.config.timeout}ms`)),
        this.config.timeout
      );
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Metody abstrakcyjne - każdy adapter musi je zaimplementować
  abstract testConnection(): Promise<AdapterResponse<boolean>>;
  abstract getSystemInfo(): Promise<AdapterResponse<any>>;
}
