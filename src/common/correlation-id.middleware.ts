/*
 * CORRELATION ID MIDDLEWARE - Request Tracking ESB
 *
 * Problem: W ESB trudno śledzić jedno zamówienie przez różne systemy (magazyn→faktura→CRM→marketplace)
 * Rozwiązanie: Każdy request dostaje unikalny ID, który jest przekazywany przez wszystkie systemy
 *
 * Jak działa:
 * 1. Middleware generuje/pobiera correlation-id z header
 * 2. ID jest dostępne w całym request cycle
 * 3. Wszystkie logi zawierają correlation-id
 * 4. Adaptery przekazują ID do zewnętrznych systemów
 *
 * W pełnej implementacji: distributed tracing (OpenTelemetry), database logging, monitoring
 */

import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

// Rozszerzenie Request interface
declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CorrelationIdMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    // Pobierz correlation ID z header lub wygeneruj nowy
    const correlationId =
      (req.headers["x-correlation-id"] as string) ||
      (req.headers["correlation-id"] as string) ||
      uuidv4();

    // Dodaj do request object
    req.correlationId = correlationId;

    // Dodaj do response headers
    res.setHeader("X-Correlation-ID", correlationId);

    // Logowanie każdego requestu z correlation ID
    this.logger.log(
      `[${correlationId}] ${req.method} ${req.originalUrl} - Start`
    );

    // Overriduj res.json aby logować response
    const originalJson = res.json;
    res.json = function (body) {
      new Logger(CorrelationIdMiddleware.name).log(
        `[${correlationId}] ${req.method} ${req.originalUrl} - Response: ${res.statusCode}`
      );
      return originalJson.call(this, body);
    };

    next();
  }
}
