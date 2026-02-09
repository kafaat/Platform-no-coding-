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
├── .gitignore                         # Git ignore rules
├── .env.example                       # Environment variables template
├── docker-compose.yml                 # Development environment (PG+Redis+Kafka)
├── Makefile                           # Development workflow commands
├── .github/
│   └── workflows/
│       ├── ci.yml                     # CI pipeline (SQL, docs, UML, security)
│       └── deploy.yml                 # Deployment pipeline (staging/production)
├── db/
│   ├── schema.sql                     # Full DDL + views + procedures (PostgreSQL 15+)
│   ├── seed.sql                       # Reference/seed data for initial setup
│   └── migrations/
│       ├── README.md                  # Migration strategy & conventions
│       ├── 000_schema_migrations.sql  # Migration tracking table
│       ├── 001_initial_schema.sql     # Baseline marker
│       ├── 002_add_notification_preferences.sql
│       └── 003_add_notification_log.sql
├── monitoring/
│   ├── README.md                      # Monitoring architecture & setup
│   ├── grafana/
│   │   └── dashboards/
│   │       └── dps-overview.json      # Business & infrastructure dashboard
│   └── prometheus/
│       └── alerts.yml                 # Alerting rules (API, business, infra)
└── docs/
    ├── SRS-v2.0.md                    # Complete SRS document (15 use cases)
    ├── api-specification.md           # REST API specification (all endpoints)
    ├── openapi.yaml                   # OpenAPI 3.0 machine-readable spec
    ├── interest-calculation.md        # Interest formulas & day count conventions
    ├── domain-events.md               # Domain events catalog with payload schemas
    ├── security.md                    # Security & compliance (OWASP, RBAC, encryption)
    ├── notification-templates.md      # Bilingual notification templates (SMS/Email/Push)
    ├── testing-strategy.md            # Testing strategy with 60+ test cases
    ├── data-dictionary.md             # Field-level documentation for all tables
    └── uml/
        ├── use-case.puml              # Use case diagram
        ├── class-diagram.puml         # Core class diagram
        ├── sequence-contract.puml     # Loan contract creation sequence
        ├── sequence-reservation.puml  # Reservation flow sequence
        ├── state-contract.puml        # Contract state machine
        ├── state-product.puml         # Product lifecycle state machine
        ├── state-reservation.puml     # Reservation state machine
        ├── activity-reservation.puml  # Reservation lifecycle activity
        ├── activity-product.puml      # Product activation lifecycle
        ├── activity-loan.puml         # Loan contract lifecycle
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
14. **Snapshots**: `pricing_snapshot`, `attribute_snapshot` (point-in-time capture)
15. **CQRS Views**: `mv_product_catalog`, `mv_contract_portfolio`, `mv_aging_report`, `mv_revenue_summary`

### Stored Procedures

| Function | Purpose |
|---|---|
| `fn_generate_installments()` | Generate installment schedule (Flat/Reducing) |
| `fn_process_payment()` | Process payment with allocation & sub-ledger |
| `fn_update_aging_buckets()` | Update aging and apply penalties (scheduler) |
| `fn_calculate_early_settlement()` | Calculate early settlement amount |
| `fn_refresh_materialized_views()` | Refresh all CQRS read models |

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
- `GET /api/v1/categories` — List/manage product categories
- `GET /api/v1/attributes` — List/manage attribute definitions
- `GET /api/v1/channels` — List/manage distribution channels
- `GET /api/v1/charges` — List/manage charges & fees
- `GET /api/v1/customers` — List/manage customers
- `GET /api/v1/audit/logs` — Query audit trail

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

### Quick Start

```bash
cp .env.example .env         # Configure environment
make up                      # Start PostgreSQL + Redis + Kafka
make db-shell                # Connect to database
make logs                    # View service logs
make down                    # Stop services
```

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

- [SRS V2.0](docs/SRS-v2.0.md) — Complete requirements specification (15 use cases)
- [API Specification](docs/api-specification.md) — REST API details (all resource endpoints)
- [OpenAPI 3.0](docs/openapi.yaml) — Machine-readable API specification (Swagger)
- [Database Schema](db/schema.sql) — Full PostgreSQL DDL (45+ tables, views, procedures)
- [Seed Data](db/seed.sql) — Reference data for initial setup
- [Data Dictionary](docs/data-dictionary.md) — Field-level documentation for all tables
- [Migrations](db/migrations/) — Versioned database migration scripts
- [Interest Calculation](docs/interest-calculation.md) — Formulas, day count conventions, penalties
- [Domain Events](docs/domain-events.md) — Event catalog with payload schemas & Kafka topics
- [Security & Compliance](docs/security.md) — OWASP, RBAC/ABAC, encryption, audit
- [Notification Templates](docs/notification-templates.md) — Bilingual SMS/Email/Push templates
- [Testing Strategy](docs/testing-strategy.md) — Test plans, 60+ test cases, traceability
- [Monitoring](monitoring/) — Grafana dashboards & Prometheus alerts
- [UML Diagrams](docs/uml/) — PlantUML source files (12 diagrams)
