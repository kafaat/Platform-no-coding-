# Domain Events Catalog -- Dynamic Product System V2.0

## Table of Contents

1. [Overview](#1-overview)
2. [Event Envelope](#2-event-envelope)
3. [Product Events](#3-product-events)
4. [Contract Events (Event Sourced)](#4-contract-events-event-sourced)
5. [Reservation Events](#5-reservation-events)
6. [Customer Events](#6-customer-events)
7. [System Events](#7-system-events)
8. [Kafka Topics](#8-kafka-topics)
9. [Event Consumers](#9-event-consumers)
10. [Replay and Projection](#10-replay-and-projection)

---

## 1. Overview

The Dynamic Product System (DPS) uses **domain events** as the primary mechanism for inter-service communication, audit trails, and state reconstruction. Events represent facts that have occurred within the system and are immutable once published.

### Event Architecture

```
+-----------------+       +----------------+       +------------------+
| Command Handler | ----> | Domain Model   | ----> | Domain Event     |
+-----------------+       +----------------+       +------------------+
                                                          |
                          +-------------------------------+
                          |                               |
                    +-----v------+               +--------v--------+
                    | Event Store|               | Event Bus       |
                    | (Postgres) |               | (Kafka)         |
                    +-----+------+               +--------+--------+
                          |                               |
                    +-----v------+          +-------------+-----------+
                    | Replay /   |          |             |           |
                    | Projection |    +-----v---+  +------v--+  +----v------+
                    +------------+    |Pricing  |  |Notif.   |  |Accounting |
                                     |Service  |  |Service   |  |Mapper     |
                                     +---------+  +---------+  +-----------+
```

### Event Sourcing

Financial contracts (`contract` aggregate) use **full event sourcing**. The `domain_event` table serves as the authoritative event store. Contract state is derived entirely by replaying events in sequence. All other aggregates (products, reservations, customers) publish domain events for integration but use traditional state-based persistence as the primary source of truth.

### Event Bus

Apache Kafka serves as the event bus with the following guarantees:

| Property | Guarantee |
|---|---|
| Delivery | At-least-once |
| Ordering | Per-partition (keyed by `aggregate_id`) |
| Retention | 30 days on hot topics, 7 years on `dps.audit` |
| Serialization | JSON with schema registry (Avro planned for V3) |
| Idempotency | Consumers must deduplicate using `event_id` |

### Persistence

Every domain event is persisted to the `domain_event` table before publishing to Kafka (transactional outbox pattern):

```sql
CREATE TABLE domain_event (
  id             BIGSERIAL PRIMARY KEY,
  tenant_id      BIGINT NOT NULL,
  aggregate_type TEXT NOT NULL,
  aggregate_id   BIGINT NOT NULL,
  event_type     TEXT NOT NULL,
  payload        JSONB NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_event_aggregate
  ON domain_event(aggregate_type, aggregate_id, created_at);
```

---

## 2. Event Envelope

Every event published to Kafka or stored in the event store follows a standard envelope format. The envelope carries routing metadata while the `payload` field contains the event-specific data.

### Envelope Schema

| Field | Type | Required | Description |
|---|---|---|---|
| `event_id` | UUID | Yes | Globally unique event identifier (idempotency key for consumers) |
| `event_type` | string | Yes | Fully qualified event name (e.g., `ProductCreated`, `PaymentReceived`) |
| `aggregate_type` | string | Yes | Aggregate root type: `Product`, `Contract`, `Reservation`, `Customer`, `Tenant` |
| `aggregate_id` | integer | Yes | Identifier of the aggregate instance |
| `tenant_id` | integer | Yes | Tenant scope for multi-tenancy isolation (BR-12) |
| `timestamp` | ISO 8601 | Yes | When the event occurred (`TIMESTAMPTZ`) |
| `version` | integer | Yes | Aggregate version number (monotonically increasing per aggregate instance) |
| `correlation_id` | UUID | Yes | Traces a chain of related events back to the originating command or API request |
| `caused_by` | UUID | No | `event_id` of the event that caused this event (causal chain) |
| `actor` | string | No | User or system principal that triggered the event |
| `payload` | object | Yes | Event-specific data (varies by `event_type`) |

### Envelope JSON Example

```json
{
  "event_id": "e8a1f4c2-7b3d-4e9a-b5c6-1a2d3e4f5678",
  "event_type": "ProductCreated",
  "aggregate_type": "Product",
  "aggregate_id": 123,
  "tenant_id": 1,
  "timestamp": "2026-02-09T12:00:00.000Z",
  "version": 1,
  "correlation_id": "c0a80101-0000-1000-8000-00805f9b34fb",
  "caused_by": null,
  "actor": "user-456",
  "payload": {
    "product_id": 123,
    "type": "FINANCIAL",
    "name_ar": "قرض شخصي",
    "name_en": "Personal Loan",
    "category_id": 5
  }
}
```

### Versioning Strategy

Events are versioned at the aggregate level. The `version` field represents the ordinal position of the event within the aggregate's lifecycle. For event-sourced aggregates (contracts), the version is used for optimistic concurrency control:

- Before appending a new event, the expected version must match the current aggregate version.
- Conflicting writes result in a `409 CONFLICT` response.

When the event schema itself evolves, a new `event_type` name is introduced (e.g., `ProductCreatedV2`) rather than modifying the existing schema. Consumers must handle unknown fields gracefully (forward compatibility).

---

## 3. Product Events

Product events track the full lifecycle of products from creation through retirement. These events are published to the `dps.products` Kafka topic and stored in the `domain_event` table. Products use traditional state-based persistence; events serve integration and audit purposes.

### 3.1 ProductCreated

Emitted when a new product is created in `DRAFT` status.

**Trigger**: `POST /api/v1/products`

```json
{
  "event_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "event_type": "ProductCreated",
  "aggregate_type": "Product",
  "aggregate_id": 123,
  "tenant_id": 1,
  "timestamp": "2026-02-09T12:00:00.000Z",
  "version": 1,
  "correlation_id": "req-abc-001",
  "caused_by": null,
  "actor": "user-456",
  "payload": {
    "product_id": 123,
    "type": "PHYSICAL",
    "name_ar": "منتج تجريبي",
    "name_en": "Test Product",
    "category_id": 5,
    "divisible": false,
    "status": "DRAFT"
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `product_id` | integer | Unique product identifier |
| `type` | enum | `PHYSICAL`, `DIGITAL`, `SERVICE`, `RESERVATION`, `FINANCIAL` |
| `name_ar` | string | Arabic product name |
| `name_en` | string | English product name |
| `category_id` | integer | Parent category reference |
| `divisible` | boolean | Whether the product supports fractional quantities |
| `status` | string | Always `DRAFT` at creation |

---

### 3.2 ProductVersionAdded

Emitted when a new version is added to a product. Trigger `trg_version_no_overlap` enforces no date overlap (BR-01).

**Trigger**: `POST /api/v1/products/{id}/versions`

```json
{
  "event_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "event_type": "ProductVersionAdded",
  "aggregate_type": "Product",
  "aggregate_id": 123,
  "tenant_id": 1,
  "timestamp": "2026-02-09T12:30:00.000Z",
  "version": 2,
  "correlation_id": "req-abc-002",
  "caused_by": null,
  "actor": "user-456",
  "payload": {
    "product_id": 123,
    "version_id": 5,
    "version_no": 2,
    "effective_from": "2026-03-01",
    "effective_to": "2026-12-31",
    "data": {
      "description": "Updated version with new pricing tier"
    }
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `product_id` | integer | Product identifier |
| `version_id` | integer | Unique version row identifier |
| `version_no` | integer | Sequential version number within the product |
| `effective_from` | date | Start of validity period (inclusive) |
| `effective_to` | date/null | End of validity period (exclusive); `null` means open-ended |
| `data` | object | Version-specific metadata (JSONB) |

---

### 3.3 ProductActivated

Emitted when a product transitions from `DRAFT` to `ACTIVE` after Maker-Checker approval (BR-07). The `approved_by` must differ from the product creator.

**Trigger**: `PUT /api/v1/products/{id}/status` with `status=ACTIVE`

```json
{
  "event_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "event_type": "ProductActivated",
  "aggregate_type": "Product",
  "aggregate_id": 123,
  "tenant_id": 1,
  "timestamp": "2026-02-09T14:00:00.000Z",
  "version": 3,
  "correlation_id": "req-abc-003",
  "caused_by": null,
  "actor": "user-789",
  "payload": {
    "product_id": 123,
    "approved_by": "user-789",
    "activated_at": "2026-02-09T14:00:00.000Z",
    "previous_status": "DRAFT"
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `product_id` | integer | Product identifier |
| `approved_by` | string | User who approved activation (must differ from creator per BR-07) |
| `activated_at` | ISO 8601 | Timestamp of activation |
| `previous_status` | string | Status before activation (always `DRAFT`) |

---

### 3.4 ProductSuspended

Emitted when a product is suspended. Suspended products remain visible but cannot be sold or used for new contracts/reservations.

**Trigger**: `PUT /api/v1/products/{id}/status` with `status=SUSPENDED`

```json
{
  "event_id": "d4e5f6a7-b8c9-0123-defa-234567890123",
  "event_type": "ProductSuspended",
  "aggregate_type": "Product",
  "aggregate_id": 123,
  "tenant_id": 1,
  "timestamp": "2026-06-15T09:00:00.000Z",
  "version": 4,
  "correlation_id": "req-abc-004",
  "caused_by": null,
  "actor": "user-456",
  "payload": {
    "product_id": 123,
    "reason": "Regulatory compliance review pending",
    "suspended_by": "user-456",
    "previous_status": "ACTIVE"
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `product_id` | integer | Product identifier |
| `reason` | string | Human-readable suspension reason |
| `suspended_by` | string | User who initiated the suspension |
| `previous_status` | string | Status before suspension (`ACTIVE`) |

---

### 3.5 ProductRetired

Emitted when a product is permanently retired. Retired products cannot be reactivated. Existing contracts and reservations remain unaffected.

**Trigger**: `PUT /api/v1/products/{id}/status` with `status=RETIRED`

```json
{
  "event_id": "e5f6a7b8-c9d0-1234-efab-345678901234",
  "event_type": "ProductRetired",
  "aggregate_type": "Product",
  "aggregate_id": 123,
  "tenant_id": 1,
  "timestamp": "2026-12-31T23:59:59.000Z",
  "version": 5,
  "correlation_id": "req-abc-005",
  "caused_by": null,
  "actor": "user-456",
  "payload": {
    "product_id": 123,
    "retired_at": "2026-12-31T23:59:59.000Z",
    "previous_status": "ACTIVE",
    "active_contracts_count": 42,
    "active_reservations_count": 0
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `product_id` | integer | Product identifier |
| `retired_at` | ISO 8601 | Timestamp of retirement |
| `previous_status` | string | Status before retirement (`ACTIVE` or `SUSPENDED`) |
| `active_contracts_count` | integer | Number of existing contracts (informational) |
| `active_reservations_count` | integer | Number of existing reservations (informational) |

---

### 3.6 PricingUpdated

Emitted when a product's pricing configuration changes (price list entry created or modified).

**Trigger**: `POST /api/v1/price-lists` or `PUT /api/v1/price-lists/{id}/products`

```json
{
  "event_id": "f6a7b8c9-d0e1-2345-fabc-456789012345",
  "event_type": "PricingUpdated",
  "aggregate_type": "Product",
  "aggregate_id": 123,
  "tenant_id": 1,
  "timestamp": "2026-02-10T08:00:00.000Z",
  "version": 6,
  "correlation_id": "req-abc-006",
  "caused_by": null,
  "actor": "user-456",
  "payload": {
    "product_id": 123,
    "price_list_id": 10,
    "base_price": 1000.00,
    "min_price": 800.00,
    "max_price": 1200.00,
    "currency": "YER",
    "valid_from": "2026-01-01",
    "valid_to": "2026-12-31"
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `product_id` | integer | Product identifier |
| `price_list_id` | integer | Price list reference |
| `base_price` | decimal | Base price (`NUMERIC(18,2)`) |
| `min_price` | decimal/null | Floor price |
| `max_price` | decimal/null | Ceiling price |
| `currency` | string | Currency code (`YER`, `USD`, `SAR`) |
| `valid_from` | date | Price list validity start |
| `valid_to` | date/null | Price list validity end |

---

### 3.7 ChannelEnabled

Emitted when a product is made available on a distribution channel. Requires active pricing for the channel (BR-02).

**Trigger**: `PUT /api/v1/products/{id}/channels`

```json
{
  "event_id": "a7b8c9d0-e1f2-3456-abcd-567890123456",
  "event_type": "ChannelEnabled",
  "aggregate_type": "Product",
  "aggregate_id": 123,
  "tenant_id": 1,
  "timestamp": "2026-02-10T09:00:00.000Z",
  "version": 7,
  "correlation_id": "req-abc-007",
  "caused_by": null,
  "actor": "user-456",
  "payload": {
    "product_id": 123,
    "channel_id": 1,
    "channel_code": "WEB",
    "limits": {
      "max_qty": 100,
      "max_price": 50000
    },
    "display": {
      "show_price": true,
      "show_stock": true
    },
    "feature_flags": {
      "new_ui": true
    }
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `product_id` | integer | Product identifier |
| `channel_id` | integer | Channel record identifier |
| `channel_code` | string | Channel code: `WEB`, `MOBILE`, `POS`, `API`, `USSD`, `IVR` |
| `limits` | object | Channel-specific quantity and price limits |
| `display` | object | Display configuration for the channel |
| `feature_flags` | object | Feature toggles for gradual rollout |

---

### 3.8 ChannelDisabled

Emitted when a product is removed from a distribution channel.

**Trigger**: `PUT /api/v1/products/{id}/channels` with `enabled=false`

```json
{
  "event_id": "b8c9d0e1-f2a3-4567-bcde-678901234567",
  "event_type": "ChannelDisabled",
  "aggregate_type": "Product",
  "aggregate_id": 123,
  "tenant_id": 1,
  "timestamp": "2026-06-01T10:00:00.000Z",
  "version": 8,
  "correlation_id": "req-abc-008",
  "caused_by": null,
  "actor": "user-456",
  "payload": {
    "product_id": 123,
    "channel_id": 3,
    "channel_code": "POS",
    "reason": "POS integration deprecated in favor of mobile",
    "disabled_at": "2026-06-01T10:00:00.000Z"
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `product_id` | integer | Product identifier |
| `channel_id` | integer | Channel record identifier |
| `channel_code` | string | Channel code being disabled |
| `reason` | string | Reason for disabling the channel |
| `disabled_at` | ISO 8601 | Timestamp of disablement |

---

## 4. Contract Events (Event Sourced)

Contract events form the **event-sourced stream** for financial contracts (loans, credit lines, limits). The `contract` aggregate's state is derived entirely by replaying these events in order. Every event is persisted to the `domain_event` table and published to the `dps.contracts` and `dps.payments` Kafka topics.

Contract status transitions follow a strict state machine:

```
DRAFT --> ACTIVE --> IN_ARREARS --> RESTRUCTURED --> CLOSED
                |                                     ^
                +--> CLOSED                           |
                |                                     |
                +--> IN_ARREARS --> WRITTEN_OFF -------+
```

### 4.1 ContractCreated

Emitted when a new financial contract is created. This is the first event in the contract's event stream (version 1). The contract starts in `DRAFT` status. Part of the Saga pattern (step 3).

**Trigger**: `POST /api/v1/contracts`

```json
{
  "event_id": "10000001-aaaa-bbbb-cccc-ddddeeee0001",
  "event_type": "ContractCreated",
  "aggregate_type": "Contract",
  "aggregate_id": 1001,
  "tenant_id": 1,
  "timestamp": "2026-02-09T10:00:00.000Z",
  "version": 1,
  "correlation_id": "saga-contract-001",
  "caused_by": null,
  "actor": "user-sales-01",
  "payload": {
    "contract_id": 1001,
    "customer_id": 200,
    "product_id": 50,
    "principal": 500000.00,
    "currency": "YER",
    "interest_type": "REDUCING",
    "day_count": "30E/360",
    "terms": {
      "duration_months": 12,
      "grace_period_days": 7,
      "penalty_rate": 2.5
    },
    "status": "DRAFT"
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `contract_id` | integer | Unique contract identifier |
| `customer_id` | integer | Customer reference |
| `product_id` | integer | Financial product reference |
| `principal` | decimal | Loan principal amount (`NUMERIC(18,2)`, must be > 0) |
| `currency` | string | Currency code (`YER`, `USD`, `SAR`) |
| `interest_type` | enum | `FLAT`, `REDUCING`, `FIXED_AMOUNT` |
| `day_count` | string | Day count convention: `30E/360`, `ACT/365`, `ACT/360` |
| `terms` | object | Contract terms (duration, grace period, penalty configuration) |
| `status` | string | Always `DRAFT` at creation |

---

### 4.2 ContractNumberReserved

Emitted when a unique contract number is reserved via the Numbering Service. This must occur before disbursement (BR-04). Part of the Saga pattern (step 2).

**Trigger**: `POST /api/v1/numbering/reserve` (within contract creation saga)

```json
{
  "event_id": "10000001-aaaa-bbbb-cccc-ddddeeee0002",
  "event_type": "ContractNumberReserved",
  "aggregate_type": "Contract",
  "aggregate_id": 1001,
  "tenant_id": 1,
  "timestamp": "2026-02-09T10:00:01.000Z",
  "version": 2,
  "correlation_id": "saga-contract-001",
  "caused_by": "10000001-aaaa-bbbb-cccc-ddddeeee0001",
  "actor": "system",
  "payload": {
    "contract_id": 1001,
    "contract_number": "FIN-LOAN-2026-001234",
    "scheme_id": 5,
    "scheme_code": "CONTRACT_NUM",
    "sequence_value": 1234,
    "reserved_until": "2026-02-09T11:00:00.000Z"
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `contract_id` | integer | Contract identifier |
| `contract_number` | string | Generated contract number (unique) |
| `scheme_id` | integer | Numbering scheme reference |
| `scheme_code` | string | Numbering scheme code |
| `sequence_value` | integer | Raw sequence counter value |
| `reserved_until` | ISO 8601 | Reservation expiry (must complete saga before this) |

---

### 4.3 DocumentsVerified

Emitted when all mandatory documents for a contract have been uploaded and verified. Installment generation is blocked until this event is emitted (BR-03).

**Trigger**: Internal verification process after document upload

```json
{
  "event_id": "10000001-aaaa-bbbb-cccc-ddddeeee0003",
  "event_type": "DocumentsVerified",
  "aggregate_type": "Contract",
  "aggregate_id": 1001,
  "tenant_id": 1,
  "timestamp": "2026-02-09T10:15:00.000Z",
  "version": 3,
  "correlation_id": "saga-contract-001",
  "caused_by": "10000001-aaaa-bbbb-cccc-ddddeeee0001",
  "actor": "user-compliance-01",
  "payload": {
    "contract_id": 1001,
    "documents": [
      {
        "doc_id": 10,
        "code": "NATIONAL_ID",
        "name": "National ID Card",
        "is_mandatory": true,
        "verified_at": "2026-02-09T10:10:00.000Z",
        "verified_by": "user-compliance-01"
      },
      {
        "doc_id": 11,
        "code": "SALARY_CERT",
        "name": "Salary Certificate",
        "is_mandatory": true,
        "verified_at": "2026-02-09T10:12:00.000Z",
        "verified_by": "user-compliance-01"
      },
      {
        "doc_id": 12,
        "code": "BANK_STATEMENT",
        "name": "Bank Statement (6 months)",
        "is_mandatory": false,
        "verified_at": "2026-02-09T10:14:00.000Z",
        "verified_by": "user-compliance-01"
      }
    ],
    "all_mandatory_complete": true
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `contract_id` | integer | Contract identifier |
| `documents` | array | List of verified documents |
| `documents[].doc_id` | integer | Document requirement reference |
| `documents[].code` | string | Document type code |
| `documents[].name` | string | Document type name |
| `documents[].is_mandatory` | boolean | Whether the document was required |
| `documents[].verified_at` | ISO 8601 | Verification timestamp |
| `documents[].verified_by` | string | Verifying user |
| `all_mandatory_complete` | boolean | Whether all mandatory documents are verified |

---

### 4.4 CollateralConfigured

Emitted when collateral requirements are satisfied for a contract (FR-092).

**Trigger**: Collateral registration during contract creation wizard

```json
{
  "event_id": "10000001-aaaa-bbbb-cccc-ddddeeee0004",
  "event_type": "CollateralConfigured",
  "aggregate_type": "Contract",
  "aggregate_id": 1001,
  "tenant_id": 1,
  "timestamp": "2026-02-09T10:20:00.000Z",
  "version": 4,
  "correlation_id": "saga-contract-001",
  "caused_by": "10000001-aaaa-bbbb-cccc-ddddeeee0003",
  "actor": "user-risk-01",
  "payload": {
    "contract_id": 1001,
    "collateral_type": "REAL_ESTATE",
    "coverage_ratio": 1.2500,
    "appraised_value": 750000.00,
    "required_coverage": 625000.00,
    "currency": "YER",
    "collateral_details": {
      "property_id": "PROP-2026-5678",
      "address": "Sana'a, Yemen",
      "appraisal_date": "2026-02-01"
    }
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `contract_id` | integer | Contract identifier |
| `collateral_type` | string | Collateral type (e.g., `CASH`, `GUARANTOR`, `REAL_ESTATE`, `VEHICLE`) |
| `coverage_ratio` | decimal | Coverage ratio (`NUMERIC(5,4)`, must be > 0) |
| `appraised_value` | decimal | Appraised value of collateral |
| `required_coverage` | decimal | Minimum coverage required (principal / coverage_ratio) |
| `currency` | string | Currency code |
| `collateral_details` | object | Type-specific collateral metadata |

---

### 4.5 ContractActivated

Emitted when a contract transitions from `DRAFT` to `ACTIVE`. This includes the initial disbursement. Part of the Saga pattern (step 6).

**Trigger**: `PUT /api/v1/contracts/{id}/status` with `status=ACTIVE`

```json
{
  "event_id": "10000001-aaaa-bbbb-cccc-ddddeeee0005",
  "event_type": "ContractActivated",
  "aggregate_type": "Contract",
  "aggregate_id": 1001,
  "tenant_id": 1,
  "timestamp": "2026-02-09T11:00:00.000Z",
  "version": 5,
  "correlation_id": "saga-contract-001",
  "caused_by": "10000001-aaaa-bbbb-cccc-ddddeeee0004",
  "actor": "user-approver-01",
  "payload": {
    "contract_id": 1001,
    "activated_at": "2026-02-09T11:00:00.000Z",
    "disbursement_amount": 500000.00,
    "disbursement_channel": "BANK_TRANSFER",
    "disbursement_reference": "TXN-2026-ABC-001",
    "currency": "YER",
    "previous_status": "DRAFT"
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `contract_id` | integer | Contract identifier |
| `activated_at` | ISO 8601 | Activation timestamp |
| `disbursement_amount` | decimal | Amount disbursed to customer |
| `disbursement_channel` | string | Channel used for disbursement |
| `disbursement_reference` | string | External transaction reference |
| `currency` | string | Currency code |
| `previous_status` | string | Status before activation (`DRAFT`) |

---

### 4.6 InstallmentScheduleGenerated

Emitted when the installment schedule is computed and persisted for a contract. Documents must be verified first (BR-03). Part of the Saga pattern (step 5).

**Trigger**: `POST /api/v1/contracts/{id}/schedule`

```json
{
  "event_id": "10000001-aaaa-bbbb-cccc-ddddeeee0006",
  "event_type": "InstallmentScheduleGenerated",
  "aggregate_type": "Contract",
  "aggregate_id": 1001,
  "tenant_id": 1,
  "timestamp": "2026-02-09T10:45:00.000Z",
  "version": 6,
  "correlation_id": "saga-contract-001",
  "caused_by": "10000001-aaaa-bbbb-cccc-ddddeeee0003",
  "actor": "system",
  "payload": {
    "contract_id": 1001,
    "template_id": 3,
    "installment_count": 12,
    "first_due": "2026-03-01",
    "last_due": "2027-02-01",
    "total_principal": 500000.00,
    "total_interest": 35000.00,
    "total_fees": 5000.00,
    "grand_total": 540000.00,
    "interest_type": "REDUCING",
    "day_count": "30E/360",
    "currency": "YER"
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `contract_id` | integer | Contract identifier |
| `template_id` | integer | Schedule template used |
| `installment_count` | integer | Total number of installments generated |
| `first_due` | date | Due date of the first installment |
| `last_due` | date | Due date of the last installment |
| `total_principal` | decimal | Sum of all principal amounts |
| `total_interest` | decimal | Sum of all interest amounts |
| `total_fees` | decimal | Sum of all fee amounts |
| `grand_total` | decimal | Total amount due over the life of the contract |
| `interest_type` | string | Interest calculation method |
| `day_count` | string | Day count convention used |
| `currency` | string | Currency code |

---

### 4.7 FundsDisbursed

Emitted when funds are released to the customer. This event triggers the initial sub-ledger entries (DR: Loan Receivable, CR: Cash).

**Trigger**: Disbursement step within contract activation

```json
{
  "event_id": "10000001-aaaa-bbbb-cccc-ddddeeee0007",
  "event_type": "FundsDisbursed",
  "aggregate_type": "Contract",
  "aggregate_id": 1001,
  "tenant_id": 1,
  "timestamp": "2026-02-09T11:00:05.000Z",
  "version": 7,
  "correlation_id": "saga-contract-001",
  "caused_by": "10000001-aaaa-bbbb-cccc-ddddeeee0005",
  "actor": "system",
  "payload": {
    "contract_id": 1001,
    "amount": 500000.00,
    "currency": "YER",
    "channel": "BANK_TRANSFER",
    "reference": "TXN-2026-ABC-001",
    "beneficiary_account": "IBAN-YE-XXXX-1234",
    "disbursed_at": "2026-02-09T11:00:05.000Z"
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `contract_id` | integer | Contract identifier |
| `amount` | decimal | Disbursed amount |
| `currency` | string | Currency code |
| `channel` | string | Disbursement channel (e.g., `BANK_TRANSFER`, `CASH`, `MOBILE_WALLET`) |
| `reference` | string | External transaction reference |
| `beneficiary_account` | string | Customer's receiving account |
| `disbursed_at` | ISO 8601 | Disbursement timestamp |

---

### 4.8 PaymentReceived

Emitted when a payment is recorded against a contract. Every payment must carry a unique `idempotency_key` (BR-11). Published to both `dps.contracts` and `dps.payments` topics.

**Trigger**: `POST /api/v1/contracts/{id}/payments`

```json
{
  "event_id": "10000001-aaaa-bbbb-cccc-ddddeeee0008",
  "event_type": "PaymentReceived",
  "aggregate_type": "Contract",
  "aggregate_id": 1001,
  "tenant_id": 1,
  "timestamp": "2026-03-01T09:30:00.000Z",
  "version": 8,
  "correlation_id": "req-pay-001",
  "caused_by": null,
  "actor": "user-teller-01",
  "payload": {
    "contract_id": 1001,
    "payment_id": 9001,
    "installment_id": 5001,
    "amount": 50000.00,
    "amount_principal": 41666.67,
    "amount_interest": 8333.33,
    "amount_fee": 0.00,
    "currency": "YER",
    "channel": "BRANCH",
    "idempotency_key": "PAY-2026-BRANCH-001-XYZ",
    "paid_on": "2026-03-01T09:30:00.000Z"
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `contract_id` | integer | Contract identifier |
| `payment_id` | integer | Payment event record identifier |
| `installment_id` | integer | Target installment (may be null for prepayments) |
| `amount` | decimal | Total payment amount |
| `amount_principal` | decimal | Principal portion of the payment |
| `amount_interest` | decimal | Interest portion of the payment |
| `amount_fee` | decimal | Fee portion of the payment |
| `currency` | string | Currency code |
| `channel` | string | Payment channel (`BRANCH`, `MOBILE`, `WEB`, `BANK_TRANSFER`) |
| `idempotency_key` | string | Unique key preventing duplicate processing (BR-11) |
| `paid_on` | ISO 8601 | Payment timestamp |

---

### 4.9 InstallmentPaid

Emitted when an installment is fully or partially paid. This event updates the installment status to `PAID` or `PARTIAL`.

**Trigger**: Automatically after `PaymentReceived` processing

```json
{
  "event_id": "10000001-aaaa-bbbb-cccc-ddddeeee0009",
  "event_type": "InstallmentPaid",
  "aggregate_type": "Contract",
  "aggregate_id": 1001,
  "tenant_id": 1,
  "timestamp": "2026-03-01T09:30:01.000Z",
  "version": 9,
  "correlation_id": "req-pay-001",
  "caused_by": "10000001-aaaa-bbbb-cccc-ddddeeee0008",
  "actor": "system",
  "payload": {
    "contract_id": 1001,
    "installment_id": 5001,
    "installment_seq": 1,
    "paid_principal": 41666.67,
    "paid_interest": 8333.33,
    "paid_fee": 0.00,
    "total_paid": 50000.00,
    "remaining_principal": 0.00,
    "remaining_interest": 0.00,
    "status": "PAID",
    "currency": "YER"
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `contract_id` | integer | Contract identifier |
| `installment_id` | integer | Installment record identifier |
| `installment_seq` | integer | Installment sequence number within the contract |
| `paid_principal` | decimal | Principal amount paid in this installment |
| `paid_interest` | decimal | Interest amount paid in this installment |
| `paid_fee` | decimal | Fee amount paid in this installment |
| `total_paid` | decimal | Total cumulative amount paid for this installment |
| `remaining_principal` | decimal | Outstanding principal for this installment |
| `remaining_interest` | decimal | Outstanding interest for this installment |
| `status` | string | Updated installment status: `PAID` or `PARTIAL` |
| `currency` | string | Currency code |

---

### 4.10 PenaltyApplied

Emitted when a late payment penalty is assessed against a contract installment. Penalties are calculated based on aging bucket rules (BR-08).

**Trigger**: Scheduled aging job or manual penalty assessment

```json
{
  "event_id": "10000001-aaaa-bbbb-cccc-ddddeeee0010",
  "event_type": "PenaltyApplied",
  "aggregate_type": "Contract",
  "aggregate_id": 1001,
  "tenant_id": 1,
  "timestamp": "2026-04-01T00:05:00.000Z",
  "version": 10,
  "correlation_id": "job-aging-2026-04-01",
  "caused_by": null,
  "actor": "system",
  "payload": {
    "contract_id": 1001,
    "penalty_id": 7001,
    "installment_id": 5002,
    "installment_seq": 2,
    "amount": 1250.00,
    "currency": "YER",
    "kind": "LATE_FEE",
    "aging_bucket": "30",
    "days_overdue": 31,
    "calculation_basis": "PERCENT",
    "rate": 2.5,
    "base_amount": 50000.00
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `contract_id` | integer | Contract identifier |
| `penalty_id` | integer | Penalty event record identifier |
| `installment_id` | integer | Overdue installment reference |
| `installment_seq` | integer | Installment sequence number |
| `amount` | decimal | Penalty amount assessed |
| `currency` | string | Currency code |
| `kind` | string | Penalty type (e.g., `LATE_FEE`, `INTEREST_PENALTY`) |
| `aging_bucket` | string | Current aging bucket: `30`, `60`, `90`, `180`, `180+` |
| `days_overdue` | integer | Number of days past due date |
| `calculation_basis` | string | Calculation method: `PERCENT` or `FIXED` |
| `rate` | decimal | Penalty rate (if percentage-based) |
| `base_amount` | decimal | Base amount on which penalty was calculated |

---

### 4.11 AgingBucketChanged

Emitted when a contract's aging classification changes according to the escalation rules (BR-08): 30d = alert, 60d = escalate, 90d = suspend, 180d+ = write-off.

**Trigger**: Scheduled aging job

```json
{
  "event_id": "10000001-aaaa-bbbb-cccc-ddddeeee0011",
  "event_type": "AgingBucketChanged",
  "aggregate_type": "Contract",
  "aggregate_id": 1001,
  "tenant_id": 1,
  "timestamp": "2026-05-01T00:05:00.000Z",
  "version": 11,
  "correlation_id": "job-aging-2026-05-01",
  "caused_by": null,
  "actor": "system",
  "payload": {
    "contract_id": 1001,
    "from_bucket": "30",
    "to_bucket": "60",
    "days_overdue": 62,
    "oldest_unpaid_installment_seq": 2,
    "total_overdue_amount": 102500.00,
    "currency": "YER",
    "escalation_action": "ESCALATE",
    "escalated_to": "risk-team"
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `contract_id` | integer | Contract identifier |
| `from_bucket` | string | Previous aging bucket |
| `to_bucket` | string | New aging bucket |
| `days_overdue` | integer | Number of days the oldest installment is overdue |
| `oldest_unpaid_installment_seq` | integer | Sequence number of the oldest unpaid installment |
| `total_overdue_amount` | decimal | Total overdue amount across all late installments |
| `currency` | string | Currency code |
| `escalation_action` | string | Action taken: `ALERT`, `ESCALATE`, `SUSPEND`, `WRITE_OFF` |
| `escalated_to` | string | Team or role that receives the escalation |

---

### 4.12 ContractRestructured

Emitted when a contract's terms are modified (restructured). This creates new installment schedules and adjusts the sub-ledger.

**Trigger**: `PUT /api/v1/contracts/{id}/restructure`

```json
{
  "event_id": "10000001-aaaa-bbbb-cccc-ddddeeee0012",
  "event_type": "ContractRestructured",
  "aggregate_type": "Contract",
  "aggregate_id": 1001,
  "tenant_id": 1,
  "timestamp": "2026-06-15T14:00:00.000Z",
  "version": 12,
  "correlation_id": "req-restructure-001",
  "caused_by": null,
  "actor": "user-risk-manager-01",
  "payload": {
    "contract_id": 1001,
    "new_terms": {
      "duration_months": 18,
      "interest_type": "REDUCING",
      "grace_period_days": 14,
      "penalty_rate": 1.5
    },
    "old_terms": {
      "duration_months": 12,
      "interest_type": "REDUCING",
      "grace_period_days": 7,
      "penalty_rate": 2.5
    },
    "remaining_principal": 300000.00,
    "new_installment_count": 12,
    "new_first_due": "2026-07-01",
    "new_last_due": "2027-06-01",
    "reason": "Customer financial hardship - COVID impact",
    "approved_by": "user-credit-committee-01",
    "previous_status": "IN_ARREARS",
    "new_status": "RESTRUCTURED"
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `contract_id` | integer | Contract identifier |
| `new_terms` | object | Updated contract terms |
| `old_terms` | object | Previous contract terms (for audit) |
| `remaining_principal` | decimal | Outstanding principal at time of restructuring |
| `new_installment_count` | integer | Number of new installments |
| `new_first_due` | date | First due date under new schedule |
| `new_last_due` | date | Last due date under new schedule |
| `reason` | string | Restructuring reason |
| `approved_by` | string | Approving authority |
| `previous_status` | string | Status before restructuring |
| `new_status` | string | Status after restructuring (`RESTRUCTURED`) |

---

### 4.13 ContractWrittenOff

Emitted when a contract is written off after exhausting collection efforts (BR-08, 180+ days overdue). Triggers IFRS 9 accounting entries.

**Trigger**: `PUT /api/v1/contracts/{id}/status` with `status=WRITTEN_OFF`

```json
{
  "event_id": "10000001-aaaa-bbbb-cccc-ddddeeee0013",
  "event_type": "ContractWrittenOff",
  "aggregate_type": "Contract",
  "aggregate_id": 1001,
  "tenant_id": 1,
  "timestamp": "2026-10-01T08:00:00.000Z",
  "version": 13,
  "correlation_id": "req-writeoff-001",
  "caused_by": null,
  "actor": "user-credit-committee-01",
  "payload": {
    "contract_id": 1001,
    "written_off_amount": 280000.00,
    "outstanding_principal": 250000.00,
    "outstanding_interest": 20000.00,
    "outstanding_fees": 5000.00,
    "outstanding_penalties": 5000.00,
    "currency": "YER",
    "reason": "Irrecoverable debt - customer declared bankrupt",
    "approved_by": "user-credit-committee-01",
    "aging_bucket": "180+",
    "days_overdue": 195,
    "previous_status": "IN_ARREARS"
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `contract_id` | integer | Contract identifier |
| `written_off_amount` | decimal | Total amount written off |
| `outstanding_principal` | decimal | Unpaid principal at write-off |
| `outstanding_interest` | decimal | Unpaid interest at write-off |
| `outstanding_fees` | decimal | Unpaid fees at write-off |
| `outstanding_penalties` | decimal | Unpaid penalties at write-off |
| `currency` | string | Currency code |
| `reason` | string | Write-off justification |
| `approved_by` | string | Approving authority |
| `aging_bucket` | string | Aging bucket at write-off (typically `180+`) |
| `days_overdue` | integer | Days overdue at write-off |
| `previous_status` | string | Status before write-off |

---

### 4.14 ContractClosed

Emitted when a contract is fully paid and closed. All installments must be in `PAID` or `WAIVED` status.

**Trigger**: Automatic closure after final payment or manual closure

```json
{
  "event_id": "10000001-aaaa-bbbb-cccc-ddddeeee0014",
  "event_type": "ContractClosed",
  "aggregate_type": "Contract",
  "aggregate_id": 1001,
  "tenant_id": 1,
  "timestamp": "2027-02-01T15:00:00.000Z",
  "version": 14,
  "correlation_id": "req-pay-012",
  "caused_by": "10000001-aaaa-bbbb-cccc-ddddeeee0008",
  "actor": "system",
  "payload": {
    "contract_id": 1001,
    "closed_at": "2027-02-01T15:00:00.000Z",
    "total_paid": 540000.00,
    "total_principal_paid": 500000.00,
    "total_interest_paid": 35000.00,
    "total_fees_paid": 5000.00,
    "total_penalties_paid": 0.00,
    "currency": "YER",
    "installments_count": 12,
    "on_time_payments": 12,
    "late_payments": 0,
    "duration_days": 357,
    "previous_status": "ACTIVE"
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `contract_id` | integer | Contract identifier |
| `closed_at` | ISO 8601 | Closure timestamp |
| `total_paid` | decimal | Grand total of all payments received |
| `total_principal_paid` | decimal | Total principal portion paid |
| `total_interest_paid` | decimal | Total interest portion paid |
| `total_fees_paid` | decimal | Total fees portion paid |
| `total_penalties_paid` | decimal | Total penalties portion paid |
| `currency` | string | Currency code |
| `installments_count` | integer | Total number of installments |
| `on_time_payments` | integer | Payments received on or before due date |
| `late_payments` | integer | Payments received after due date |
| `duration_days` | integer | Contract duration in calendar days |
| `previous_status` | string | Status before closure |

---

### 4.15 EarlySettlement

Emitted when a customer pays off the remaining balance before the scheduled end date (FR-133). The settlement amount may include a discount or fee depending on the product terms.

**Trigger**: `POST /api/v1/contracts/{id}/early-settlement`

```json
{
  "event_id": "10000001-aaaa-bbbb-cccc-ddddeeee0015",
  "event_type": "EarlySettlement",
  "aggregate_type": "Contract",
  "aggregate_id": 1001,
  "tenant_id": 1,
  "timestamp": "2026-08-15T11:00:00.000Z",
  "version": 15,
  "correlation_id": "req-settle-001",
  "caused_by": null,
  "actor": "user-teller-01",
  "payload": {
    "contract_id": 1001,
    "settlement_amount": 280000.00,
    "outstanding_principal": 275000.00,
    "outstanding_interest": 12000.00,
    "interest_rebate": 8000.00,
    "early_settlement_fee": 1000.00,
    "net_settlement": 280000.00,
    "currency": "YER",
    "settlement_date": "2026-08-15",
    "remaining_installments": 6,
    "installments_waived": [7, 8, 9, 10, 11, 12],
    "channel": "BRANCH",
    "idempotency_key": "SETTLE-2026-001-ABC"
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `contract_id` | integer | Contract identifier |
| `settlement_amount` | decimal | Total amount paid for early settlement |
| `outstanding_principal` | decimal | Remaining principal at settlement |
| `outstanding_interest` | decimal | Remaining interest at settlement (before rebate) |
| `interest_rebate` | decimal | Interest discount for early repayment |
| `early_settlement_fee` | decimal | Fee charged for early settlement |
| `net_settlement` | decimal | Net amount: principal + interest - rebate + fee |
| `currency` | string | Currency code |
| `settlement_date` | date | Date of settlement |
| `remaining_installments` | integer | Number of installments waived |
| `installments_waived` | array | Sequence numbers of waived installments |
| `channel` | string | Payment channel |
| `idempotency_key` | string | Unique settlement key |

---

## 5. Reservation Events

Reservation events track the lifecycle of bookings for capacity-based products (hotels, halls, appointments). These events are published to the `dps.reservations` Kafka topic.

Reservation status transitions:

```
HOLD --> CONFIRMED --> COMPLETED
  |          |
  |          +--> CANCELLED
  |
  +--> EXPIRED
```

### 5.1 ReservationCreated

Emitted when a new reservation is created in `HOLD` status with a TTL. The hold automatically expires if not confirmed before `hold_until` (BR-10).

**Trigger**: `POST /api/v1/reservations`

```json
{
  "event_id": "20000001-aaaa-bbbb-cccc-ddddeeee0001",
  "event_type": "ReservationCreated",
  "aggregate_type": "Reservation",
  "aggregate_id": 3001,
  "tenant_id": 1,
  "timestamp": "2026-02-09T12:00:00.000Z",
  "version": 1,
  "correlation_id": "req-res-001",
  "caused_by": null,
  "actor": "user-agent-01",
  "payload": {
    "reservation_id": 3001,
    "product_id": 75,
    "customer_id": 200,
    "slot_from": "2026-03-01T09:00:00.000Z",
    "slot_to": "2026-03-01T12:00:00.000Z",
    "hold_until": "2026-02-09T12:15:00.000Z",
    "status": "HOLD",
    "cancellation_policy_id": 2,
    "capacity_before": 5,
    "capacity_after": 4
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `reservation_id` | integer | Unique reservation identifier |
| `product_id` | integer | Reservation product reference |
| `customer_id` | integer | Customer making the reservation |
| `slot_from` | ISO 8601 | Start of the reserved time slot |
| `slot_to` | ISO 8601 | End of the reserved time slot |
| `hold_until` | ISO 8601 | TTL expiry; reservation auto-expires after this time (BR-10) |
| `status` | string | Always `HOLD` at creation |
| `cancellation_policy_id` | integer | Applicable cancellation policy |
| `capacity_before` | integer | Available capacity before this reservation |
| `capacity_after` | integer | Available capacity after this reservation |

---

### 5.2 ReservationConfirmed

Emitted when a reservation is confirmed after payment within the TTL window.

**Trigger**: `PUT /api/v1/reservations/{id}/confirm`

```json
{
  "event_id": "20000001-aaaa-bbbb-cccc-ddddeeee0002",
  "event_type": "ReservationConfirmed",
  "aggregate_type": "Reservation",
  "aggregate_id": 3001,
  "tenant_id": 1,
  "timestamp": "2026-02-09T12:10:00.000Z",
  "version": 2,
  "correlation_id": "req-res-002",
  "caused_by": "20000001-aaaa-bbbb-cccc-ddddeeee0001",
  "actor": "user-agent-01",
  "payload": {
    "reservation_id": 3001,
    "deposit_amount": 150.00,
    "currency": "YER",
    "payment_ref": "PAY-2026-XYZ",
    "confirmed_at": "2026-02-09T12:10:00.000Z",
    "previous_status": "HOLD"
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `reservation_id` | integer | Reservation identifier |
| `deposit_amount` | decimal | Deposit or full payment amount |
| `currency` | string | Currency code |
| `payment_ref` | string | External payment reference |
| `confirmed_at` | ISO 8601 | Confirmation timestamp |
| `previous_status` | string | Status before confirmation (`HOLD`) |

---

### 5.3 ReservationExpired

Emitted when a `HOLD` reservation auto-expires because the TTL elapsed without confirmation (BR-10). This releases the capacity back to the pool.

**Trigger**: Scheduled expiry job (`fn_expire_held_reservations()`) or application scheduler

```json
{
  "event_id": "20000001-aaaa-bbbb-cccc-ddddeeee0003",
  "event_type": "ReservationExpired",
  "aggregate_type": "Reservation",
  "aggregate_id": 3002,
  "tenant_id": 1,
  "timestamp": "2026-02-09T12:15:01.000Z",
  "version": 2,
  "correlation_id": "job-expire-reservations-2026-02-09",
  "caused_by": null,
  "actor": "system",
  "payload": {
    "reservation_id": 3002,
    "expired_at": "2026-02-09T12:15:01.000Z",
    "hold_until": "2026-02-09T12:15:00.000Z",
    "product_id": 75,
    "slot_from": "2026-03-01T14:00:00.000Z",
    "slot_to": "2026-03-01T17:00:00.000Z",
    "capacity_released": 1,
    "previous_status": "HOLD"
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `reservation_id` | integer | Reservation identifier |
| `expired_at` | ISO 8601 | Actual expiration timestamp |
| `hold_until` | ISO 8601 | Original TTL deadline |
| `product_id` | integer | Product reference (for capacity restoration) |
| `slot_from` | ISO 8601 | Released time slot start |
| `slot_to` | ISO 8601 | Released time slot end |
| `capacity_released` | integer | Number of capacity units released back |
| `previous_status` | string | Status before expiration (`HOLD`) |

---

### 5.4 ReservationCancelled

Emitted when a confirmed reservation is cancelled. A penalty may apply based on the cancellation policy (BR-15).

**Trigger**: `PUT /api/v1/reservations/{id}/cancel`

```json
{
  "event_id": "20000001-aaaa-bbbb-cccc-ddddeeee0004",
  "event_type": "ReservationCancelled",
  "aggregate_type": "Reservation",
  "aggregate_id": 3001,
  "tenant_id": 1,
  "timestamp": "2026-02-28T16:00:00.000Z",
  "version": 3,
  "correlation_id": "req-res-003",
  "caused_by": null,
  "actor": "user-agent-01",
  "payload": {
    "reservation_id": 3001,
    "penalty_amount": 150.00,
    "refund_amount": 0.00,
    "currency": "YER",
    "reason": "Customer requested cancellation",
    "cancellation_policy_id": 2,
    "cancellation_rule_applied": "Late cancellation (< 24h before slot)",
    "penalty_percentage": 100.0,
    "cancelled_at": "2026-02-28T16:00:00.000Z",
    "slot_from": "2026-03-01T09:00:00.000Z",
    "hours_before_slot": 17,
    "capacity_released": 1,
    "previous_status": "CONFIRMED"
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `reservation_id` | integer | Reservation identifier |
| `penalty_amount` | decimal | Cancellation penalty assessed |
| `refund_amount` | decimal | Amount refunded to customer (deposit minus penalty) |
| `currency` | string | Currency code |
| `reason` | string | Cancellation reason provided |
| `cancellation_policy_id` | integer | Applied cancellation policy |
| `cancellation_rule_applied` | string | Description of the specific policy rule triggered |
| `penalty_percentage` | decimal | Penalty as a percentage of the deposit |
| `cancelled_at` | ISO 8601 | Cancellation timestamp |
| `slot_from` | ISO 8601 | Original slot start time |
| `hours_before_slot` | integer | Hours between cancellation and the slot start |
| `capacity_released` | integer | Capacity units released |
| `previous_status` | string | Status before cancellation (`CONFIRMED`) |

---

### 5.5 ReservationCompleted

Emitted when a reservation's service has been delivered and the reservation is marked as complete.

**Trigger**: `PUT /api/v1/reservations/{id}/complete` or automatic completion after slot end

```json
{
  "event_id": "20000001-aaaa-bbbb-cccc-ddddeeee0005",
  "event_type": "ReservationCompleted",
  "aggregate_type": "Reservation",
  "aggregate_id": 3001,
  "tenant_id": 1,
  "timestamp": "2026-03-01T12:00:00.000Z",
  "version": 3,
  "correlation_id": "job-complete-reservations-2026-03-01",
  "caused_by": null,
  "actor": "system",
  "payload": {
    "reservation_id": 3001,
    "completed_at": "2026-03-01T12:00:00.000Z",
    "product_id": 75,
    "customer_id": 200,
    "slot_from": "2026-03-01T09:00:00.000Z",
    "slot_to": "2026-03-01T12:00:00.000Z",
    "total_charged": 500.00,
    "deposit_applied": 150.00,
    "balance_collected": 350.00,
    "currency": "YER",
    "previous_status": "CONFIRMED"
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `reservation_id` | integer | Reservation identifier |
| `completed_at` | ISO 8601 | Completion timestamp |
| `product_id` | integer | Product reference |
| `customer_id` | integer | Customer reference |
| `slot_from` | ISO 8601 | Actual slot start |
| `slot_to` | ISO 8601 | Actual slot end |
| `total_charged` | decimal | Total amount charged for the reservation |
| `deposit_applied` | decimal | Deposit amount applied to the total |
| `balance_collected` | decimal | Remaining balance collected at completion |
| `currency` | string | Currency code |
| `previous_status` | string | Status before completion (`CONFIRMED`) |

---

## 6. Customer Events

Customer events track changes to customer profiles that may affect eligibility, pricing, and risk assessment. Published to the `dps.audit` Kafka topic.

### 6.1 CustomerCreated

Emitted when a new customer record is created.

**Trigger**: `POST /api/v1/customers`

```json
{
  "event_id": "30000001-aaaa-bbbb-cccc-ddddeeee0001",
  "event_type": "CustomerCreated",
  "aggregate_type": "Customer",
  "aggregate_id": 200,
  "tenant_id": 1,
  "timestamp": "2026-02-01T10:00:00.000Z",
  "version": 1,
  "correlation_id": "req-cust-001",
  "caused_by": null,
  "actor": "user-onboard-01",
  "payload": {
    "customer_id": 200,
    "code": "CUST-001",
    "name_ar": "أحمد محمد",
    "name_en": "Ahmed Mohammed",
    "kyc_level": "BASIC",
    "score": null,
    "phone": "+967771234567",
    "email": "ahmed@example.com"
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `customer_id` | integer | Unique customer identifier |
| `code` | string | Customer code (unique per tenant) |
| `name_ar` | string | Arabic name |
| `name_en` | string | English name |
| `kyc_level` | enum | KYC level: `NONE`, `BASIC`, `FULL` |
| `score` | decimal/null | Initial credit score (may be null) |
| `phone` | string | Phone number |
| `email` | string | Email address |

---

### 6.2 CustomerKYCUpdated

Emitted when a customer's KYC level changes. This may affect eligibility for financial products (BR-14).

**Trigger**: `PUT /api/v1/customers/{id}` with KYC level change

```json
{
  "event_id": "30000001-aaaa-bbbb-cccc-ddddeeee0002",
  "event_type": "CustomerKYCUpdated",
  "aggregate_type": "Customer",
  "aggregate_id": 200,
  "tenant_id": 1,
  "timestamp": "2026-02-05T14:00:00.000Z",
  "version": 2,
  "correlation_id": "req-cust-002",
  "caused_by": null,
  "actor": "user-compliance-01",
  "payload": {
    "customer_id": 200,
    "old_level": "BASIC",
    "new_level": "FULL",
    "reason": "Full documentation verified",
    "documents_verified": ["NATIONAL_ID", "PROOF_OF_ADDRESS", "SALARY_CERT"],
    "verified_by": "user-compliance-01",
    "verified_at": "2026-02-05T14:00:00.000Z"
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `customer_id` | integer | Customer identifier |
| `old_level` | enum | Previous KYC level |
| `new_level` | enum | New KYC level |
| `reason` | string | Reason for the change |
| `documents_verified` | array | List of documents that were verified |
| `verified_by` | string | Compliance officer who verified |
| `verified_at` | ISO 8601 | Verification timestamp |

---

### 6.3 CustomerScoreUpdated

Emitted when a customer's credit score changes. This affects eligibility rules evaluated by CEL expressions (FR-090).

**Trigger**: `PUT /api/v1/customers/{id}` with score change, or external credit bureau sync

```json
{
  "event_id": "30000001-aaaa-bbbb-cccc-ddddeeee0003",
  "event_type": "CustomerScoreUpdated",
  "aggregate_type": "Customer",
  "aggregate_id": 200,
  "tenant_id": 1,
  "timestamp": "2026-02-08T08:00:00.000Z",
  "version": 3,
  "correlation_id": "job-credit-score-sync-2026-02-08",
  "caused_by": null,
  "actor": "system",
  "payload": {
    "customer_id": 200,
    "old_score": 600.00,
    "new_score": 720.00,
    "score_source": "CREDIT_BUREAU",
    "score_date": "2026-02-08",
    "factors": [
      {"factor": "payment_history", "impact": "POSITIVE", "detail": "12 months on-time payments"},
      {"factor": "credit_utilization", "impact": "POSITIVE", "detail": "Below 30%"}
    ]
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `customer_id` | integer | Customer identifier |
| `old_score` | decimal | Previous score (`NUMERIC(5,2)`) |
| `new_score` | decimal | New score |
| `score_source` | string | Source of the score update (e.g., `CREDIT_BUREAU`, `INTERNAL`, `MANUAL`) |
| `score_date` | date | Date the score was assessed |
| `factors` | array | Contributing factors to the score change |

---

## 7. System Events

System events represent infrastructure-level and cross-cutting operations.

### 7.1 TenantCreated

Emitted when a new tenant is onboarded to the platform (FR-160).

**Trigger**: Platform administration API

```json
{
  "event_id": "40000001-aaaa-bbbb-cccc-ddddeeee0001",
  "event_type": "TenantCreated",
  "aggregate_type": "Tenant",
  "aggregate_id": 2,
  "tenant_id": 2,
  "timestamp": "2026-01-15T08:00:00.000Z",
  "version": 1,
  "correlation_id": "req-tenant-001",
  "caused_by": null,
  "actor": "platform-admin",
  "payload": {
    "tenant_id": 2,
    "code": "BANK_ADEN",
    "name": "Aden Commercial Bank",
    "settings": {
      "default_currency": "YER",
      "supported_currencies": ["YER", "USD", "SAR"],
      "default_language": "ar",
      "timezone": "Asia/Aden",
      "max_products": 10000,
      "max_contracts": 100000
    },
    "is_active": true
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `tenant_id` | integer | New tenant identifier |
| `code` | string | Unique tenant code |
| `name` | string | Tenant display name |
| `settings` | object | Tenant-specific configuration (JSONB) |
| `is_active` | boolean | Whether the tenant is active |

---

### 7.2 NumberReserved

Emitted when a sequence number is atomically reserved via the Numbering Service (FR-072).

**Trigger**: `POST /api/v1/numbering/reserve`

```json
{
  "event_id": "40000001-aaaa-bbbb-cccc-ddddeeee0002",
  "event_type": "NumberReserved",
  "aggregate_type": "NumberingScheme",
  "aggregate_id": 5,
  "tenant_id": 1,
  "timestamp": "2026-02-09T10:00:00.000Z",
  "version": 1234,
  "correlation_id": "saga-contract-001",
  "caused_by": null,
  "actor": "system",
  "payload": {
    "scheme_id": 5,
    "scheme_code": "CONTRACT_NUM",
    "sequence_value": 1234,
    "generated_identifier": "FIN-LOAN-2026-001234",
    "branch_code": "SANA",
    "channel_code": "WEB",
    "reserved_by": "user-sales-01",
    "reserved_until": "2026-02-09T11:00:00.000Z",
    "gap_policy": "ALLOW"
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `scheme_id` | integer | Numbering scheme identifier |
| `scheme_code` | string | Numbering scheme code |
| `sequence_value` | integer | Raw sequence counter value (atomically incremented) |
| `generated_identifier` | string | Formatted identifier string |
| `branch_code` | string | Branch context for the sequence |
| `channel_code` | string | Channel context for the sequence |
| `reserved_by` | string | User who initiated the reservation |
| `reserved_until` | ISO 8601 | Reservation expiry time |
| `gap_policy` | string | Gap handling: `ALLOW`, `DENY`, `REUSE` |

---

### 7.3 SubledgerEntryPosted

Emitted when a journal entry is posted to a contract's sub-ledger (FR-082). Follows IFRS 9 standards. Every entry has a unique `idempotency_key`.

**Trigger**: Automatically after payment, disbursement, penalty, or write-off events

```json
{
  "event_id": "40000001-aaaa-bbbb-cccc-ddddeeee0003",
  "event_type": "SubledgerEntryPosted",
  "aggregate_type": "Contract",
  "aggregate_id": 1001,
  "tenant_id": 1,
  "timestamp": "2026-03-01T09:30:02.000Z",
  "version": 9,
  "correlation_id": "req-pay-001",
  "caused_by": "10000001-aaaa-bbbb-cccc-ddddeeee0008",
  "actor": "system",
  "payload": {
    "contract_id": 1001,
    "entry_id": 8001,
    "event_type": "PAYMENT",
    "dr_account": "1001-CASH",
    "cr_account": "1201-LOAN_RECEIVABLE",
    "amount": 41666.67,
    "currency": "YER",
    "posted_at": "2026-03-01T09:30:02.000Z",
    "ref": "PAY-2026-BRANCH-001-XYZ",
    "idempotency_key": "SL-PAY-9001-PRINCIPAL",
    "accounting_template_id": 3,
    "description": "Principal repayment - Installment 1"
  }
}
```

| Payload Field | Type | Description |
|---|---|---|
| `contract_id` | integer | Contract identifier |
| `entry_id` | integer | Sub-ledger entry record identifier |
| `event_type` | string | Accounting event type: `DISBURSEMENT`, `PAYMENT`, `INTEREST_ACCRUAL`, `FEE`, `PENALTY`, `WRITE_OFF`, `REVERSAL` |
| `dr_account` | string | Debit account code |
| `cr_account` | string | Credit account code |
| `amount` | decimal | Entry amount (`NUMERIC(18,2)`, must be > 0) |
| `currency` | string | Currency code |
| `posted_at` | ISO 8601 | Posting timestamp |
| `ref` | string | Reference to the originating transaction |
| `idempotency_key` | string | Unique key preventing duplicate entries |
| `accounting_template_id` | integer | Template used for generating the entry |
| `description` | string | Human-readable description |

---

## 8. Kafka Topics

Events are published to Kafka topics organized by domain and criticality. All topics use `aggregate_id` as the partition key to guarantee ordering within an aggregate.

### Topic Configuration

| Topic | Partitions | Replication | Retention | Key | Description |
|---|---|---|---|---|---|
| `dps.products` | 12 | 3 | 30 days | `product_id` | Product lifecycle events (Created, Activated, Suspended, Retired, Pricing, Channels) |
| `dps.contracts` | 24 | 3 | 90 days | `contract_id` | Contract lifecycle events (Created, Activated, Restructured, Closed, WrittenOff, Schedule, Aging) |
| `dps.payments` | 24 | 3 | 90 days | `contract_id` | Payment-specific events (PaymentReceived, InstallmentPaid, EarlySettlement). Higher partition count for throughput. |
| `dps.reservations` | 12 | 3 | 30 days | `reservation_id` | Reservation lifecycle events (Created, Confirmed, Expired, Cancelled, Completed) |
| `dps.audit` | 12 | 3 | 7 years | `tenant_id` | All events replicated for audit and compliance (NFR-07). Uses `tenant_id` key for tenant-scoped compaction. |
| `dps.notifications` | 6 | 3 | 7 days | `customer_id` | Notification triggers derived from domain events. Short retention. |

### Event-to-Topic Mapping

| Event Type | Primary Topic | Secondary Topics |
|---|---|---|
| `ProductCreated` | `dps.products` | `dps.audit` |
| `ProductVersionAdded` | `dps.products` | `dps.audit` |
| `ProductActivated` | `dps.products` | `dps.audit`, `dps.notifications` |
| `ProductSuspended` | `dps.products` | `dps.audit`, `dps.notifications` |
| `ProductRetired` | `dps.products` | `dps.audit`, `dps.notifications` |
| `PricingUpdated` | `dps.products` | `dps.audit` |
| `ChannelEnabled` | `dps.products` | `dps.audit` |
| `ChannelDisabled` | `dps.products` | `dps.audit` |
| `ContractCreated` | `dps.contracts` | `dps.audit` |
| `ContractNumberReserved` | `dps.contracts` | `dps.audit` |
| `DocumentsVerified` | `dps.contracts` | `dps.audit` |
| `CollateralConfigured` | `dps.contracts` | `dps.audit` |
| `ContractActivated` | `dps.contracts` | `dps.audit`, `dps.notifications` |
| `InstallmentScheduleGenerated` | `dps.contracts` | `dps.audit` |
| `FundsDisbursed` | `dps.contracts` | `dps.payments`, `dps.audit`, `dps.notifications` |
| `PaymentReceived` | `dps.payments` | `dps.contracts`, `dps.audit`, `dps.notifications` |
| `InstallmentPaid` | `dps.payments` | `dps.contracts`, `dps.audit` |
| `PenaltyApplied` | `dps.contracts` | `dps.payments`, `dps.audit`, `dps.notifications` |
| `AgingBucketChanged` | `dps.contracts` | `dps.audit`, `dps.notifications` |
| `ContractRestructured` | `dps.contracts` | `dps.audit`, `dps.notifications` |
| `ContractWrittenOff` | `dps.contracts` | `dps.audit`, `dps.notifications` |
| `ContractClosed` | `dps.contracts` | `dps.audit`, `dps.notifications` |
| `EarlySettlement` | `dps.payments` | `dps.contracts`, `dps.audit`, `dps.notifications` |
| `ReservationCreated` | `dps.reservations` | `dps.audit` |
| `ReservationConfirmed` | `dps.reservations` | `dps.audit`, `dps.notifications` |
| `ReservationExpired` | `dps.reservations` | `dps.audit` |
| `ReservationCancelled` | `dps.reservations` | `dps.audit`, `dps.notifications` |
| `ReservationCompleted` | `dps.reservations` | `dps.audit`, `dps.notifications` |
| `CustomerCreated` | `dps.audit` | -- |
| `CustomerKYCUpdated` | `dps.audit` | `dps.notifications` |
| `CustomerScoreUpdated` | `dps.audit` | -- |
| `TenantCreated` | `dps.audit` | -- |
| `NumberReserved` | `dps.audit` | -- |
| `SubledgerEntryPosted` | `dps.payments` | `dps.audit` |

---

## 9. Event Consumers

The following table maps each consuming service to the events it subscribes to and the actions it performs.

### Consumer Matrix

| Consumer Service | Kafka Consumer Group | Subscribed Topics | Events Consumed | Action |
|---|---|---|---|---|
| **Pricing Service** | `pricing-service` | `dps.products` | `ProductCreated`, `ProductActivated`, `ProductRetired` | Invalidates pricing cache; updates Redis with active product pricing data |
| **Pricing Service** | `pricing-service` | `dps.products` | `PricingUpdated` | Refreshes price list cache and recalculates derived prices |
| **Channel Gateway** | `channel-gateway` | `dps.products` | `ChannelEnabled`, `ChannelDisabled`, `ProductSuspended`, `ProductRetired` | Updates channel availability and feature flags; removes suspended/retired products from channel catalog |
| **Accounting Mapper** | `accounting-mapper` | `dps.contracts` | `ContractActivated`, `FundsDisbursed` | Generates DISBURSEMENT sub-ledger entries (DR: Loan Receivable, CR: Cash) |
| **Accounting Mapper** | `accounting-mapper` | `dps.payments` | `PaymentReceived` | Generates PAYMENT sub-ledger entries (DR: Cash, CR: Loan Receivable + Interest Income) |
| **Accounting Mapper** | `accounting-mapper` | `dps.contracts` | `PenaltyApplied` | Generates PENALTY sub-ledger entries (DR: Loan Receivable, CR: Penalty Income) |
| **Accounting Mapper** | `accounting-mapper` | `dps.contracts` | `ContractWrittenOff` | Generates WRITE_OFF sub-ledger entries (DR: Bad Debt Expense, CR: Loan Receivable) |
| **Accounting Mapper** | `accounting-mapper` | `dps.payments` | `EarlySettlement` | Generates SETTLEMENT sub-ledger entries and interest rebate adjustments |
| **Numbering Service** | `numbering-service` | `dps.contracts` | `ContractCreated` | Validates that the reserved number was consumed; releases reservation if contract creation failed |
| **Reservations Service** | `reservations-service` | `dps.reservations` | `ReservationExpired` | Releases capacity back to the availability pool |
| **Reservations Service** | `reservations-service` | `dps.reservations` | `ReservationCancelled` | Releases capacity and records cancellation penalty |
| **Aging Job** | `aging-job` | `dps.contracts` | `InstallmentScheduleGenerated` | Registers installments for aging monitoring |
| **Aging Job** | `aging-job` | `dps.payments` | `PaymentReceived`, `InstallmentPaid` | Updates aging status; may clear aging alerts when payments cure delinquency |
| **Notification Service** | `notification-service` | `dps.notifications` | All notification-targeted events | Sends email, SMS, push notifications, and in-app alerts to customers and staff |
| **Audit Service** | `audit-service` | `dps.audit` | All events | Persists to `audit_log` table; generates `state_transition` records; feeds compliance reporting |
| **Search Indexer** | `search-indexer` | `dps.products` | `ProductCreated`, `ProductActivated`, `ProductVersionAdded`, `PricingUpdated`, `ChannelEnabled` | Updates Elasticsearch/OpenSearch index for product search |
| **Analytics Pipeline** | `analytics-pipeline` | `dps.contracts`, `dps.payments` | All contract and payment events | Feeds data warehouse for reporting; calculates portfolio metrics |
| **Eligibility Engine** | `eligibility-engine` | `dps.audit` | `CustomerKYCUpdated`, `CustomerScoreUpdated` | Refreshes customer eligibility cache; triggers re-evaluation of pending contract applications |

### Consumer Group Configuration

| Consumer Group | Max Parallelism | Commit Strategy | Error Handling |
|---|---|---|---|
| `accounting-mapper` | 24 (matches `dps.payments` partitions) | Manual commit after successful processing | Dead-letter topic `dps.payments.dlq`; alert on 3 consecutive failures |
| `notification-service` | 6 (matches `dps.notifications` partitions) | Auto-commit after send | Retry 3 times with exponential backoff; drop after failure |
| `audit-service` | 12 (matches `dps.audit` partitions) | Manual commit after DB persist | Dead-letter topic `dps.audit.dlq`; never drop audit events |
| `pricing-service` | 12 (matches `dps.products` partitions) | Auto-commit | Retry with cache invalidation on failure |
| `search-indexer` | 12 | Auto-commit | Retry 5 times; full reindex on persistent failure |
| `analytics-pipeline` | 24 | Batch commit every 1000 records | Dead-letter topic; manual replay for missed batches |

---

## 10. Replay and Projection

### 10.1 Event Replay for Contracts

Since contracts are event-sourced, the authoritative state can be reconstructed by replaying all events for a given `aggregate_id` in order. This is the foundation for:

- **Debugging**: Replay events to understand how a contract reached its current state.
- **Audit**: Provide a complete history to auditors and regulators.
- **Migration**: Rebuild projections after schema changes.
- **Disaster Recovery**: Restore state from the event store.

#### Replay Procedure

```sql
-- Step 1: Fetch all events for a contract, ordered by version
SELECT event_type, payload, created_at
FROM domain_event
WHERE aggregate_type = 'Contract'
  AND aggregate_id = 1001
  AND tenant_id = 1
ORDER BY id ASC;

-- Step 2: Apply each event to a fresh aggregate state
-- (Performed in application code)
```

#### Application-Level Replay (Pseudocode)

```
function replayContract(contractId):
    events = eventStore.getEvents("Contract", contractId)
    state = ContractState.empty()

    for event in events:
        match event.type:
            "ContractCreated"              -> state = applyCreated(state, event.payload)
            "ContractNumberReserved"       -> state = applyNumberReserved(state, event.payload)
            "DocumentsVerified"            -> state = applyDocumentsVerified(state, event.payload)
            "CollateralConfigured"         -> state = applyCollateralConfigured(state, event.payload)
            "InstallmentScheduleGenerated" -> state = applyScheduleGenerated(state, event.payload)
            "ContractActivated"            -> state = applyActivated(state, event.payload)
            "FundsDisbursed"               -> state = applyDisbursed(state, event.payload)
            "PaymentReceived"              -> state = applyPayment(state, event.payload)
            "InstallmentPaid"              -> state = applyInstallmentPaid(state, event.payload)
            "PenaltyApplied"               -> state = applyPenalty(state, event.payload)
            "AgingBucketChanged"           -> state = applyAgingChange(state, event.payload)
            "ContractRestructured"         -> state = applyRestructured(state, event.payload)
            "ContractWrittenOff"           -> state = applyWrittenOff(state, event.payload)
            "EarlySettlement"              -> state = applyEarlySettlement(state, event.payload)
            "ContractClosed"               -> state = applyClosed(state, event.payload)

    return state
```

### 10.2 Snapshots

For contracts with many events, replaying from the beginning becomes slow. Snapshots periodically capture the full aggregate state to allow replay from a checkpoint rather than from the start.

#### Snapshot Strategy

| Trigger | Condition | Description |
|---|---|---|
| Event count | Every 50 events | Create a snapshot after every 50th event on the aggregate |
| Time-based | Every 24 hours | Nightly job creates snapshots for active contracts |
| On-demand | Manual trigger | Admin can force snapshot creation for a specific contract |

#### Snapshot Storage

```sql
-- Snapshot table (not in current DDL; add when implementing)
CREATE TABLE aggregate_snapshot (
  id             BIGSERIAL PRIMARY KEY,
  tenant_id      BIGINT NOT NULL,
  aggregate_type TEXT NOT NULL,
  aggregate_id   BIGINT NOT NULL,
  version        INTEGER NOT NULL,
  state          JSONB NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE(aggregate_type, aggregate_id, version)
);

CREATE INDEX idx_snapshot_aggregate
  ON aggregate_snapshot(aggregate_type, aggregate_id, version DESC);
```

#### Replay with Snapshot

```
function replayContractWithSnapshot(contractId):
    snapshot = snapshotStore.getLatest("Contract", contractId)

    if snapshot exists:
        state = ContractState.fromJson(snapshot.state)
        startVersion = snapshot.version + 1
    else:
        state = ContractState.empty()
        startVersion = 1

    events = eventStore.getEventsFrom("Contract", contractId, startVersion)

    for event in events:
        state = applyEvent(state, event)

    return state
```

### 10.3 Materialized View Projections

Read-optimized views are maintained by consuming domain events and updating denormalized data stores. These projections serve the CQRS read side.

#### Projection Catalog

| Projection | Source Events | Target | Refresh Strategy | Purpose |
|---|---|---|---|---|
| **Product Catalog** | `ProductCreated`, `ProductActivated`, `ProductVersionAdded`, `PricingUpdated`, `ChannelEnabled`, `ChannelDisabled` | Elasticsearch index `dps-products` | Real-time (event-driven) | Full-text search, filtering, and browsing |
| **Pricing Cache** | `PricingUpdated`, `ProductActivated`, `ProductRetired` | Redis `pricing:{tenant}:{product}` | Real-time (event-driven); TTL 1 hour | Sub-200ms pricing quotes (NFR-01) |
| **Contract Summary** | All contract events | PostgreSQL materialized view `mv_contract_summary` | Incremental update on each event | Dashboard, portfolio reporting |
| **Installment Schedule** | `InstallmentScheduleGenerated`, `PaymentReceived`, `InstallmentPaid`, `PenaltyApplied` | PostgreSQL materialized view `mv_installment_status` | Incremental update on each event | Statement generation, payment tracking |
| **Aging Report** | `AgingBucketChanged`, `PenaltyApplied`, `PaymentReceived`, `ContractWrittenOff` | PostgreSQL materialized view `mv_aging_report` | Nightly batch refresh | Risk reporting, regulatory compliance |
| **Availability Calendar** | `ReservationCreated`, `ReservationConfirmed`, `ReservationExpired`, `ReservationCancelled`, `ReservationCompleted` | Redis `availability:{tenant}:{product}:{date}` | Real-time (event-driven) | Availability queries (sub-200ms) |
| **Customer Portfolio** | `ContractCreated`, `ContractActivated`, `ContractClosed`, `PaymentReceived` | PostgreSQL materialized view `mv_customer_portfolio` | Incremental update on each event | Customer 360 view, eligibility checks |
| **Audit Timeline** | All events | PostgreSQL `audit_log` + `state_transition` | Real-time (event-driven) | Compliance, dispute resolution, debugging |

#### Materialized View Refresh SQL Examples

```sql
-- Contract Summary Materialized View
CREATE MATERIALIZED VIEW mv_contract_summary AS
SELECT
  c.id AS contract_id,
  c.tenant_id,
  c.contract_number,
  c.customer_id,
  cu.name_en AS customer_name,
  c.product_id,
  p.name_en AS product_name,
  c.status,
  c.currency,
  c.principal,
  c.interest_type,
  c.opened_at,
  c.closed_at,
  COALESCE(SUM(pe.amount_principal + pe.amount_interest + pe.amount_fee), 0) AS total_paid,
  c.principal - COALESCE(SUM(pe.amount_principal), 0) AS outstanding_principal,
  COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'LATE') AS late_installments,
  COUNT(DISTINCT i.id) AS total_installments,
  MAX(pen.aging_bucket) AS current_aging_bucket
FROM contract c
  JOIN customer cu ON cu.id = c.customer_id
  JOIN product p ON p.id = c.product_id
  LEFT JOIN payment_event pe ON pe.contract_id = c.id
  LEFT JOIN installment i ON i.contract_id = c.id
  LEFT JOIN penalty_event pen ON pen.contract_id = c.id
GROUP BY c.id, c.tenant_id, c.contract_number, c.customer_id,
         cu.name_en, c.product_id, p.name_en, c.status, c.currency,
         c.principal, c.interest_type, c.opened_at, c.closed_at;

CREATE UNIQUE INDEX idx_mv_contract_summary
  ON mv_contract_summary(contract_id);

-- Refresh strategy: REFRESH MATERIALIZED VIEW CONCURRENTLY mv_contract_summary;
-- Triggered by contract and payment event consumers.
```

```sql
-- Aging Report Materialized View
CREATE MATERIALIZED VIEW mv_aging_report AS
SELECT
  c.tenant_id,
  c.status,
  COALESCE(
    (SELECT pen.aging_bucket
     FROM penalty_event pen
     WHERE pen.contract_id = c.id
     ORDER BY pen.created_at DESC
     LIMIT 1),
    'CURRENT'
  ) AS aging_bucket,
  COUNT(*) AS contract_count,
  SUM(c.principal) AS total_principal,
  SUM(c.principal - COALESCE(paid.total_principal_paid, 0)) AS total_outstanding
FROM contract c
  LEFT JOIN LATERAL (
    SELECT SUM(pe.amount_principal) AS total_principal_paid
    FROM payment_event pe
    WHERE pe.contract_id = c.id
  ) paid ON true
WHERE c.status IN ('ACTIVE', 'IN_ARREARS', 'RESTRUCTURED')
GROUP BY c.tenant_id, c.status, aging_bucket;

-- Refresh nightly via pg_cron:
-- SELECT cron.schedule('aging-report-refresh', '0 1 * * *',
--   'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_aging_report');
```

### 10.4 Projection Rebuild

When a projection becomes corrupted or the schema changes, a full rebuild is necessary.

#### Rebuild Procedure

1. **Pause consumers**: Stop the consumer group for the target projection.
2. **Clear target store**: Truncate the materialized view or clear the Redis/Elasticsearch index.
3. **Reset consumer offset**: Set the consumer group offset to the earliest position for the relevant topic.
4. **Replay**: Restart the consumer. It will re-process all events from the beginning.
5. **Verify**: Compare event counts and checksums between source and projection.
6. **Resume normal operation**: The consumer will catch up to the live stream.

For event-sourced aggregates, a targeted rebuild replays directly from the `domain_event` table:

```sql
-- Rebuild a single contract's projection
SELECT event_type, payload, created_at
FROM domain_event
WHERE aggregate_type = 'Contract'
  AND aggregate_id = :contract_id
  AND tenant_id = :tenant_id
ORDER BY id ASC;
```

For bulk rebuilds of all contracts in a tenant:

```sql
-- Bulk replay all contract events for a tenant, ordered by aggregate and version
SELECT aggregate_id, event_type, payload, created_at
FROM domain_event
WHERE aggregate_type = 'Contract'
  AND tenant_id = :tenant_id
ORDER BY aggregate_id, id ASC;
```

### 10.5 Event Store Maintenance

| Task | Schedule | Description |
|---|---|---|
| Partition management | Monthly | Create new partitions for `domain_event` table (monthly partitions) |
| Snapshot generation | Nightly | Create snapshots for active contracts with > 50 events since last snapshot |
| Archive old events | Quarterly | Move events older than 2 years to cold storage (S3/GCS); keep 7 years per NFR-07 |
| Index maintenance | Weekly | `REINDEX CONCURRENTLY` on `domain_event` indexes |
| Dead-letter processing | Daily | Review and replay events from dead-letter topics |
| Consumer lag monitoring | Continuous | Alert when consumer lag exceeds 10,000 events on any topic |
