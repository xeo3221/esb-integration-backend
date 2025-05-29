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
- [ ] Zaimplementuj adaptery do wszystkich systemów (magazyn, fakturowanie, CRM, marketplace)
- [ ] Skonfiguruj kolejki BullMQ/Redis do obsługi przepływów
- [ ] Dodaj walidację, logowanie i testy
- [ ] Wdróż aplikację na Railway

## Uruchomienie

```bash
# Instalacja zależności
npm install

# Uruchomienie w trybie deweloperskim
npm run start:dev

# Budowanie projektu
npm run build

# Uruchomienie w trybie produkcyjnym
npm run start:prod
```
