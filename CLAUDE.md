# CLAUDE.md

This file provides guidance for AI assistants working with the **Platform-no-coding-** repository.

## Project Overview

**Platform-no-coding-** is a **Dynamic Product System** — a no-code platform foundation that manages product classification, dynamic attributes, pricing, channels, numbering, accounting, composition, inventory, eligibility, charges, schedules, financial contracts, and reservations.

The system is designed as a **unified kernel** serving multiple product types through type-specific extensions, with **Multi-tenancy** support for SaaS operation.

### Supported Product Types

| Type | Code | Description |
|---|---|---|
| Physical | `PHYSICAL` | Stored products with LOT/Serial tracking |
| Digital | `DIGITAL` | Software, subscriptions, licenses |
| Service | `SERVICE` | Professional and consulting services |
| Reservation | `RESERVATION` | Hotels, halls, appointments (capacity-based) |
| Financial | `FINANCIAL` | Loans, credit lines, limits, financing |

### Key Standards

- **ISO 20022**: Financial message structure
- **IFRS 9**: Financial instrument accounting
- **OWASP Top 10**: Application security
- **OpenTelemetry**: Observability

## Repository Structure

```
Platform-no-coding-/
├── CLAUDE.md                          # AI assistant guidance (this file)
├── README.md                          # Project overview
├── db/
│   └── schema.sql                     # Full DDL — PostgreSQL 15+ (40+ tables)
└── docs/
    ├── SRS-v2.0.md                    # Complete SRS document
    ├── api-specification.md           # REST API specification
    └── uml/
        ├── use-case.puml              # Use case diagram
        ├── class-diagram.puml         # Core class diagram
        ├── sequence-contract.puml     # Loan contract creation sequence
        ├── state-contract.puml        # Contract state machine
        ├── activity-reservation.puml   # Reservation lifecycle activity
        ├── component-diagram.puml     # Service components
        └── deployment-diagram.puml    # Infrastructure deployment
```

## Architecture

### Design Patterns

- **EAV (Entity-Attribute-Value)**: Dynamic attributes with typed columns + JSONB indexing
- **CQRS**: Separate read/write paths for scalability
- **Event Sourcing**: Full audit trail for financial contracts
- **Saga Pattern**: Distributed transaction coordination (contract creation)
- **Maker-Checker**: Dual approval for product activation
- **Effective Dating**: Version validity periods with overlap prevention

### Service Components

| Service | Responsibility |
|---|---|
| **Product Kernel** | Core product CRUD, versioning, categories |
| **Attributes Engine** | EAV storage, validation, JSON Schema |
| **Pricing Service** | Price lists, CEL rules, tax/discount calculation |
| **Numbering Service** | Atomic sequence generation, gap management |
| **Accounting Mapper** | Event-driven journal entries, sub-ledger |
| **Contracts Service** | Financial contracts, installments, payments |
| **Reservations Service** | Availability, hold/confirm/cancel with TTL |
| **Event Bus** | Async domain events (Kafka/RabbitMQ) |

### Technology Stack (Planned)

- **Database**: PostgreSQL 15+ (JSONB, GIN indexes, RLS, Partitioning)
- **Cache**: Redis (pricing, sessions)
- **Message Queue**: Kafka or RabbitMQ
- **Rules Engine**: CEL (Common Expression Language)
- **Container**: Kubernetes
- **Auth**: OAuth2/OIDC + RBAC/ABAC
- **Monitoring**: OpenTelemetry + Grafana

### Multi-tenancy

- Every table includes `tenant_id` column
- Row Level Security (RLS) enforces data isolation
- Per-tenant configuration (branding, limits, policies)

## Database Schema

The full DDL is in `db/schema.sql`. Key entity groups:

1. **Foundation**: `tenant`, `customer`
2. **Products**: `product_category`, `product`, `product_version`
3. **Attributes**: `attribute_definition`, `attribute_set`, `attribute_value` (EAV)
4. **Units/Composition**: `uom`, `product_composition` (BOM/Bundle)
5. **Numbering**: `numbering_scheme`, `numbering_sequence`, `product_identifier`
6. **Pricing**: `price_list`, `price_list_product`, `price_rule` (CEL)
7. **Channels**: `channel`, `product_channel` (feature flags)
8. **Charges**: `charge`, `product_charge_link`
9. **Accounting**: `accounting_template`, `product_accounting_map`
10. **Eligibility**: `eligibility_rule`, `document_requirement`, `collateral_requirement`
11. **Contracts**: `contract`, `installment`, `payment_event`, `penalty_event`, `subledger_entry`
12. **Reservations**: `reservation`, `cancellation_policy`
13. **Audit**: `audit_log`, `state_transition`, `domain_event`

### Key Constraints & Rules

- Product versions: no date overlap (enforced via trigger)
- Contract status: `DRAFT → ACTIVE → IN_ARREARS/RESTRUCTURED/WRITTEN_OFF → CLOSED`
- Product status: `DRAFT → ACTIVE → SUSPENDED/RETIRED`
- Reservation status: `HOLD → CONFIRMED/EXPIRED → CANCELLED/COMPLETED`
- Idempotency keys on `payment_event` and `subledger_entry`
- All monetary fields: `NUMERIC(18,2)` with CHECK > 0

## API Conventions

Full spec in `docs/api-specification.md`.

### Required Headers

| Header | Required | Description |
|---|---|---|
| `Authorization` | Always | `Bearer <token>` |
| `X-Tenant-ID` | Always | Tenant isolation |
| `X-Idempotency-Key` | Write ops | Prevent duplicates |

### URL Pattern

- Base: `/api/v1/`
- Versioning: URL-based (`/v1/`, `/v2/`)
- Pagination: `?page=1&size=20`

### Key Endpoints

- `POST /api/v1/products` — Create product (Draft)
- `POST /api/v1/pricing/quote` — Get price quote
- `POST /api/v1/numbering/reserve` — Reserve sequence number
- `POST /api/v1/contracts` — Create financial contract
- `POST /api/v1/contracts/{id}/payments` — Record payment
- `GET /api/v1/reservations/availability` — Check availability
- `POST /api/v1/reservations` — Create reservation (HOLD)

## Business Rules

| Rule | Description |
|---|---|
| BR-01 | No overlapping versions for the same product |
| BR-02 | Cannot activate channel without active pricing |
| BR-03 | No installments before mandatory documents complete |
| BR-04 | No loan disbursement before reserving contract number |
| BR-07 | Maker-Checker: different user must approve activation |
| BR-08 | Aging escalation: 30d→alert, 60d→escalate, 90d→suspend, 180d+→write-off |
| BR-09 | Cannot delete category with active products (disable only) |
| BR-10 | Temporary holds auto-expire after TTL |
| BR-11 | Every payment must carry unique idempotency key |
| BR-12 | Tenant data isolation — no cross-tenant access |

## Development Workflow

### Git

- **Default branch**: `main`
- **Remote**: origin
- Feature branches: `claude/<description>-<id>`

### Branching Strategy

1. Create a feature branch from `main`
2. Make changes and commit with clear, descriptive messages
3. Push to origin and open a pull request against `main`

## Conventions

### General

- Keep commits focused and atomic
- Prefer editing existing files over creating new ones
- Do not commit secrets, credentials, or environment-specific configuration
- All text fields support bilingual (Arabic/English): `name_ar`, `name_en`
- RTL layout support required for Arabic UI

### Database

- Every tenant-scoped table must include `tenant_id`
- Use JSONB for flexible/extensible data (policies, settings, meta)
- Add CHECK constraints for enums and value ranges
- Use `TIMESTAMPTZ` for all timestamps
- Create indexes on foreign keys and common query patterns

### API

- REST with JSON responses
- Consistent error format with `code`, `message`, `details`
- Idempotency keys for all write operations
- Pagination on all list endpoints

### Localization

- Currencies: YER, USD, SAR
- Calendars: Hijri and Gregorian
- Languages: Arabic (primary), English

## NFR Targets

| Area | Target |
|---|---|
| Latency (95p) | ≤200ms pricing/attributes, ≤400ms numbering |
| Concurrency | 500 concurrent users |
| Throughput | 1000 TPS read, 200 TPS write |
| Availability | 99.9% read, 99.5% write |
| Recovery | RPO ≤1h, RTO ≤4h |
| Data Volume | 100K products, 1M contracts, 10M installments |
| Retention | 7 years financial, 3 years audit |
| Offline | Offline-first with sync (critical for Yemen) |

## Roadmap

| Phase | Duration | Scope |
|---|---|---|
| **M1** | 3 months | Product Core + Attributes + Pricing + Channels + API |
| **M2** | 2 months | BOM + Accounting + Charges |
| **M3** | 2 months | Reservations + Calendar |
| **M4** | 3 months | Financial Contracts + Sub-ledger + Eligibility |
| **M5** | 2 months | Audit + Event Sourcing + Offline |

## Reference Documents

- [SRS V2.0](docs/SRS-v2.0.md) — Complete requirements specification
- [API Specification](docs/api-specification.md) — REST API details
- [Database Schema](db/schema.sql) — Full PostgreSQL DDL
- [UML Diagrams](docs/uml/) — PlantUML source files
