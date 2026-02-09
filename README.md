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

### Documentation

| Document | Description |
|---|---|
| [CLAUDE.md](CLAUDE.md) | AI assistant guidance |
| [SRS V2.0](docs/SRS-v2.0.md) | Full requirements specification |
| [API Spec](docs/api-specification.md) | REST API endpoints |
| [Schema DDL](db/schema.sql) | PostgreSQL database schema |
| [UML Diagrams](docs/uml/) | PlantUML architecture diagrams |

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
