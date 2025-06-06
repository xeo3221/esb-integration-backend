# 🚀 API Integracji ESB - Demo E-commerce

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

### 🎯 **Core ESB Infrastructure**

- ✅ **4 Adaptery systemów** z retry logic i health checks (symulacja)
- ✅ **5 Kolejek BullMQ** w trybie demo (bez prawdziwego Redis)
- ✅ **PostgreSQL + Drizzle ORM** dla persistence (opcjonalnie)
- ✅ **Health monitoring** wszystkich symulowanych systemów
- ✅ **Demo mode** - wszystko działa bez zewnętrznych systemów

### 🔄 **Business Flows**

- ✅ **Order Processing Flow** - pełny flow przez 4 kolejki (symulowany)
- ✅ **Inventory Sync Flow** - batch + real-time synchronization logic
- ✅ **Orchestrator pattern** z tracking każdego kroku
- ✅ **Status monitoring** w real-time

### 🛠️ **Professional Features**

- ✅ **Swagger Documentation** - profesjonalna dokumentacja API
- ✅ **Correlation ID Middleware** - śledzenie requestów
- ✅ **Error handling** - graceful failures z retry logic
- ✅ **Modular architecture** - separacja odpowiedzialności
- ✅ **TypeScript** - type safety i developer experience

---

## 🚀 Szybki Start

```bash
npm install && npm run start:dev
curl http://localhost:3000/health  # Test demo
open http://localhost:3000/api     # Dokumentacja Swagger
```

**🎯 TRYB DEMO:** Wszystko działa "out of the box" - bez Redis, bez bazy danych, bez zewnętrznych systemów!

### Wymagania

- Node.js 18+
- npm/yarn
- **PostgreSQL** (Neon) - **OPCJONALNE** (demo działa bez bazy)
- **Redis** - **NIE POTRZEBNE** (demo mode)

### 1. Instalacja

```bash
git clone https://github.com/xeo3221/esb-integration-backend.git
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

### 3. Uruchomienie

```bash
# Development mode
npm run start:dev

# Aplikacja działa od razu bez dodatkowej konfiguracji!
```

### 4. Sprawdź czy działa

```bash
curl http://localhost:3000/health
# ✅ {"status":"ok","timestamp":"...","mode":"demo"}

# Otwórz dokumentację
open http://localhost:3000/api
```

---

## 📚 Dokumentacja API

### 🌐 **Interfejs Swagger**: `http://localhost:3000/api`

Pełna interaktywna dokumentacja z przykładami i testowaniem endpoints.

### 🔍 **Główne Endpoints**

#### **Stan Zdrowia i Monitoring**

```bash
GET  /health                    # Status aplikacji
GET  /health/database          # Status PostgreSQL
GET  /adapters/health          # Status wszystkich systemów
GET  /queues/stats             # Statystyki kolejek ESB
```

#### **Przepływ Przetwarzania Zamówień** 🛒

```bash
POST /orders/demo              # Demo zamówienie (laptop + mysz)
POST /orders                   # Nowe zamówienie (custom)
GET  /orders/:orderId          # Status zamówienia
GET  /orders                   # Lista zamówień
```

#### **Przepływ Synchronizacji Zapasów** 📦

```bash
POST /inventory/sync/demo      # Demo synchronizacja
POST /inventory/sync           # Synchronizacja magazynu
GET  /inventory/sync/:syncId   # Status synchronizacji
GET  /inventory/sync           # Lista synchronizacji
```

#### **Testowanie Systemów** 🔧

```bash
GET  /adapters/info            # Info o systemach
GET  /adapters/test-operations # Test operacji adapterów
POST /test/warehouse-sync      # Test kolejki magazynu
```

---

## 🎮 Scenariusze Testowania - Symulowane Przepływy

### 1. 🛒 **Symulacja Przetwarzania Zamówień**

**Co demo pokazuje:** Pełną orkiestrację ESB przez wszystkie 4 systemy (magazyn → faktury → CRM → marketplace)

**Uwaga:** Wszystkie operacje są symulowane i logowane - brak prawdziwych integracji z zewnętrznymi systemami.

```bash
# Utwórz zamówienie
curl -X POST http://localhost:3000/orders/demo
```

### 2. 📦 **Inventory Sync**

```bash
# Uruchom synchronizację
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

### 3. 🏥 **Health Check**

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

## 🏭 Przepływy Biznesowe

### 🛒 **Order Processing Flow**

**Co faktycznie działa:**

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

**Co pokazuje:**

- ✅ Pełną orchestrację przez kolejki ESB
- ✅ Status tracking każdego kroku
- ✅ Error handling i retry logic (symulowany)
- ✅ Correlation ID przez cały flow

### 📦 **Inventory Sync Flow (Częściowo)**

**Co mamy:**

```
Trigger → POST /inventory/sync/demo → Basic Endpoint
    ↓
STATUS: Tylko podstawowy endpoint - brak pełnego flow
```

**Demo pokazuje:**

- ✅ Endpoint structure i response format
- ⚠️ Brak pełnej implementacji sync logic
- 🎯 Proof of concept dla architektury

### 🎯 **Co Faktycznie Testuje:**

| Funkcjonalność    | Status               | Co Możesz Przetestować            |
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

- **BullMQ** - Robust job/message queue (**DEMO: symulowane w pamięci**)
- **Redis** - In-memory storage dla kolejek (**DEMO: nie używane**)

### **API & Documentation**

- **Swagger/OpenAPI** - Interactive API documentation
- **REST API** - Standard HTTP/JSON endpoints

### **Monitoring & Observability**

- **Correlation ID** - Request tracking across services
- **Health Checks** - System status monitoring
- **Structured Logging** - Comprehensive operation logs (**DEMO: główny sposób debugowania**)

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
│   ├── queues/             # Kolejki ESB i procesory (DEMO MODE)
│   │   ├── processors/
│   │   │   └── warehouse.processor.ts # Worker dla kolejki magazynu (NIE UŻYWANE)
│   │   ├── queue.service.ts          # Symulacja kolejek (demo mode)
│   │   ├── queue.constants.ts        # Nazwy kolejek
│   │   └── queues.module.ts          # Moduł kolejek (bez Redis)
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
│   │   └── redis.config.ts            # Redis config (demo: nie używane)
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

# Test order flow (symulowany)
curl -X POST http://localhost:3000/orders/demo

# Test inventory sync (symulowany)
curl -X POST http://localhost:3000/inventory/sync/demo

# Test adapters (symulowane)
curl http://localhost:3000/adapters/health

# Sprawdź "statystyki" kolejek (fake)
curl http://localhost:3000/queues/stats
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

## 🎯 Wartość Projektu

### **Co Pokazuje**

**Architektura ESB dla problemu startup e-commerce:**

- 🏭 Legacy warehouse system (CSV files) - **SYMULACJA**
- 💰 External invoicing API - **SYMULACJA**
- 👥 Marketing CRM system - **SYMULACJA**
- 🛒 Marketplace integrations - **SYMULACJA**

**Projekt nie rozwiązuje problemu** - **pokazuje jak by go rozwiązać**.

### **Key Features**

- ⚡ **Async Processing Architecture** - Kolejki ESB
- 🔄 **Retry Logic Pattern** - Automatic error recovery simulation
- 📊 **Monitoring Pattern** - Health checks i status tracking
- 🏗️ **Modular Design** - Adapters + orchestrator pattern
- 🛡️ **Error Handling** - Graceful failures with retry
- 📈 **Orchestration** - Business flow management

---

## ⚙️ Kolejki ESB

**UWAGA:** Kolejki działają w trybie symulacji.

- ✅ **Struktura BullMQ** - prawidłowa architektura kolejek
- ⚠️ **Redis nie używany** - działa bez external dependencies
- ⚠️ **Jobs symulowane** - zadania logowane ale nie wykonywane async

```bash
curl http://localhost:3000/queues/stats  # Fake stats, prawdziwa struktura
```

---
