# 🚀 ESB Integration API - E-commerce Demo

> **Demo Enterprise Service Bus dla startup e-commerce - Proof of Concept integracji 4 systemów**

📖 **Pełna dokumentacja:** Zobacz [docs.md](https://github.com/xeo3221/esb-integration-backend/blob/main/docs.md) dla kompletnego rozwiązania zadania

## 📋 Opis Projektu

**UWAGA: To jest DEMO/POC** - pokazuje architekturę ESB bez prawdziwych integracji.

Demo Enterprise Service Bus (ESB) symulujące integrację systemów e-commerce:

- 🏭 **System magazynowy** (CSV/FTP - symulacja)
- 💰 **System fakturowania** (REST API - symulacja)
- 👥 **CRM do marketingu** (REST API - symulacja)
- 🛒 **Platforma marketplace** (REST API - symulacja)

**Cel demo:** Pokazać architekturę ESB z kolejkami, adapterami i orchestracją przepływów biznesowych.

**Co działa:** Wszystkie komponenty ESB działają w trybie symulacji - logują operacje, zarządzają kolejkami, ale nie łączą się z prawdziwymi systemami.

---

## 🏗️ Architektura Demo

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Postman/curl  │───▶│   ESB API        │───▶│   PostgreSQL    │
│   (Testing)     │    │   (Nest.js)      │    │   (Neon)        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Demo Queues    │
                       │   (BullMQ sim)   │
                       └──────────────────┘
                                │
            ┌───────────────────┼───────────────────┐
            ▼                   ▼                   ▼
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │ Warehouse   │    │  Invoice    │    │ CRM + MP    │
    │ Adapter     │    │  Adapter    │    │ Adapters    │
    │ (DEMO)      │    │ (DEMO)      │    │ (DEMO)      │
    └─────────────┘    └─────────────┘    └─────────────┘
            │                   │                   │
            ▼                   ▼                   ▼
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │ Symulacja   │    │ Symulacja   │    │ Symulacja   │
    │ CSV/FTP     │    │ REST API    │    │ REST APIs   │
    └─────────────┘    └─────────────┘    └─────────────┘
```

## ✨ Co Jest Zaimplementowane (Demo Mode)

### 🎯 **Core ESB Infrastructure (Demo)**

- ✅ **4 Adaptery systemów** z retry logic i health checks (symulacja)
- ✅ **5 Kolejek BullMQ** w trybie demo (bez prawdziwego Redis)
- ✅ **PostgreSQL + Drizzle ORM** dla persistence (opcjonalnie)
- ✅ **Health monitoring** wszystkich symulowanych systemów
- ✅ **Demo mode** - wszystko działa bez zewnętrznych systemów

### 🔄 **Business Flows (Demo)**

- ✅ **Order Processing Flow** - pełny flow przez 4 kolejki (symulowany)
- ✅ **Inventory Sync Flow** - batch + real-time synchronization logic
- ✅ **Orchestrator pattern** z tracking każdego kroku
- ✅ **Status monitoring** w real-time

### 🛠️ **Professional Features (Demo)**

- ✅ **Swagger Documentation** - profesjonalna dokumentacja API
- ✅ **Correlation ID Middleware** - śledzenie requestów
- ✅ **Error handling** - graceful failures z retry logic
- ✅ **Modular architecture** - separacja odpowiedzialności
- ✅ **TypeScript** - type safety i developer experience

---

## 🚀 Quick Start

```bash
npm install && npm run start:dev
curl http://localhost:3000/health  # Test demo
open http://localhost:3000/api     # Swagger docs
```

**🎯 DEMO MODE:** Wszystko działa "out of the box" - bez Redis, bez bazy danych, bez zewnętrznych systemów!

### Wymagania

- Node.js 18+
- npm/yarn
- **PostgreSQL** (Neon) - **OPCJONALNE** (demo działa bez bazy)
- **Redis** - **NIE POTRZEBNE** (demo mode)

### 1. Instalacja

```bash
git clone <repo>
cd backend
npm install
```

### 2. Konfiguracja (Opcjonalna)

```bash
# Demo działa bez .env!
# Opcjonalnie możesz skopiować:
cp .env.example .env

# I edytować dla PostgreSQL:
DATABASE_URL="postgresql://..."  # Opcjonalne - demo działa bez bazy
# Redis nie jest potrzebne w demo mode
```

### 3. Uruchomienie Demo

```bash
# Development mode - DEMO
npm run start:dev

# Demo działa od razu bez dodatkowej konfiguracji!
```

### 4. Sprawdź czy Demo działa

```bash
curl http://localhost:3000/health
# ✅ {"status":"ok","timestamp":"...","mode":"demo"}

# Otwórz dokumentację demo
open http://localhost:3000/api
```

---

## 📚 API Documentation

### 🌐 **Swagger UI**: `http://localhost:3000/api`

Pełna interaktywna dokumentacja z przykładami i testowaniem endpoints.

### 🔍 **Główne Endpoints**

#### **Health & Monitoring**

```bash
GET  /health                    # Status aplikacji
GET  /health/database          # Status PostgreSQL
GET  /adapters/health          # Status wszystkich systemów
GET  /queues/stats             # Statystyki kolejek ESB
```

#### **Order Processing Flow** 🛒

```bash
POST /orders/demo              # Demo zamówienie (laptop + mysz)
POST /orders                   # Nowe zamówienie (custom)
GET  /orders/:orderId          # Status zamówienia
GET  /orders                   # Lista zamówień
```

#### **Inventory Sync Flow** 📦

```bash
POST /inventory/sync/demo      # Demo synchronizacja
POST /inventory/sync           # Synchronizacja magazynu
GET  /inventory/sync/:syncId   # Status synchronizacji
GET  /inventory/sync           # Lista synchronizacji
```

#### **System Testing** 🔧

```bash
GET  /adapters/info            # Info o systemach
GET  /adapters/test-operations # Test operacji adapterów
POST /test/warehouse-sync      # Test kolejki magazynu
```

---

## 🎮 Demo Scenarios

### 1. 🛒 **Order Processing Demo**

```bash
# Utwórz demo zamówienie
curl -X POST http://localhost:3000/orders/demo

# Response:
{
  "orderId": "order-1234567890",
  "status": "processing",
  "customerId": "demo-customer-123",
  "totalAmount": 5259.97,
  "createdAt": "2025-05-29T21:00:00.000Z"
}

# Sprawdź szczegóły
curl http://localhost:3000/orders/order-1234567890

# Response:
{
  "orderId": "order-1234567890",
  "status": "processing",
  "customer": {
    "name": "Jan Kowalski",
    "email": "demo@example.com"
  },
  "items": [
    {"productName": "Laptop Dell XPS", "quantity": 1, "price": 4999.99},
    {"productName": "Mysz bezprzewodowa", "quantity": 2, "price": 129.99}
  ],
  "totalAmount": 5259.97,
  "steps": [
    {"step": "inventory", "status": "queued"},
    {"step": "invoice", "status": "pending"},
    {"step": "crm", "status": "pending"},
    {"step": "marketplace", "status": "pending"}
  ]
}
```

### 2. 📦 **Inventory Sync Demo**

```bash
# Uruchom demo synchronizację
curl -X POST http://localhost:3000/inventory/sync/demo

# Response:
{
  "syncId": "sync-1234567890",
  "status": "started",
  "syncType": "incremental",
  "productsCount": 3,
  "startedAt": "2025-05-29T21:00:00.000Z",
  "estimatedDuration": "2-5 minut"
}

# Sprawdź status
curl http://localhost:3000/inventory/sync/sync-1234567890
```

### 3. 🏥 **Health Check Demo**

```bash
# Status całego systemu
curl http://localhost:3000/adapters/health

# Response:
{
  "timestamp": "2025-05-29T21:00:00.000Z",
  "warehouse": {"status": "ok", "responseTime": "45ms"},
  "invoice": {"status": "ok", "responseTime": "120ms"},
  "crm": {"status": "ok", "responseTime": "89ms"},
  "marketplace": {"status": "ok", "responseTime": "156ms"}
}
```

---

## 🏭 Przepływy Biznesowe - Demo

### 🛒 **Order Processing Flow (Demo)**

**Co faktycznie działa w naszym demo:**

```
Klient → POST /orders/demo → ESB Orchestrator (symulacja)
    ↓
1. Inventory Queue    → SYMULACJA sprawdzenia stock (instant log)
    ↓
2. Invoice Queue      → SYMULACJA generowania faktury (instant log)
    ↓
3. CRM Queue         → SYMULACJA dodania klienta (instant log)
    ↓
4. Marketplace Queue → SYMULACJA aktualizacji status (instant log)
    ↓
Status: "completed" - wszystkie kroki przeszły natychmiast
```

**Demo pokazuje:**

- ✅ Pełną orchestrację przez kolejki ESB
- ✅ Status tracking każdego kroku
- ✅ Error handling i retry logic (symulowany)
- ✅ Correlation ID przez cały flow

### 📦 **Inventory Sync Flow (Częściowo)**

**Co mamy w demo:**

```
Trigger → POST /inventory/sync/demo → Basic Endpoint
    ↓
STATUS: Tylko podstawowy endpoint - brak pełnego flow
```

**Demo pokazuje:**

- ✅ Endpoint structure i response format
- ⚠️ Brak pełnej implementacji sync logic
- 🎯 Proof of concept dla architektury

### 🎯 **Co Demo Faktycznie Testuje:**

| Funkcjonalność    | Demo Status          | Co Możesz Przetestować            |
| ----------------- | -------------------- | --------------------------------- |
| Order Processing  | ✅ Pełny flow        | Cały orchestrator przez 4 kolejki |
| Inventory Sync    | ⚠️ Tylko endpoint    | Podstawowy API call               |
| Health Monitoring | ✅ Działa            | Wszystkie adaptery i system       |
| Queue Management  | ✅ BullMQ simulation | Stats, job tracking               |
| Error Handling    | ✅ Retry logic       | Wszystkie adaptery z retry        |
| API Documentation | ✅ Swagger           | Pełna interaktywna docs           |

---

## 🛠️ Tech Stack

### **Backend Framework**

- **Nest.js** - Enterprise Node.js framework
- **TypeScript** - Type safety i developer experience

### **Database & ORM**

- **PostgreSQL** - Relacyjna baza danych (Neon hosting)
- **Drizzle ORM** - Type-safe ORM z schema migrations

### **Message Queues**

- **BullMQ** - Robust job/message queue
- **Redis** - In-memory storage dla kolejek

### **API & Documentation**

- **Swagger/OpenAPI** - Interactive API documentation
- **REST API** - Standard HTTP/JSON endpoints

### **Monitoring & Observability**

- **Correlation ID** - Request tracking across services
- **Health Checks** - System status monitoring
- **Structured Logging** - Comprehensive operation logs

---

## 📁 Struktura Projektu

```
backend/
├── src/
│   ├── adapters/           # Adaptery do zewnętrznych systemów
│   │   ├── warehouse.adapter.ts      # System magazynowy (CSV/FTP)
│   │   ├── invoice.adapter.ts        # System fakturowania (REST)
│   │   ├── crm.adapter.ts           # System CRM (REST)
│   │   ├── marketplace.adapter.ts    # Marketplace (REST + webhooks)
│   │   └── adapters-test.service.ts  # Testing service
│   │
│   ├── queues/             # Kolejki ESB i procesory
│   │   ├── processors/
│   │   │   └── warehouse.processor.ts # Worker dla kolejki magazynu
│   │   ├── queue.service.ts          # Centralne zarządzanie kolejkami
│   │   ├── queue.constants.ts        # Nazwy kolejek
│   │   └── queues.module.ts          # Moduł kolejek
│   │
│   ├── orders/             # Business logic zamówień
│   │   ├── order-processing.service.ts # Orchestrator zamówień
│   │   ├── inventory-sync.service.ts   # Orchestrator synchronizacji
│   │   ├── orders.controller.ts        # API zamówień
│   │   ├── inventory.controller.ts     # API synchronizacji
│   │   └── order.interfaces.ts         # TypeScript interfaces
│   │
│   ├── config/             # Konfiguracja systemu
│   │   ├── database.module.ts         # PostgreSQL + Drizzle
│   │   └── redis.config.ts            # Redis + BullMQ
│   │
│   ├── common/             # Shared utilities
│   │   └── correlation-id.middleware.ts # Request tracking
│   │
│   ├── app.controller.ts   # Główny controller (health, stats)
│   ├── app.service.ts      # Główny service
│   ├── app.module.ts       # Root module
│   └── main.ts            # Bootstrap + Swagger setup
│
├── package.json           # Dependencies i scripts
├── .env.example          # Przykład konfiguracji
└── README.md            # Ta dokumentacja
```

---

## 🧪 Testing & Development

### **Manual Testing**

```bash
# Test health checks
curl http://localhost:3000/health

# Test order flow
curl -X POST http://localhost:3000/orders/demo

# Test inventory sync
curl -X POST http://localhost:3000/inventory/sync/demo

# Test adapters
curl http://localhost:3000/adapters/health
```

### **Database Operations**

```bash
# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Push schema (dev)
npm run db:push

# Database studio GUI
npm run db:studio
```

### **Correlation ID Testing**

Każdy request automatycznie dostaje correlation ID:

```bash
curl -H "X-Correlation-ID: my-test-123" http://localhost:3000/health
# Response będzie miał header: X-Correlation-ID: my-test-123
```

---

## 🌍 Deployment & Production

### **Environment Variables**

```bash
# Required
DATABASE_URL=postgresql://user:pass@host:5432/db

# Optional (demo mode without Redis)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=secret

# Application
PORT=3000
NODE_ENV=production
```

### **Production Checklist**

- ✅ PostgreSQL database configured
- ✅ Redis instance running (optional)
- ✅ Environment variables set
- ✅ Build process: `npm run build`
- ✅ Health checks configured
- ✅ Logging configured
- ✅ Monitoring enabled

---

## 🎯 Demo Value & Architecture Showcase

### **Co Demo Pokazuje**

**Architektura ESB dla problemu startup e-commerce:**

- 🏭 Legacy warehouse system (CSV files) - **SYMULACJA**
- 💰 External invoicing API - **SYMULACJA**
- 👥 Marketing CRM system - **SYMULACJA**
- 🛒 Marketplace integrations - **SYMULACJA**

**Demo nie rozwiązuje problemu** - **pokazuje jak by go rozwiązać**.

### **Key Demo Features**

- ⚡ **Async Processing Architecture** - Kolejki ESB
- 🔄 **Retry Logic Pattern** - Automatic error recovery simulation
- 📊 **Monitoring Pattern** - Health checks i status tracking
- 🏗️ **Modular Design** - Adapters + orchestrator pattern
- 🛡️ **Error Handling** - Graceful failures with retry
- 📈 **Orchestration** - Business flow management

### **Demo vs Real Implementation**

| Aspekt         | Demo                | Prawdziwa Implementacja        |
| -------------- | ------------------- | ------------------------------ |
| **Demo Mode**  | Out of the box      | External dependencies required |
| **Adaptery**   | Symulują API calls  | Prawdziwe REST/FTP integration |
| **Kolejki**    | BullMQ w pamięci    | Redis cluster + workers        |
| **Baza**       | Opcjonalna          | Wymagana + migrations          |
| **Monitoring** | Basic health checks | ELK Stack + alerting           |
| **Security**   | Brak                | OAuth + rate limiting          |
| **Deployment** | Local development   | Docker + K8s                   |

**🎯 Cel Demo:** Proof of Concept architektury ESB + portfolio showcase

---

## 👨‍💻 Developer Experience - Demo

### **Demo Code Quality**

- 📝 **TypeScript** - Type safety i IntelliSense
- 📖 **Comprehensive comments** - Each file explains ESB patterns
- 🏗️ **Clean architecture** - Separation of concerns showcase
- 📏 **Right-sized files** - 37-235 lines per file (interview-friendly)
- 🎯 **Demo mode** - Works without external dependencies

### **Demo API Experience**

- 📚 **Swagger UI** - Interactive documentation (localhost:3000/api)
- 🔗 **Correlation IDs** - Request tracing pattern
- 🏥 **Health checks** - System status visibility
- 🎮 **Demo endpoints** - Easy testing (`/orders/demo`, `/inventory/sync/demo`)

### **Demo Debugging**

- 📋 **Structured logging** - Console logs show ESB flow
- 🔍 **Correlation tracking** - Follow requests across services
- 💡 **Descriptive errors** - Clear error messages in simulation
- 📊 **Queue statistics** - Visibility into demo processing

---

## 🤝 Demo Info & Purpose

Ten projekt to **demonstration ESB architecture** - Proof of Concept dla recruitment/portfolio.

**Demo design decisions:**

- ✅ Demo mode works without external dependencies
- ✅ Each file is self-documenting with Polish comments
- ✅ Clean, readable code optimized for technical interviews
- ✅ Real-world enterprise patterns (orchestrator, adapters, queues)
- ✅ Professional-grade error handling simulation

**🎯 Używaj tego demo do:**

- Zrozumienia architektury ESB
- Testowania API patterns
- Portfolio/recruitment showcase
- Learning enterprise integration patterns

---

## 📞 Demo Support

**Demo endpoints:**

- API Documentation: http://localhost:3000/api
- Health Status: http://localhost:3000/health
- Queue Stats: http://localhost:3000/queues/stats

**Demo requirements:**

- Node.js 18+
- npm install && npm run start:dev
- **That's it!** - No database, no Redis, no external systems needed

**Quick demo test:**

```bash
curl http://localhost:3000/health              # Check demo status
curl -X POST http://localhost:3000/orders/demo # Test full order flow
curl http://localhost:3000/adapters/health     # Test all adapters
curl http://localhost:3000/queues/stats        # Check queue simulation
```

**🎯 Remember:** This is a DEMO - shows architecture, not real integration!

---
