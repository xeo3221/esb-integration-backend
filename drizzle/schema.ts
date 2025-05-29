import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

// Tabela logów integracyjnych
export const integrationLogs = pgTable("integration_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  correlationId: uuid("correlation_id").notNull(),
  systemName: varchar("system_name", { length: 100 }).notNull(),
  operation: varchar("operation", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(), // success, error, retry
  payload: jsonb("payload"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabela stanów systemów (dla circuit breaker)
export const systemStates = pgTable("system_states", {
  id: uuid("id").primaryKey().defaultRandom(),
  systemName: varchar("system_name", { length: 100 }).notNull().unique(),
  isHealthy: boolean("is_healthy").default(true).notNull(),
  lastCheck: timestamp("last_check").defaultNow().notNull(),
  failureCount: integer("failure_count").default(0).notNull(),
  circuitBreakerState: varchar("circuit_breaker_state", { length: 20 })
    .default("closed")
    .notNull(), // closed, open, half-open
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabela stanów magazynowych (przykładowa)
export const stockLevels = pgTable("stock_levels", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: varchar("product_id", { length: 100 }).notNull().unique(),
  quantity: integer("quantity").notNull(),
  lastSyncAt: timestamp("last_sync_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabela zamówień (przykładowa)
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  marketplaceOrderId: varchar("marketplace_order_id", {
    length: 100,
  }).notNull(),
  customerId: varchar("customer_id", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(), // pending, processing, completed, failed
  totalAmount: integer("total_amount").notNull(), // w groszach
  items: jsonb("items").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
});
