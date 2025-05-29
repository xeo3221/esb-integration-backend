# E-commerce ESB Integration Project

## Opis projektu

Enterprise Service Bus (ESB) do integracji systemów e-commerce:

- System magazynowy (bez API)
- System fakturowania (REST API)
- CRM do marketingu (REST API)
- Platforma marketplace (REST API)

## Aktualny stan projektu

### TODO Lista (Prosta)

- [x] Stwórz backend (Nest.js + TypeScript)
- [x] Skonfiguruj Drizzle ORM i połączenie z Neon (PostgreSQL)
- [x] Skonfiguruj kolejki BullMQ/Redis do obsługi przepływów
- [x] Zaimplementuj adaptery do wszystkich systemów (magazyn, fakturowanie, CRM, marketplace)
- [ ] Dodaj walidację, logowanie i testy
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
