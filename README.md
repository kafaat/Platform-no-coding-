# Platform-no-coding-

## Dynamic Product System — نظام المنتجات الديناميكي

A no-code platform foundation for managing dynamic products across multiple types: Physical, Digital, Service, Reservation, and Financial.

### Key Capabilities

- **Dynamic Attributes**: EAV pattern with JSONB for flexible product configuration
- **Multi-type Products**: Physical (LOT/Serial), Digital, Service, Reservation (capacity), Financial (loans/credit)
- **Financial Contracts**: Loan origination, installment scheduling, interest calculation (Flat/Reducing), aging & penalties
- **Reservations**: Availability management, TTL-based holds, cancellation policies
- **Pricing Engine**: Multi-currency price lists, CEL-based rules, tax & discount composition
- **Numbering**: Atomic sequence generation with branch/channel isolation
- **Accounting**: Event-driven journal entries, IFRS 9 sub-ledger
- **Multi-tenancy**: Full data isolation with PostgreSQL RLS
- **Offline Support**: Offline-first architecture with sync (designed for low-connectivity environments)

### Architecture

- **Database**: PostgreSQL 15+ (JSONB, GIN, RLS, Partitioning)
- **Patterns**: CQRS, Event Sourcing, Saga, Maker-Checker, EAV
- **Rules**: CEL (Common Expression Language)
- **Security**: OAuth2/OIDC, RBAC/ABAC, AES-256 PII encryption
- **Observability**: OpenTelemetry, Grafana

### Quick Start

```bash
cp .env.example .env         # Configure environment
make up                      # Start PostgreSQL + Redis + Kafka
make db-shell                # Connect to database
```

### Documentation

| Document | Description |
|---|---|
| [CLAUDE.md](CLAUDE.md) | AI assistant guidance |
| [SRS V2.0](docs/SRS-v2.0.md) | Full requirements specification (15 use cases) |
| [API Spec](docs/api-specification.md) | REST API endpoints (all resources) |
| [OpenAPI 3.0](docs/openapi.yaml) | Machine-readable API specification (Swagger) |
| [Schema DDL](db/schema.sql) | PostgreSQL DDL + CQRS views + stored procedures |
| [Seed Data](db/seed.sql) | Reference data for initial setup |
| [Data Dictionary](docs/data-dictionary.md) | Field-level documentation for all tables |
| [Migrations](db/migrations/) | Versioned database migration scripts |
| [Interest Calculation](docs/interest-calculation.md) | Formulas, day count conventions, penalties |
| [Domain Events](docs/domain-events.md) | Event catalog with Kafka topics & payload schemas |
| [Security](docs/security.md) | OWASP, RBAC/ABAC, encryption, compliance |
| [Notifications](docs/notification-templates.md) | Bilingual SMS/Email/Push templates |
| [Testing Strategy](docs/testing-strategy.md) | Test plans, 60+ test cases, traceability |
| [Monitoring](monitoring/) | Grafana dashboards & Prometheus alerting rules |
| [UML Diagrams](docs/uml/) | PlantUML architecture diagrams (12 diagrams) |

### Roadmap

| Phase | Scope | Status |
|---|---|---|
| M1 | Product Core + Attributes + Pricing + Channels + API | Planned |
| M2 | BOM + Accounting + Charges | Planned |
| M3 | Reservations + Calendar | Planned |
| M4 | Financial Contracts + Sub-ledger + Eligibility | Planned |
| M5 | Audit + Event Sourcing + Offline | Planned |

---

> SRS V2.0 — 2026-02-09 — Draft for Review
