# E-commerce ESB Integration Project

## Opis projektu

Enterprise Service Bus (ESB) do integracji systemów e-commerce:

- System magazynowy (bez API)
- System fakturowania (REST API)
- CRM do marketingu (REST API)
- Platforma marketplace (REST API)

## Aktualny stan projektu

### TODO Lista

#### ✅ **Podstawowa infrastruktura (GOTOWE)**

- [x] Stwórz backend (Nest.js + TypeScript)
- [x] Skonfiguruj Drizzle ORM i połączenie z Neon (PostgreSQL)
- [x] Skonfiguruj kolejki BullMQ/Redis do obsługi przepływów
- [x] Zaimplementuj adaptery do wszystkich systemów:
  - [x] System magazynowy (file polling/DB access)
  - [x] System fakturowania (REST API)
  - [x] CRM (REST API)
  - [x] Marketplace (REST API, webhooki)
- [x] Retry logic (3 próby z exponential backoff)
- [x] Prosty circuit breaker (timeout + retry)
- [x] Health checki (baza, Redis, adaptery)

#### ✅ **Główne przepływy ESB (DEMO GOTOWE)**

- [x] **Order Processing Flow** - przetwarzanie zamówień przez wszystkie systemy
  - [x] REST API do przyjmowania zamówień
  - [x] Orchestrator workflow (inventory → invoice → CRM → marketplace)
  - [x] Tracking statusu każdego kroku
  - [x] Demo endpoint z przykładowym zamówieniem

#### 🚧 **Główne przepływy ESB (TODO)**

- [ ] Synchronizacja stanów magazynowych (inventory sync flow)
- [ ] Wymiana danych o klientach (customer data flow)

#### 🔧 **Walidacja i jakość kodu (TODO)**

- [ ] Walidacja danych (Zod)
- [ ] Logowanie (Pino/Winston) + Correlation ID
- [ ] Dead letter queue (oznaczenie w bazie lub osobna kolejka)
- [ ] Testy (Jest)
- [ ] Dokumentacja API (Swagger)

#### 🚀 **Deployment (TODO)**

- [ ] Wdróż aplikację na Railway

## Uruchomienie

```bash
# Instalacja zależności
npm install

# Skopiuj przykładową konfigurację
cp .env.example .env
# Edytuj .env i dodaj DATABASE_URL z Neon

# Uruchomienie w trybie deweloperskim
npm run start:dev

# Budowanie projektu
npm run build

# Uruchomienie w trybie produkcyjnym
npm run start:prod
```

## Baza danych

```bash
# Generowanie migracji
npm run db:generate

# Uruchamianie migracji
npm run db:migrate

# Push schematu do bazy (dev)
npm run db:push

# Drizzle Studio (GUI)
npm run db:studio
```

## Endpointy

### Podstawowe

- `GET /` - Informacje o API
- `GET /health` - Status zdrowia aplikacji
- `GET /health/database` - Status połączenia z bazą danych

### Kolejki ESB

- `GET /queues/stats` - Statystyki kolejek ESB
- `POST /test/warehouse-sync` - Test kolejki magazynu

### Adaptery systemowe

- `GET /adapters/health` - Health check wszystkich systemów ESB
- `GET /adapters/info` - Informacje o wszystkich systemach
- `GET /adapters/test-operations` - Test operacji każdego adaptera

### 🆕 Order Processing Flow (DEMO)

- `POST /orders/demo` - Utworzenie demo zamówienia (Laptop + mysz)
- `POST /orders` - Przyjęcie nowego zamówienia (custom data)
- `GET /orders/:orderId` - Status konkretnego zamówienia
- `GET /orders` - Lista wszystkich zamówień (dev purpose)

**Demo Flow:**

```
1. POST /orders/demo → tworzy zamówienie
2. Kolejka inventory → sprawdza/rezerwuje produkty
3. Kolejka invoice → generuje fakturę
4. Kolejka CRM → dodaje klienta + wysyła email
5. Kolejka marketplace → aktualizuje status zamówienia
```

**Przykład response:**

```json
{
  "orderId": "order-1234567890",
  "status": "processing",
  "steps": [
    { "step": "inventory", "status": "queued", "jobId": "demo-123" },
    { "step": "invoice", "status": "pending" },
    { "step": "crm", "status": "pending" },
    { "step": "marketplace", "status": "pending" }
  ]
}
```

## Konfiguracja

Skopiuj `.env.example` do `.env` i uzupełnij:

- `DATABASE_URL` - URL połączenia z bazą Neon (wymagane)
- `REDIS_HOST` - Host Redis dla kolejek (opcjonalne, domyślnie tryb demo)

## Systemy kolejek

Aplikacja może działać w dwóch trybach:

- **Z Redis**: Pełne kolejki BullMQ z persystencją
- **Tryb demo**: Bez Redis, operacje logowane w konsoli (dla development)

## Adaptery systemowe

ESB integruje 4 systemy poprzez adaptery:

1. **WarehouseAdapter** - System magazynowy (symuluje CSV/FTP/baza danych)
2. **InvoiceAdapter** - System fakturowania (REST API)
3. **CrmAdapter** - System CRM (REST API)
4. **MarketplaceAdapter** - Platforma marketplace (REST API)

Każdy adapter wspiera:

- Test połączenia
- Informacje o systemie
- Retry logic z exponential backoff
- Timeout handling
- Comprehensive logging
