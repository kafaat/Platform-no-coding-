# Testing Strategy — Dynamic Product System V2.0

# استراتيجية الاختبار — نظام المنتجات الديناميكي

| | |
|---|---|
| **Version** | 2.0 |
| **Date** | 2026-02-09 |
| **Status** | Draft for Review |
| **Audience** | QA Engineers, Developers, Architects, Product Managers |

---

## Table of Contents

1. [Overview](#1-overview)
2. [Test Categories](#2-test-categories)
3. [Test Cases (Detailed)](#3-test-cases-detailed)
4. [Test Data Strategy](#4-test-data-strategy)
5. [Test Environment](#5-test-environment)
6. [Test Automation](#6-test-automation)
7. [Traceability Matrix](#7-traceability-matrix)

---

## 1. Overview

### 1.1 Testing Pyramid

The testing strategy follows the standard testing pyramid, weighted toward fast, isolated unit tests at the base and fewer, slower end-to-end tests at the top.

```
            /  E2E Tests  \              ~5%   (Critical paths only)
           / Contract Tests \            ~5%   (API schema compliance)
          / Integration Tests \          ~25%  (DB, RLS, triggers, APIs)
         /     Unit Tests      \         ~65%  (Business logic, validation)
```

| Layer | Scope | Speed | Count Target |
|---|---|---|---|
| **Unit** | Functions, classes, validators | < 50ms each | ~500 tests |
| **Integration** | Database, stored procedures, API + DB | < 2s each | ~150 tests |
| **Contract** | API schema, request/response validation | < 500ms each | ~60 tests |
| **E2E** | Full user journeys, multi-service | < 30s each | ~30 tests |
| **Performance** | Load, stress, benchmarks | Minutes | ~15 scenarios |
| **Security** | Penetration, injection, access control | Minutes | ~20 scenarios |

### 1.2 Quality Gates

Each pull request and release must pass the following quality gates before merge or deployment:

| Gate | Criteria | Enforcement |
|---|---|---|
| **QG-1: Unit Tests** | 100% pass, >= 80% line coverage | CI blocks merge on failure |
| **QG-2: Integration Tests** | 100% pass | CI blocks merge on failure |
| **QG-3: Contract Tests** | 100% pass, OpenAPI spec compliance | CI blocks merge on failure |
| **QG-4: Security Scan** | No critical/high findings (OWASP ZAP) | CI blocks release on failure |
| **QG-5: Performance Baseline** | No regression > 10% from baseline | CI warns; manual review for release |
| **QG-6: E2E Critical Paths** | 100% pass on critical user journeys | CI blocks release on failure |
| **QG-7: Code Quality** | No new critical linting/static analysis issues | CI blocks merge on failure |

### 1.3 Coverage Targets

| Area | Target | Measurement |
|---|---|---|
| **Business logic (unit)** | >= 80% line coverage | Jest/Vitest coverage report |
| **Stored procedures** | 100% of `fn_*` functions tested | pgTAP test count vs function count |
| **API endpoints** | 100% of endpoints tested | Contract + integration test mapping |
| **Database triggers** | 100% of triggers tested | pgTAP test count vs trigger count |
| **RLS policies** | 100% of tenant-scoped tables verified | Dedicated tenant isolation suite |
| **Business rules (BR-*)** | 100% of BR rules have at least 1 test | Traceability matrix audit |
| **Critical paths (E2E)** | Loan lifecycle, reservation lifecycle, product lifecycle | E2E suite coverage |

---

## 2. Test Categories

### 2.1 Unit Tests

Unit tests validate isolated business logic functions without database or external service dependencies. All external dependencies are mocked or stubbed.

**Scope:**

| Area | Functions Under Test | Examples |
|---|---|---|
| **Interest Calculation** | FLAT interest, REDUCING (annuity) EMI, daily rate | `calculateFlatInterest(principal, rate, termMonths)` |
| **Payment Allocation** | Interest-first allocation, partial payment, overpayment | `allocatePayment(amount, interestDue, principalDue, feeDue)` |
| **Aging Classification** | Bucket determination from days overdue | `determineAgingBucket(daysOverdue)` => `'30' / '60' / '90' / '180' / '180+'` |
| **Penalty Calculation** | Late penalty amounts per aging bucket | `calculatePenalty(agingBucket)` => amount |
| **Early Settlement** | Outstanding balance + accrued interest + fee | `calculateEarlySettlement(outstanding, dailyRate, daysAccrued, fee)` |
| **Installment Generation** | Schedule generation with rounding correction | `generateSchedule(principal, rate, termMonths, type)` |
| **Validation Rules** | CEL expression parsing, JSON Schema validation | `validateCELExpression(expr)`, `validateAttributeValue(value, schema)` |
| **Data Transformation** | Request/response mapping, currency formatting | `formatCurrency(amount, currency)`, `mapContractToResponse(contract)` |
| **Day Count Convention** | 30E/360, ACT/365, ACT/360 daily rate | `calculateDailyRate(annualRate, dayCountConvention)` |
| **Version Overlap Detection** | Date range overlap checking | `hasDateOverlap(newFrom, newTo, existingFrom, existingTo)` |
| **Numbering Pattern** | Pattern parsing and formatting | `formatNumber(pattern, context, sequence)` |
| **Maker-Checker** | Validation that approver differs from creator | `validateMakerChecker(createdBy, approvedBy)` |

**Coverage Target:** >= 80% line coverage across all business logic modules.

**Tooling:** Jest or Vitest with coverage reporting (Istanbul/c8).

**Example Test:**

```typescript
describe('Interest Calculation', () => {
  describe('FLAT interest', () => {
    it('should calculate total interest as principal * rate * (term/12)', () => {
      const result = calculateFlatInterest(500000, 0.20, 12);
      expect(result.totalInterest).toBe(100000.00);
      expect(result.monthlyInterest).toBeCloseTo(8333.33, 2);
      expect(result.monthlyPrincipal).toBeCloseTo(41666.67, 2);
    });

    it('should handle rounding difference on last installment', () => {
      const schedule = generateFlatSchedule(100000, 0.10, 3);
      const totalPrincipal = schedule.reduce((sum, i) => sum + i.principalDue, 0);
      expect(totalPrincipal).toBe(100000.00); // Exact, no rounding loss
    });
  });

  describe('REDUCING interest (annuity)', () => {
    it('should calculate EMI using annuity formula', () => {
      const emi = calculateEMI(500000, 0.20 / 12, 12);
      expect(emi).toBeGreaterThan(0);
      // EMI = P * r * (1+r)^n / ((1+r)^n - 1)
    });

    it('should handle zero interest rate as equal principal division', () => {
      const emi = calculateEMI(120000, 0, 12);
      expect(emi).toBe(10000.00);
    });
  });
});

describe('Payment Allocation', () => {
  it('should allocate to interest first, then principal, then fees', () => {
    const result = allocatePayment(10000, 3000, 5000, 2000);
    expect(result.allocatedInterest).toBe(3000);
    expect(result.allocatedPrincipal).toBe(5000);
    expect(result.allocatedFee).toBe(2000);
    expect(result.remaining).toBe(0);
  });

  it('should handle partial payment (covers interest only)', () => {
    const result = allocatePayment(2000, 3000, 5000, 2000);
    expect(result.allocatedInterest).toBe(2000);
    expect(result.allocatedPrincipal).toBe(0);
    expect(result.allocatedFee).toBe(0);
    expect(result.remaining).toBe(0);
  });
});
```

---

### 2.2 Integration Tests

Integration tests verify the interaction between application code and real database infrastructure: stored procedures, triggers, RLS policies, and API endpoints backed by a real PostgreSQL instance.

#### 2.2.1 Stored Procedure Tests (pgTAP or Application-Level)

| Procedure | Test Scope |
|---|---|
| `fn_generate_installments` | FLAT schedule accuracy, REDUCING schedule accuracy, rounding correction on last installment, rejection for non-existent contract, rejection for wrong status, rejection when installments already exist, missing `annual_rate` or `term_months`, zero interest rate edge case |
| `fn_process_payment` | Allocation order (interest -> principal -> fees), installment status update (PARTIAL, PAID), idempotent duplicate handling (BR-11), contract auto-close when all installments paid, subledger entries generated, rejection for PAID/WAIVED installments, rejection for non-payable contract status |
| `fn_update_aging_buckets` | Correct bucket assignment (30/60/90/180/180+), penalty event creation per bucket, installment status set to LATE, contract status transition to IN_ARREARS, write-off at 180+ days, grace period handling, no duplicate penalties on same day |
| `fn_calculate_early_settlement` | Outstanding principal accuracy, accrued interest calculation per day count convention, settlement fee lookup from charges, rejection for non-active contracts, settlement date validation |
| `fn_expire_held_reservations` | Expire only HOLD reservations past TTL, do not touch CONFIRMED/COMPLETED, return correct count |
| `fn_refresh_materialized_views` | All four views refreshed without error, data consistency after refresh |
| `fn_check_version_overlap` | Trigger fires on INSERT and UPDATE, rejects overlapping ranges, allows adjacent non-overlapping ranges, handles NULL `effective_to` as open-ended |
| `fn_prevent_category_delete` | Blocks delete when active products exist, allows delete when only DRAFT/RETIRED products exist, allows delete when no products exist |
| `fn_set_updated_at` | `updated_at` changes on product UPDATE |

#### 2.2.2 RLS Tenant Isolation Tests

Test each RLS-enabled table to verify cross-tenant data isolation:

| Table | Verification |
|---|---|
| `customer` | Tenant A cannot read/write Tenant B's customers |
| `product` | Tenant A cannot read/write Tenant B's products |
| `product_category` | Tenant A cannot read/write Tenant B's categories |
| `contract` | Tenant A cannot read/write Tenant B's contracts |
| `reservation` | Tenant A cannot read/write Tenant B's reservations |
| `price_list` | Tenant A cannot read/write Tenant B's price lists |
| `charge` | Tenant A cannot read/write Tenant B's charges |
| `accounting_template` | Tenant A cannot read/write Tenant B's templates |
| `audit_log` | Tenant A cannot read Tenant B's audit logs |
| `numbering_scheme` | Tenant A cannot read/write Tenant B's numbering schemes |
| `attribute_definition` | Tenant A cannot read/write Tenant B's attribute definitions |
| `cancellation_policy` | Tenant A cannot read/write Tenant B's cancellation policies |

**Test Method:**
1. Create data under Tenant A (set `app.current_tenant` = A).
2. Switch session to Tenant B (set `app.current_tenant` = B).
3. Attempt SELECT, INSERT, UPDATE, DELETE on Tenant A's data.
4. Verify all operations either return empty results or are rejected.

#### 2.2.3 Trigger Validation Tests

| Trigger | Test Scenario |
|---|---|
| `trg_version_no_overlap` | Insert overlapping version -> exception raised; insert non-overlapping -> success; update to create overlap -> exception raised |
| `trg_prevent_category_delete` | Delete category with ACTIVE product -> exception; delete category with SUSPENDED product -> exception; delete category with only RETIRED products -> success |
| `trg_product_updated_at` | Update product record -> `updated_at` is refreshed to `now()` |

#### 2.2.4 API Endpoint Tests (with Real Database)

Every API endpoint from the specification is tested with a real PostgreSQL database, verifying full request-response cycle including database state changes.

| Endpoint | Test Scope |
|---|---|
| `POST /api/v1/products` | Creates DRAFT product, returns 201, persisted in DB |
| `GET /api/v1/products` | Pagination, filtering by type/status/category, tenant isolation |
| `GET /api/v1/products/{id}` | Returns full product with relations, 404 for non-existent |
| `POST /api/v1/products/{id}/versions` | Creates version, overlap rejection, version_no auto-increment |
| `PUT /api/v1/products/{id}/status` | Maker-Checker enforcement, valid state transitions only |
| `POST /api/v1/pricing/quote` | Correct price with rules, CEL evaluation, multi-currency |
| `POST /api/v1/numbering/reserve` | Atomic increment, no duplicates under concurrency |
| `POST /api/v1/contracts` | Creates DRAFT contract, validates product is FINANCIAL |
| `POST /api/v1/contracts/{id}/schedule` | Generates installments via `fn_generate_installments` |
| `POST /api/v1/contracts/{id}/payments` | Payment processing, idempotency, subledger entries |
| `GET /api/v1/contracts/{id}/statement` | Correct entries, date filtering, running balance |
| `GET /api/v1/reservations/availability` | Correct capacity minus booked |
| `POST /api/v1/reservations` | Creates HOLD reservation with TTL |
| `PUT /api/v1/reservations/{id}/confirm` | Transitions to CONFIRMED after payment |
| `PUT /api/v1/reservations/{id}/cancel` | Cancellation penalty calculation |
| `POST /api/v1/categories` | Creates category, parent-child relationship |
| `DELETE /api/v1/categories/{id}` | BR-09 enforcement, returns 409 on active products |

---

### 2.3 Contract Tests (API)

Contract tests ensure the API adheres to the published specification (OpenAPI) and that consumers and providers agree on request/response formats.

**Approach:** Consumer-Driven Contract Testing (CDCT).

| Area | Verification |
|---|---|
| **OpenAPI Spec Compliance** | Every endpoint response matches the OpenAPI schema definition |
| **Request Schema Validation** | Invalid request bodies return 400 with consistent error format |
| **Response Schema Validation** | Every response includes all required fields with correct types |
| **Error Format Consistency** | All errors follow `{ error: { code, message, details, request_id } }` |
| **Header Enforcement** | Missing `Authorization` -> 401; Missing `X-Tenant-ID` -> 400; Missing `X-Idempotency-Key` on write -> 400 |
| **Pagination Contract** | All list endpoints return `{ data, total, page, size, has_next }` |
| **Content-Type** | All responses return `application/json` with correct charset |
| **Rate Limit Headers** | Every response includes `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` |

**Tools:** Pact (consumer-driven contracts), Prism (OpenAPI mock/validation), or custom schema validators.

**Example Contract Test:**

```typescript
describe('Contract API Schema Compliance', () => {
  it('POST /api/v1/contracts response matches schema', async () => {
    const response = await api.post('/api/v1/contracts', validContractPayload);
    expect(response.status).toBe(201);
    expect(response.body).toMatchSchema({
      type: 'object',
      required: ['contract_id', 'contract_number', 'status', 'principal', 'currency'],
      properties: {
        contract_id: { type: 'integer' },
        contract_number: { type: 'string' },
        status: { type: 'string', enum: ['DRAFT'] },
        principal: { type: 'number', minimum: 0 },
        currency: { type: 'string' }
      }
    });
  });

  it('returns consistent error format on validation failure', async () => {
    const response = await api.post('/api/v1/contracts', { principal: -100 });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error.code');
    expect(response.body).toHaveProperty('error.message');
    expect(response.body).toHaveProperty('error.request_id');
  });
});
```

---

### 2.4 End-to-End Tests

E2E tests validate complete user journeys across the entire system, simulating real user behavior from API calls through database state changes.

#### E2E-01: Full Loan Lifecycle

```
1. Create FINANCIAL product (DRAFT)
2. Add version with effective dates
3. Configure pricing (interest rate, fees)
4. Configure eligibility rules (KYC level, score threshold)
5. Configure charges (processing fee, late penalty, early settlement fee)
6. Configure accounting templates (disbursement, payment, penalty)
7. Maker-Checker activation (different user approves)
8. Create customer with FULL KYC
9. Create contract (DRAFT) -> reserve contract number
10. Generate installment schedule (REDUCING interest)
11. Activate contract -> disbursement subledger entry
12. Pay first 6 installments on time
13. Miss 2 installments -> aging escalation (30d, 60d)
14. Pay overdue installments with penalties
15. Request early settlement for remaining installments
16. Process settlement payment -> contract CLOSED
17. Verify all subledger entries balance
18. Verify audit log captures every state change
```

#### E2E-02: Full Reservation Lifecycle

```
1. Create RESERVATION product (hotel room type)
2. Configure capacity (e.g., 10 rooms)
3. Configure pricing (per-night rate)
4. Configure cancellation policy (rules JSONB)
5. Activate product
6. Check availability for date range -> shows capacity
7. Create reservation (HOLD) with 15-minute TTL
8. Verify available capacity decremented
9. Confirm reservation with payment reference
10. Verify status = CONFIRMED
11. Cancel reservation -> penalty calculated per policy
12. Verify capacity restored
13. Create another HOLD -> let TTL expire -> verify EXPIRED status
14. Verify expired reservation capacity is restored
```

#### E2E-03: Product Lifecycle with Maker-Checker

```
1. User A creates product (DRAFT)
2. User A adds version, attributes, pricing, channels
3. User A submits for activation
4. User A attempts to approve own product -> REJECTED (BR-07)
5. User B approves -> product status = ACTIVE
6. Product appears in catalog (mv_product_catalog after refresh)
7. User C suspends product -> status = SUSPENDED
8. Channels disabled
9. User C retires product -> status = RETIRED
10. Verify complete audit trail in audit_log and state_transition
```

#### E2E-04: Multi-Tenant Complete Isolation

```
1. Tenant A: Create product, contract, reservation
2. Tenant B: Create product, contract, reservation
3. Tenant A: Query all products -> sees only Tenant A data
4. Tenant B: Query all products -> sees only Tenant B data
5. Tenant A: Attempt to access Tenant B contract by ID -> 404
6. Verify audit logs are isolated per tenant
7. Verify numbering sequences are isolated per tenant
```

#### E2E-05: Contract Write-Off Flow

```
1. Create and activate loan contract
2. Generate installment schedule
3. Process 2 on-time payments
4. Stop paying -> simulate aging at 30, 60, 90, 180+ days
5. Verify penalty events at each aging bucket
6. Verify contract status transitions: ACTIVE -> IN_ARREARS -> WRITTEN_OFF
7. Verify subledger write-off entries
8. Verify contract cannot accept payments after WRITTEN_OFF
```

---

### 2.5 Performance Tests

Performance tests validate the system meets NFR-01 targets under expected and peak load conditions.

#### 2.5.1 Load Testing Targets (from NFR-01)

| Metric | Target | Test Scenario |
|---|---|---|
| **Read throughput** | 1000 TPS | Concurrent GET requests to product catalog, contract list, availability |
| **Write throughput** | 200 TPS | Concurrent POST/PUT requests for payments, reservations, product updates |
| **Concurrent users** | 500 | Ramped load from 50 to 500 users over 5 minutes |
| **Pricing latency (95p)** | <= 200ms | `POST /api/v1/pricing/quote` with CEL rules under load |
| **Attributes latency (95p)** | <= 200ms | `GET /api/v1/products/{id}` with EAV attribute resolution |
| **Numbering latency (95p)** | <= 400ms | `POST /api/v1/numbering/reserve` under concurrent requests from 10 branches |
| **Contract creation latency** | <= 2s | Full saga: eligibility check + number reservation + contract creation |

#### 2.5.2 Database Query Performance Benchmarks

| Query Pattern | Data Volume | Target | Index Used |
|---|---|---|---|
| Product search by tenant + status + type | 100K products | < 50ms | `idx_product_tenant_status`, `idx_product_active` |
| Contract search by tenant + status | 1M contracts | < 100ms | `idx_contract_tenant_status`, `idx_contract_active` |
| Installment lookup by contract + status + due date | 10M installments | < 50ms | `idx_installment_contract_status_due` |
| Payment event lookup by contract + date range | 5M payment events | < 100ms | `idx_payment_event_contract_paid` |
| Subledger entries by contract + date range | 10M entries | < 100ms | `idx_subledger_contract`, `idx_subledger_event_posted` |
| JSONB query on product payload | 100K products | < 100ms | `idx_product_payload_gin` |
| JSONB query on contract meta | 1M contracts | < 100ms | `idx_contract_meta_gin` |
| Attribute value lookup by product | 500K attribute values | < 50ms | `idx_attr_val_product`, `idx_attr_val_json` |
| Reservation availability check | 100K reservations | < 100ms | `idx_reservation_product_slot` |

#### 2.5.3 Materialized View Refresh Performance

| View | Data Volume | Target Refresh Time | Frequency |
|---|---|---|---|
| `mv_product_catalog` | 100K products | < 30s | Every 5 minutes |
| `mv_contract_portfolio` | 1M contracts | < 60s | Every 15 minutes |
| `mv_aging_report` | 1M contracts, 10M installments | < 120s | Every hour |
| `mv_revenue_summary` | 1M contracts, 5M payments | < 120s | Every hour |

#### 2.5.4 Installment Generation Performance

| Scenario | Contract Count | Term (months) | Target |
|---|---|---|---|
| Single contract, 12 months FLAT | 1 | 12 | < 100ms |
| Single contract, 60 months REDUCING | 1 | 60 | < 200ms |
| Single contract, 360 months REDUCING | 1 | 360 | < 500ms |
| Batch: 100 contracts, 12 months each | 100 | 12 | < 5s |
| Batch: 1000 contracts, 12 months each | 1000 | 12 | < 30s |

#### 2.5.5 Stress Testing

| Scenario | Description |
|---|---|
| **Numbering contention** | 100 concurrent requests to `POST /api/v1/numbering/reserve` for the same scheme/branch -> no duplicates, no gaps (unless policy=ALLOW) |
| **Payment storm** | 500 concurrent payment events on different contracts -> all processed, all subledger entries created |
| **Reservation rush** | 200 concurrent HOLD requests for the same product slot -> only capacity-many succeed, rest receive 409 |
| **Materialized view refresh under write load** | Refresh all views while processing 200 TPS writes -> no deadlocks, refresh completes within 2x normal time |

**Tooling:** k6 (primary), with Grafana dashboards for real-time metrics.

---

### 2.6 Security Tests

Security testing validates OWASP Top 10 compliance, tenant isolation, authentication enforcement, and data protection.

#### 2.6.1 SQL Injection

| Test ID | Target | Payload | Expected |
|---|---|---|---|
| SEC-01 | Product name fields | `'; DROP TABLE product; --` | Input sanitized, no SQL execution |
| SEC-02 | Query parameters | `?type=PHYSICAL' OR '1'='1` | Parameterized query, no data leak |
| SEC-03 | JSONB fields (payload, meta) | `{"key": "'; DELETE FROM contract; --"}` | Stored as literal string, no execution |
| SEC-04 | CEL expression fields | `condition_cel` with SQL injection | CEL engine rejects, no DB access |

#### 2.6.2 Cross-Tenant Access (RLS Bypass Attempts)

| Test ID | Attack Vector | Expected |
|---|---|---|
| SEC-05 | Direct SQL with `SET app.current_tenant` to another tenant | Application layer prevents session variable override |
| SEC-06 | API request with forged `X-Tenant-ID` header | Token validation confirms tenant claim matches header |
| SEC-07 | Accessing resource by ID belonging to another tenant | 404 (not 403) to avoid information disclosure |
| SEC-08 | Bulk export attempting to include cross-tenant data | Only current tenant data returned |
| SEC-09 | Join-based leakage (e.g., contract -> customer of another tenant) | RLS prevents cross-tenant joins |

#### 2.6.3 Authentication and Authorization

| Test ID | Scenario | Expected |
|---|---|---|
| SEC-10 | Request without `Authorization` header | 401 Unauthorized |
| SEC-11 | Request with expired JWT token | 401 Unauthorized |
| SEC-12 | Request with valid token but insufficient role | 403 Forbidden |
| SEC-13 | Maker-Checker: same user attempts create and approve | 403 / business rule rejection (BR-07) |
| SEC-14 | Token from Tenant A used to access Tenant B | 403 Forbidden |

#### 2.6.4 Rate Limiting

| Test ID | Scenario | Expected |
|---|---|---|
| SEC-15 | Exceed 1000 read requests/minute (standard tier) | 429 Rate Limited after threshold |
| SEC-16 | Exceed 200 write requests/minute (standard tier) | 429 Rate Limited after threshold |
| SEC-17 | Verify `X-RateLimit-*` headers present | Headers included in every response |
| SEC-18 | Rate limit isolation per tenant | Tenant A's rate does not affect Tenant B |

#### 2.6.5 OWASP ZAP Automated Scan

| Scan Type | Scope | Frequency |
|---|---|---|
| **Baseline scan** | All API endpoints | Every CI build |
| **Full scan** | All endpoints with authentication | Weekly |
| **API scan** | OpenAPI specification-driven | Every release |

**Targets:** Zero critical findings, zero high findings. Medium findings must be triaged within 5 business days.

#### 2.6.6 Additional Security Checks

| Test ID | Area | Verification |
|---|---|---|
| SEC-19 | PII encryption | Verify customer PII (phone, email) is encrypted at rest (AES-256) |
| SEC-20 | Audit log immutability | Verify audit_log records cannot be updated or deleted via API |
| SEC-21 | Idempotency key exposure | Verify idempotency keys are not returned in list endpoints |
| SEC-22 | Error information disclosure | Verify 500 errors do not expose stack traces or internal details |

---

## 3. Test Cases (Detailed)

### 3.1 Product Management (منتجات)

#### TC-P01: Create product with all 5 types

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-010 |
| **Preconditions** | Active tenant, active category for each type |
| **Steps** | 1. For each type (`PHYSICAL`, `DIGITAL`, `SERVICE`, `RESERVATION`, `FINANCIAL`): POST `/api/v1/products` with `{ category_id, type, name_ar, name_en }` |
| **Expected** | 201 Created for each. Response contains `id`, `status: "DRAFT"`, `created_at`. Database record has correct `tenant_id`, `type`, and `status = 'DRAFT'`. |

#### TC-P02: Version overlap prevention (BR-01)

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-011, BR-01 |
| **Preconditions** | Product exists with version: `effective_from = 2026-01-01`, `effective_to = 2026-06-30` |
| **Steps** | 1. POST new version with `effective_from = 2026-03-01`, `effective_to = 2026-09-30` (overlaps). 2. POST new version with `effective_from = 2026-07-01`, `effective_to = 2026-12-31` (no overlap). |
| **Expected** | Step 1: 409 Conflict with error message mentioning "overlaps". Step 2: 201 Created. |

#### TC-P03: Maker-Checker activation (BR-07)

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-013, BR-07 |
| **Preconditions** | Product in DRAFT status, created by `user-A` |
| **Steps** | 1. PUT `/api/v1/products/{id}/status` with `{ status: "ACTIVE", approved_by: "user-A" }` (same user). 2. PUT `/api/v1/products/{id}/status` with `{ status: "ACTIVE", approved_by: "user-B" }` (different user). |
| **Expected** | Step 1: 403 or 422 — "Approver must be a different user than the creator" (BR-07). Step 2: 200 OK, product status = ACTIVE, `approved_by = "user-B"`, `approved_at` set. |

#### TC-P04: Category deletion with active products (BR-09)

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-001, BR-09 |
| **Preconditions** | Category with one ACTIVE product and one DRAFT product |
| **Steps** | 1. DELETE `/api/v1/categories/{id}` (has active product). 2. Retire the active product. 3. DELETE `/api/v1/categories/{id}` again. |
| **Expected** | Step 1: 409 Conflict — "Cannot delete category — it has active products. Disable it instead." Step 3: 200 OK (or 204) — category deleted. |

#### TC-P05: EAV attribute validation

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-020, FR-021 |
| **Preconditions** | Attribute definition: code=`COLOR`, datatype=`ENUM`, validation=`{"allowed": ["RED","BLUE","GREEN"]}` |
| **Steps** | 1. PUT `/api/v1/products/{id}/attributes` with `{ values: [{ attribute_id: X, value_text: "RED" }] }`. 2. PUT with `value_text: "YELLOW"` (not in allowed set). 3. PUT a NUMBER attribute with `value_number: null` where `required: true`. |
| **Expected** | Step 1: 200 OK. Step 2: 422 Validation Error — "YELLOW not in allowed values". Step 3: 422 — "Required attribute cannot be null". |

#### TC-P06: Product type constraint

| | |
|---|---|
| **Priority** | P2 |
| **Requirement** | FR-010 |
| **Preconditions** | Active tenant and category |
| **Steps** | 1. POST product with `type: "INVALID_TYPE"`. |
| **Expected** | 400 Bad Request — type must be one of PHYSICAL, DIGITAL, SERVICE, RESERVATION, FINANCIAL. |

#### TC-P07: Product status transitions

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-010 |
| **Preconditions** | Product in DRAFT status |
| **Steps** | 1. Activate product (DRAFT -> ACTIVE). 2. Suspend product (ACTIVE -> SUSPENDED). 3. Reactivate (SUSPENDED -> ACTIVE). 4. Retire product (ACTIVE -> RETIRED). 5. Attempt to activate retired product (RETIRED -> ACTIVE). |
| **Expected** | Steps 1-4: Success with correct status changes and state_transition records. Step 5: 422 — invalid state transition (RETIRED is terminal). |

#### TC-P08: Bilingual name support (name_ar / name_en)

| | |
|---|---|
| **Priority** | P2 |
| **Requirement** | NFR-03 |
| **Preconditions** | Active tenant |
| **Steps** | 1. Create product with `name_ar: "قرض شخصي"`, `name_en: "Personal Loan"`. 2. GET product. 3. Create product with `name_ar` only (name_en null). |
| **Expected** | Step 2: Both names returned correctly with proper encoding. Step 3: 201 Created — `name_en` is null/optional. |

#### TC-P09: Product version with open-ended effective_to

| | |
|---|---|
| **Priority** | P2 |
| **Requirement** | FR-011 |
| **Preconditions** | Product exists with no versions |
| **Steps** | 1. Add version with `effective_from: "2026-01-01"`, `effective_to: null`. 2. Add another version with `effective_from: "2026-06-01"`, `effective_to: null`. |
| **Expected** | Step 1: 201 Created. Step 2: 409 Conflict — the open-ended first version overlaps (treated as `effective_to = 9999-12-31`). |

#### TC-P10: Product divisibility flag

| | |
|---|---|
| **Priority** | P3 |
| **Requirement** | FR-010 |
| **Preconditions** | Active tenant and category |
| **Steps** | 1. Create product with `divisible: true`. 2. Create product with `divisible: false`. 3. GET both products. |
| **Expected** | Divisibility flag correctly persisted and returned in both cases. |

#### TC-P11: Product lifecycle date validation

| | |
|---|---|
| **Priority** | P2 |
| **Requirement** | FR-010 |
| **Preconditions** | Active tenant |
| **Steps** | 1. Create product with `lifecycle_from: "2026-01-01"`, `lifecycle_to: "2025-01-01"` (to before from). |
| **Expected** | 400 or 422 — lifecycle_to must be after lifecycle_from. |

#### TC-P12: Product JSONB payload storage

| | |
|---|---|
| **Priority** | P2 |
| **Requirement** | FR-010 |
| **Preconditions** | Active product |
| **Steps** | 1. Create product with `payload: { "warranty_months": 12, "return_policy": "30_DAYS" }`. 2. GET product. 3. Query using GIN index (internal DB test). |
| **Expected** | Payload stored and returned as-is. GIN index query returns correct results. |

#### TC-P13: Channel activation without pricing (BR-02)

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-012, FR-060, BR-02 |
| **Preconditions** | Active product with no price list |
| **Steps** | 1. PUT `/api/v1/products/{id}/channels` with `{ channels: [{ channel_id: 1, enabled: true }] }`. |
| **Expected** | 422 — "Cannot activate channel without active pricing" (BR-02). |

#### TC-P14: Product composition (BOM) self-reference prevention

| | |
|---|---|
| **Priority** | P2 |
| **Requirement** | FR-031 |
| **Preconditions** | Product A exists |
| **Steps** | 1. Add composition with `parent_product_id = A`, `child_product_id = A`. |
| **Expected** | 400 or 422 — database CHECK constraint `parent_product_id != child_product_id` prevents self-reference. |

#### TC-P15: Product search and pagination

| | |
|---|---|
| **Priority** | P2 |
| **Requirement** | FR-004, FR-150 |
| **Preconditions** | 50 products of mixed types and statuses |
| **Steps** | 1. GET `/api/v1/products?type=FINANCIAL&status=ACTIVE&page=1&size=10`. 2. GET `?page=2&size=10`. 3. GET `?size=200` (exceeds max). |
| **Expected** | Step 1: Returns max 10 ACTIVE FINANCIAL products with correct total count. Step 2: Returns next page. Step 3: 400 or capped to `size=100`. |

---

### 3.2 Financial Contracts (العقود المالية)

#### TC-C01: Create contract with FLAT interest

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-130, FR-131 |
| **Preconditions** | Active FINANCIAL product, customer with FULL KYC |
| **Steps** | 1. POST `/api/v1/contracts` with `{ product_id, customer_id, principal: 500000, currency: "YER", terms: { duration_months: 12, interest_type: "FLAT", day_count: "30E/360" } }`. 2. Verify contract created. |
| **Expected** | 201 Created. Contract status = DRAFT. `interest_type = FLAT`. `principal = 500000`. Contract number reserved. |

#### TC-C02: Create contract with REDUCING interest

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-130, FR-131 |
| **Preconditions** | Active FINANCIAL product, customer with FULL KYC |
| **Steps** | 1. POST `/api/v1/contracts` with `interest_type: "REDUCING"`. 2. Generate schedule. 3. Verify EMI calculation. |
| **Expected** | EMI = P * r * (1+r)^n / ((1+r)^n - 1). Interest portion decreases each month. Principal portion increases each month. Total principal across all installments equals contract principal exactly. |

#### TC-C03: Installment generation accuracy (FLAT)

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-111, FR-131 |
| **Preconditions** | Contract: principal=100,000, annual_rate=0.12, term_months=12, FLAT |
| **Steps** | 1. Call `fn_generate_installments(contract_id)`. 2. Query all installments. |
| **Expected** | 12 installments. Total interest = 100,000 * 0.12 * (12/12) = 12,000. Monthly principal = 8,333.33 (last = 8,333.37 for rounding). Monthly interest = 1,000.00. Sum of all principal_due = 100,000 exactly. Sum of all interest_due = 12,000 exactly. |

#### TC-C04: Payment processing with allocation

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-130, FR-131 |
| **Preconditions** | Active contract with installment: principal_due=8333.33, interest_due=1000.00, fee_due=500.00 |
| **Steps** | 1. Call `fn_process_payment(contract_id, installment_id, 9833.33, 'BRANCH', 'idempkey-001')`. |
| **Expected** | Allocation: interest=1000.00, principal=8333.33, fee=500.00. Installment status = PAID. Payment event recorded. Two subledger entries: PAYMENT_PRINCIPAL (CASH debit, LOAN_RECEIVABLE credit) and PAYMENT_INTEREST (CASH debit, INTEREST_INCOME credit). |

#### TC-C05: Idempotent payment (BR-11)

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-152, BR-11 |
| **Preconditions** | Active contract with unpaid installment |
| **Steps** | 1. Call `fn_process_payment(...)` with `idempotency_key = 'PAY-001'`. 2. Call again with same `idempotency_key = 'PAY-001'`. |
| **Expected** | First call: new payment_event created, returns payment_id. Second call: returns the same payment_id from step 1, no duplicate records, no duplicate subledger entries. Installment paid amounts unchanged from first call. |

#### TC-C06: Late payment penalty (BR-05)

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-100, FR-132, BR-05 |
| **Preconditions** | Active contract, installment overdue by 10 days (past grace period of 5 days) |
| **Steps** | 1. Run `fn_update_aging_buckets()`. 2. Verify penalty event. 3. Process payment including penalty fee. |
| **Expected** | Installment status = LATE. Penalty event created with `kind = 'LATE_PENALTY'`, `aging_bucket = '30'`, `amount = 50.00`. Contract status = IN_ARREARS. |

#### TC-C07: Aging bucket escalation (BR-08)

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-134, BR-08 |
| **Preconditions** | Contract with installments overdue at various periods |
| **Steps** | 1. Set installment overdue 15 days -> run aging. 2. Set overdue 35 days -> run aging. 3. Set overdue 65 days -> run aging. 4. Set overdue 95 days -> run aging. 5. Set overdue 185 days -> run aging. |
| **Expected** | Step 1: bucket='30', penalty=50.00, contract IN_ARREARS. Step 2: bucket='60', penalty=100.00. Step 3: bucket='90', penalty=200.00. Step 4: bucket='180', penalty=500.00. Step 5: bucket='180+', penalty=1000.00, contract WRITTEN_OFF. |

#### TC-C08: Early settlement calculation

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-133 |
| **Preconditions** | Active contract, 6 of 12 installments paid, annual_rate=0.20, EARLY_SETTLEMENT_FEE charge linked |
| **Steps** | 1. Call `fn_calculate_early_settlement(contract_id, settlement_date)`. |
| **Expected** | Returns `outstanding_principal` (sum of remaining unpaid principal across installments), `accrued_interest` (calculated using day count convention), `settlement_fee` (from product charges), `total_settlement` (sum of all three). |

#### TC-C09: Contract closure on full payment

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-130, FR-132 |
| **Preconditions** | Active contract with 3 installments, first 2 already PAID |
| **Steps** | 1. Process payment for the last installment (full amount). 2. Check contract status. |
| **Expected** | Last installment status = PAID. Contract status = CLOSED. `closed_at` is set. No more payments accepted. |

#### TC-C10: Write-off after 180+ days (BR-08)

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-132, FR-134, BR-08 |
| **Preconditions** | Contract with installment overdue 185 days |
| **Steps** | 1. Run `fn_update_aging_buckets()`. 2. Attempt payment on the written-off contract. |
| **Expected** | Step 1: Contract status = WRITTEN_OFF. Penalty event with bucket='180+' and amount=1000.00. Step 2: Payment rejected — "Cannot process payment for contract with status=WRITTEN_OFF". |

#### TC-C11: Contract creation with missing documents (BR-03)

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-091, FR-111, BR-03 |
| **Preconditions** | FINANCIAL product with mandatory document requirements |
| **Steps** | 1. Create contract without completing mandatory documents. 2. Attempt to generate installments. |
| **Expected** | Installment generation rejected — "Cannot generate installments before mandatory documents are complete" (BR-03). |

#### TC-C12: Contract disbursement without number reservation (BR-04)

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-072, FR-130, BR-04 |
| **Preconditions** | Contract in DRAFT without contract_number |
| **Steps** | 1. Attempt to activate (disburse) contract without reserving a contract number. |
| **Expected** | Rejected — "Cannot disburse loan before reserving a valid contract number" (BR-04). |

#### TC-C13: Subledger entry balancing

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-082 |
| **Preconditions** | Contract with multiple payments processed |
| **Steps** | 1. Query all subledger_entry records for a contract. 2. Sum all amounts by dr_account and cr_account. |
| **Expected** | Total debits = total credits. Each entry has a unique idempotency_key. Amount > 0 (enforced by CHECK constraint). |

#### TC-C14: Installment generation rejection for existing installments

| | |
|---|---|
| **Priority** | P2 |
| **Requirement** | FR-111 |
| **Preconditions** | Contract with installments already generated |
| **Steps** | 1. Call `fn_generate_installments(contract_id)` again. |
| **Expected** | Exception: "Installments already exist for contract id=X". |

#### TC-C15: Payment on already-paid installment

| | |
|---|---|
| **Priority** | P2 |
| **Requirement** | FR-130 |
| **Preconditions** | Contract with installment status = PAID |
| **Steps** | 1. Attempt `fn_process_payment(...)` on the PAID installment. |
| **Expected** | Exception: "Installment id=X is already PAID -- cannot accept payment". |

#### TC-C16: Partial payment handling

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-130 |
| **Preconditions** | Installment: principal_due=10000, interest_due=2000, fee_due=500 |
| **Steps** | 1. Process payment of 1500 (less than interest due). |
| **Expected** | Allocation: interest=1500, principal=0, fee=0. Installment status = PARTIAL. Paid_interest = 1500. |

#### TC-C17: Zero interest rate contract

| | |
|---|---|
| **Priority** | P2 |
| **Requirement** | FR-131 |
| **Preconditions** | Contract with annual_rate=0, REDUCING interest type |
| **Steps** | 1. Generate installments. |
| **Expected** | EMI = principal / term_months. All interest_due = 0. Total principal_due = principal exactly. |

#### TC-C18: Day count convention impact

| | |
|---|---|
| **Priority** | P2 |
| **Requirement** | FR-131 |
| **Preconditions** | Three contracts with same principal and rate but different day_count: 30E/360, ACT/365, ACT/360 |
| **Steps** | 1. Calculate early settlement for each on the same date. |
| **Expected** | Different accrued interest amounts. ACT/360 > ACT/365 > 30E/360 (for same period). Daily rate: 30E/360 = rate/360, ACT/365 = rate/365, ACT/360 = rate/360. |

#### TC-C19: Contract status transition validation

| | |
|---|---|
| **Priority** | P2 |
| **Requirement** | FR-132 |
| **Preconditions** | Contract in various states |
| **Steps** | 1. DRAFT -> ACTIVE (valid). 2. ACTIVE -> IN_ARREARS (valid, via aging). 3. IN_ARREARS -> CLOSED (valid, via full payment). 4. CLOSED -> ACTIVE (invalid). 5. WRITTEN_OFF -> ACTIVE (invalid). |
| **Expected** | Steps 1-3: Success. Steps 4-5: Rejected — invalid state transition. |

#### TC-C20: Multi-currency contract

| | |
|---|---|
| **Priority** | P2 |
| **Requirement** | FR-130, NFR-03 |
| **Preconditions** | Tenant with YER, USD, SAR support |
| **Steps** | 1. Create contract in YER. 2. Create contract in USD. 3. Create contract in SAR. |
| **Expected** | Each contract stores and returns correct currency. Installment amounts in the correct currency. Subledger entries in the correct currency. |

---

### 3.3 Reservations (الحجوزات)

#### TC-R01: Availability check

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-120 |
| **Preconditions** | RESERVATION product with capacity=10, 3 confirmed reservations for the target slot |
| **Steps** | 1. GET `/api/v1/reservations/availability?product_id=X&from=...&to=...`. |
| **Expected** | 200 OK. `capacity: 10`, `booked: 3`, `available: true`. Available count = 7. |

#### TC-R02: Hold with TTL

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-041, FR-120 |
| **Preconditions** | Available slot for the product |
| **Steps** | 1. POST `/api/v1/reservations` with slot_from, slot_to. |
| **Expected** | 201 Created. `status: "HOLD"`. `hold_until` is set (current time + TTL). Available capacity decremented by 1. |

#### TC-R03: Auto-expire past TTL (BR-10)

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-041, BR-10 |
| **Preconditions** | HOLD reservation with `hold_until` in the past |
| **Steps** | 1. Call `fn_expire_held_reservations()`. 2. Query reservation status. |
| **Expected** | Reservation status = EXPIRED. Available capacity restored. Function returns count of expired reservations (>= 1). |

#### TC-R04: Confirm with payment

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-120 |
| **Preconditions** | HOLD reservation within TTL |
| **Steps** | 1. PUT `/api/v1/reservations/{id}/confirm` with `{ payment_ref: "PAY-XYZ" }`. |
| **Expected** | 200 OK. `status: "CONFIRMED"`. `hold_until` cleared (no longer relevant). Capacity remains allocated. |

#### TC-R05: Cancel with penalty (BR-15)

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-120, BR-15 |
| **Preconditions** | CONFIRMED reservation with cancellation_policy that charges 50% if cancelled within 24h of slot |
| **Steps** | 1. PUT `/api/v1/reservations/{id}/cancel` (within 24h of slot_from). |
| **Expected** | 200 OK. `status: "CANCELLED"`. Penalty calculated per policy (e.g., 50% of deposit). Capacity restored. |

#### TC-R06: Overlapping reservation prevention

| | |
|---|---|
| **Priority** | P2 |
| **Requirement** | FR-120, FR-040 |
| **Preconditions** | Product with capacity=1, one CONFIRMED reservation for the slot |
| **Steps** | 1. POST new reservation for the same slot. |
| **Expected** | 409 Conflict — no available capacity for this slot. |

#### TC-R07: Reservation for non-RESERVATION product type

| | |
|---|---|
| **Priority** | P2 |
| **Requirement** | FR-120 |
| **Preconditions** | PHYSICAL product (not RESERVATION type) |
| **Steps** | 1. POST reservation for the PHYSICAL product. |
| **Expected** | 422 — "Reservations can only be created for RESERVATION type products". |

#### TC-R08: Confirm expired reservation

| | |
|---|---|
| **Priority** | P2 |
| **Requirement** | FR-120, BR-10 |
| **Preconditions** | EXPIRED reservation |
| **Steps** | 1. PUT `/api/v1/reservations/{id}/confirm`. |
| **Expected** | 422 — "Cannot confirm an EXPIRED reservation". |

#### TC-R09: Slot validation (slot_to > slot_from)

| | |
|---|---|
| **Priority** | P2 |
| **Requirement** | FR-120 |
| **Preconditions** | Available product |
| **Steps** | 1. POST reservation with `slot_to` before `slot_from`. |
| **Expected** | 400 — CHECK constraint violation: `slot_to > slot_from`. |

#### TC-R10: Deposit amount handling

| | |
|---|---|
| **Priority** | P3 |
| **Requirement** | FR-120 |
| **Preconditions** | Reservation product with required deposit |
| **Steps** | 1. Create reservation with deposit_amount = 500.00. 2. Cancel with penalty calculation based on deposit. |
| **Expected** | Deposit correctly stored. Cancellation penalty calculated as percentage of deposit per cancellation_policy rules. |

---

### 3.4 Multi-Tenancy (العزل بين المستأجرين)

#### TC-T01: RLS prevents cross-tenant reads

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-160, BR-12 |
| **Preconditions** | Tenant A with products, Tenant B with products |
| **Steps** | 1. Set session to Tenant A (`app.current_tenant = A`). 2. SELECT from product table. 3. Set session to Tenant B. 4. SELECT from product table. |
| **Expected** | Step 2: Only Tenant A products returned. Step 4: Only Tenant B products returned. No overlap. |

#### TC-T02: RLS prevents cross-tenant writes

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-160, BR-12 |
| **Preconditions** | Tenant A with product ID=100 |
| **Steps** | 1. Set session to Tenant B. 2. UPDATE product SET name_ar='hacked' WHERE id=100. 3. DELETE FROM product WHERE id=100. |
| **Expected** | Step 2: 0 rows updated (RLS filters out Tenant A rows). Step 3: 0 rows deleted. |

#### TC-T03: Missing tenant header rejection

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-160 |
| **Preconditions** | Valid auth token |
| **Steps** | 1. Send GET `/api/v1/products` without `X-Tenant-ID` header. |
| **Expected** | 400 Bad Request — "X-Tenant-ID header is required". |

#### TC-T04: Tenant-scoped numbering isolation

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-070, FR-160 |
| **Preconditions** | Both tenants have numbering scheme with code `CONTRACT_NUM` |
| **Steps** | 1. Tenant A: Reserve 5 numbers. 2. Tenant B: Reserve 3 numbers. 3. Query sequences for each tenant. |
| **Expected** | Tenant A sequence = 5. Tenant B sequence = 3. Sequences are independent. Numbers do not overlap or interfere. |

#### TC-T05: Cross-tenant API access with different tenant token

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-160, BR-12 |
| **Preconditions** | Tenant A token, Tenant B contract |
| **Steps** | 1. Using Tenant A token, GET `/api/v1/contracts/{tenant_b_contract_id}` with `X-Tenant-ID: A`. |
| **Expected** | 404 Not Found (not 403, to avoid information disclosure). |

#### TC-T06: Tenant-scoped audit log isolation

| | |
|---|---|
| **Priority** | P2 |
| **Requirement** | FR-140, FR-160 |
| **Preconditions** | Both tenants have audit log entries |
| **Steps** | 1. Tenant A: GET `/api/v1/audit/logs`. 2. Tenant B: GET `/api/v1/audit/logs`. |
| **Expected** | Each tenant sees only their own audit log entries. |

#### TC-T07: Tenant-scoped materialized view data

| | |
|---|---|
| **Priority** | P2 |
| **Requirement** | FR-160 |
| **Preconditions** | Both tenants have products and contracts |
| **Steps** | 1. Refresh materialized views. 2. Query `mv_product_catalog` with Tenant A session. 3. Query with Tenant B session. |
| **Expected** | Views contain data from all tenants (as they are not RLS-filtered), but application-layer queries filter by `tenant_id`. Each tenant sees only their data. |

#### TC-T08: Tenant configuration isolation

| | |
|---|---|
| **Priority** | P2 |
| **Requirement** | FR-161 |
| **Preconditions** | Tenant A with custom settings JSONB, Tenant B with different settings |
| **Steps** | 1. Query tenant settings for A. 2. Query tenant settings for B. 3. Update Tenant A settings. 4. Verify Tenant B settings unchanged. |
| **Expected** | Each tenant has independent configuration. Updating one does not affect the other. |

---

### 3.5 Pricing (التسعير)

#### TC-PR01: Basic price quote

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-060 |
| **Preconditions** | Product with price list: base_price=1000, currency=YER, valid date range covers today |
| **Steps** | 1. POST `/api/v1/pricing/quote` with `{ product_id, channel: "WEB", qty: 1, currency: "YER" }`. |
| **Expected** | 200 OK. `base_price: 1000.00`, `total: 1000.00` (no rules/discounts applied), `currency: "YER"`. |

#### TC-PR02: CEL rule evaluation

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-061 |
| **Preconditions** | Price list with rule: `condition_cel: "qty > 10"`, `formula_cel: "base_price * 0.9"` (10% volume discount) |
| **Steps** | 1. POST quote with `qty: 5`. 2. POST quote with `qty: 15`. |
| **Expected** | Step 1: No discount (condition not met). `total = 5000`. Step 2: 10% discount applied. `base_price: 1000, discount: 150, total: 13500`. `rules_applied: ["VOLUME_DISCOUNT"]`. |

#### TC-PR03: Multi-currency support

| | |
|---|---|
| **Priority** | P1 |
| **Requirement** | FR-060, NFR-03 |
| **Preconditions** | Product with price lists in YER and USD |
| **Steps** | 1. Quote in YER. 2. Quote in USD. 3. Quote in unsupported currency. |
| **Expected** | Step 1: Price in YER from YER price list. Step 2: Price in USD from USD price list. Step 3: 422 — "No active price list for currency: EUR". |

#### TC-PR04: Expired price list handling

| | |
|---|---|
| **Priority** | P2 |
| **Requirement** | FR-060 |
| **Preconditions** | Product with price list expired yesterday (`valid_to < today`) |
| **Steps** | 1. POST pricing quote. |
| **Expected** | 422 — "No active price list for product". |

#### TC-PR05: Price list date validation

| | |
|---|---|
| **Priority** | P2 |
| **Requirement** | FR-060 |
| **Preconditions** | Active tenant |
| **Steps** | 1. POST price list with `valid_to` before `valid_from`. |
| **Expected** | 400 — CHECK constraint: `valid_to > valid_from`. |

#### TC-PR06: Price floor and ceiling (min_price / max_price)

| | |
|---|---|
| **Priority** | P2 |
| **Requirement** | FR-060 |
| **Preconditions** | Price list product with `min_price: 800`, `max_price: 1200` |
| **Steps** | 1. Apply discount rule that brings price below 800. 2. Apply markup rule that brings price above 1200. |
| **Expected** | Step 1: Price clamped to min_price=800. Step 2: Price clamped to max_price=1200. |

#### TC-PR07: Pricing rule priority ordering

| | |
|---|---|
| **Priority** | P2 |
| **Requirement** | FR-061 |
| **Preconditions** | Two rules: priority=0 (10% discount), priority=1 (5% markup). Both conditions true. |
| **Steps** | 1. POST pricing quote. |
| **Expected** | Rules applied in priority order. Lower priority number evaluated first. Both rules appear in `rules_applied` array. |

#### TC-PR08: Tax and discount combination

| | |
|---|---|
| **Priority** | P2 |
| **Requirement** | FR-062 |
| **Preconditions** | Product with base_price=1000, discount rule (10%), tax rule (5% on post-discount price) |
| **Steps** | 1. POST pricing quote for qty=1. |
| **Expected** | `base_price: 1000, discount: 100, tax: 45, total: 945`. Tax applied after discount. |

---

## 4. Test Data Strategy

### 4.1 Factory Patterns

All test data is generated using factory functions with sensible defaults and optional overrides. Factories produce consistent, repeatable data across test runs.

```typescript
// Example factory patterns (pseudocode)
const TenantFactory = {
  create: (overrides = {}) => ({
    code: `TENANT-${uuid()}`,
    name: 'Test Tenant',
    settings: {},
    is_active: true,
    ...overrides
  })
};

const ProductFactory = {
  create: (overrides = {}) => ({
    tenant_id: currentTenantId,
    category_id: defaultCategoryId,
    type: 'PHYSICAL',
    name_ar: 'منتج اختباري',
    name_en: 'Test Product',
    divisible: false,
    status: 'DRAFT',
    payload: {},
    ...overrides
  })
};

const ContractFactory = {
  create: (overrides = {}) => ({
    tenant_id: currentTenantId,
    product_id: financialProductId,
    customer_id: defaultCustomerId,
    status: 'DRAFT',
    currency: 'YER',
    principal: 100000.00,
    interest_type: 'FLAT',
    day_count: '30E/360',
    meta: { annual_rate: 0.12, term_months: 12 },
    ...overrides
  })
};

const CustomerFactory = {
  create: (overrides = {}) => ({
    tenant_id: currentTenantId,
    code: `CUST-${uuid()}`,
    name_ar: 'عميل اختباري',
    name_en: 'Test Customer',
    kyc_level: 'FULL',
    score: 700.00,
    phone: '+967770000000',
    email: 'test@example.com',
    ...overrides
  })
};

const ReservationFactory = {
  create: (overrides = {}) => ({
    tenant_id: currentTenantId,
    product_id: reservationProductId,
    customer_id: defaultCustomerId,
    slot_from: tomorrow9am,
    slot_to: tomorrow12pm,
    status: 'HOLD',
    hold_until: fifteenMinutesFromNow,
    deposit_amount: 0,
    ...overrides
  })
};
```

### 4.2 Seed Data for Development and Testing

A standard seed dataset is maintained for local development and CI environments:

| Entity | Seed Count | Description |
|---|---|---|
| `tenant` | 3 | Tenant A (primary), Tenant B (secondary), Tenant C (inactive) |
| `customer` | 10 per tenant | Mix of KYC levels (NONE, BASIC, FULL) and scores (300-900) |
| `product_category` | 5 per tenant | One per product type, with 2-level hierarchy |
| `product` | 20 per tenant | 4 per type, mix of DRAFT/ACTIVE/SUSPENDED/RETIRED |
| `product_version` | 30 per tenant | Multiple versions per product, some open-ended |
| `attribute_definition` | 15 per tenant | Mix of STRING, NUMBER, DATE, BOOL, ENUM, JSON |
| `price_list` | 3 per tenant | YER, USD, SAR — active and expired |
| `channel` | 6 | WEB, MOBILE, POS, API, USSD, IVR |
| `charge` | 8 per tenant | Processing fee, late penalty, early settlement, etc. |
| `contract` | 10 per tenant | Mix of statuses with installments |
| `reservation` | 10 per tenant | Mix of HOLD, CONFIRMED, EXPIRED, CANCELLED |
| `numbering_scheme` | 3 per tenant | PRODUCT, CONTRACT, RESERVATION patterns |

### 4.3 Data Cleanup Between Tests

| Strategy | When Used |
|---|---|
| **Transaction rollback** | Unit and integration tests wrap each test in a transaction that rolls back |
| **Database truncation** | Before each test suite, TRUNCATE all tables with CASCADE |
| **Schema recreation** | For major schema change testing, drop and recreate from `db/schema.sql` |
| **Isolated test databases** | Each CI parallel worker gets its own database instance |

### 4.4 Anonymized Production Data for Performance Tests

For performance and load testing, production data snapshots are anonymized:

| Field | Anonymization Method |
|---|---|
| `customer.name_ar`, `name_en` | Replaced with fake names (Faker library) |
| `customer.phone` | Replaced with `+9677XXXXXXX` pattern |
| `customer.email` | Replaced with `user-{hash}@test.example.com` |
| `contract.contract_number` | Prefix replaced with `TEST-` |
| Monetary amounts | Kept as-is (no PII) |
| Dates | Shifted by random offset (preserving relative order) |
| `tenant.settings` | Sanitized (remove any secrets/API keys) |

---

## 5. Test Environment

### 5.1 Docker Compose for Local Testing

```yaml
# docker-compose.test.yml (conceptual)
services:
  postgres-test:
    image: postgres:15
    environment:
      POSTGRES_DB: dps_test
      POSTGRES_USER: dps_test
      POSTGRES_PASSWORD: test_secret
    ports:
      - "5433:5432"
    volumes:
      - ./db/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./test/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dps_test"]
      interval: 5s
      timeout: 3s
      retries: 5

  redis-test:
    image: redis:7-alpine
    ports:
      - "6380:6379"

  api-test:
    build:
      context: .
      dockerfile: Dockerfile
      target: test
    environment:
      DATABASE_URL: postgresql://dps_test:test_secret@postgres-test:5432/dps_test
      REDIS_URL: redis://redis-test:6379
      NODE_ENV: test
    depends_on:
      postgres-test:
        condition: service_healthy
```

### 5.2 CI/CD Integration (GitHub Actions)

```yaml
# .github/workflows/test.yml (conceptual)
name: Test Suite
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v4

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: dps_test
          POSTGRES_USER: dps_test
          POSTGRES_PASSWORD: test_secret
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - run: psql -f db/schema.sql $DATABASE_URL
      - run: npm run test:integration

  contract-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run test:contract

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests]
    steps:
      - uses: actions/checkout@v4
      - run: docker compose -f docker-compose.test.yml up -d
      - run: npm run test:e2e
      - run: docker compose -f docker-compose.test.yml down

  security-scan:
    runs-on: ubuntu-latest
    needs: [e2e-tests]
    steps:
      - uses: actions/checkout@v4
      - run: docker compose -f docker-compose.test.yml up -d
      - uses: zaproxy/action-baseline@v0.10.0
        with:
          target: http://localhost:3000

  performance-baseline:
    runs-on: ubuntu-latest
    needs: [e2e-tests]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - run: docker compose -f docker-compose.test.yml up -d
      - run: npm run test:performance:baseline
```

### 5.3 Test Database Isolation

| Concern | Solution |
|---|---|
| **Parallel test workers** | Each worker uses a separate PostgreSQL schema or database |
| **Schema consistency** | All test databases initialized from `db/schema.sql` |
| **RLS testing** | Tests create dedicated PostgreSQL roles per tenant with `SET app.current_tenant` |
| **Connection pooling** | Test environment uses smaller pool sizes (5 connections per worker) |
| **Migration testing** | Dedicated CI job applies migrations to a populated database and verifies data integrity |

---

## 6. Test Automation

### 6.1 Tooling

| Category | Tool | Purpose |
|---|---|---|
| **Unit Tests** | Jest or Vitest | Business logic, utility functions, validation |
| **Coverage** | Istanbul (c8) | Line, branch, function coverage reporting |
| **Integration Tests** | Jest/Vitest + Testcontainers | API + real PostgreSQL database |
| **Database Tests** | pgTAP | Stored procedures, triggers, RLS policies directly in PostgreSQL |
| **Contract Tests** | Pact / Prism | Consumer-driven contracts, OpenAPI validation |
| **E2E Tests** | Playwright (API mode) or Supertest | Full user journey automation |
| **Performance Tests** | k6 | Load testing, stress testing, benchmarking |
| **Security Tests** | OWASP ZAP | Automated vulnerability scanning |
| **Static Analysis** | ESLint + SonarQube | Code quality, security patterns |
| **Mutation Testing** | Stryker (optional) | Test effectiveness measurement |

### 6.2 CI Pipeline Integration

```
Push / PR
  |
  ├── [Parallel] Lint + Static Analysis  (~1 min)
  ├── [Parallel] Unit Tests + Coverage   (~2 min)
  ├── [Parallel] Contract Tests          (~1 min)
  |
  ├── [Sequential] Integration Tests     (~5 min)
  |     (requires PostgreSQL service)
  |
  ├── [Sequential] E2E Tests             (~10 min)
  |     (requires full Docker Compose stack)
  |
  ├── [Gate] Quality Gate Check
  |     - Coverage >= 80%?
  |     - All tests pass?
  |     - No critical static analysis issues?
  |
  ├── [On main only] Security Scan       (~15 min)
  |     (OWASP ZAP baseline)
  |
  └── [On main only] Performance Baseline (~10 min)
        (k6 smoke test)
```

### 6.3 Test Reporting

| Report | Format | Destination |
|---|---|---|
| **Unit test results** | JUnit XML | GitHub Actions summary |
| **Coverage report** | HTML + lcov | Codecov dashboard |
| **Integration test results** | JUnit XML | GitHub Actions summary |
| **E2E test results** | HTML report + screenshots | GitHub Actions artifacts |
| **Performance report** | k6 JSON + Grafana | Performance dashboard |
| **Security report** | OWASP ZAP HTML | GitHub Actions artifacts |
| **Trend tracking** | Time-series metrics | Grafana dashboard |

### 6.4 Test Naming Convention

```
<Module>.<Feature>.<Scenario>

Examples:
  Contract.InstallmentGeneration.FlatInterestRoundingCorrection
  Reservation.HoldExpiry.AutoExpiresPastTTL
  Product.VersionOverlap.RejectsOverlappingDates
  MultiTenancy.RLS.PreventsReadAcrossTenants
  Pricing.CELRules.AppliesVolumeDiscount
```

---

## 7. Traceability Matrix

The following matrix maps every test case to its originating functional requirement (FR), business rule (BR), non-functional requirement (NFR), and priority.

### 7.1 Product Management

| Test Case | FR | BR | NFR | Priority | Category |
|---|---|---|---|---|---|
| TC-P01 | FR-010 | — | — | P1 | Integration |
| TC-P02 | FR-011 | BR-01 | — | P1 | Integration |
| TC-P03 | FR-013 | BR-07 | — | P1 | Integration |
| TC-P04 | FR-001 | BR-09 | — | P1 | Integration |
| TC-P05 | FR-020, FR-021 | — | — | P1 | Integration |
| TC-P06 | FR-010 | — | — | P2 | Unit |
| TC-P07 | FR-010 | — | — | P1 | Integration |
| TC-P08 | — | — | NFR-03 | P2 | Integration |
| TC-P09 | FR-011 | BR-01 | — | P2 | Integration |
| TC-P10 | FR-010 | — | — | P3 | Unit |
| TC-P11 | FR-010 | — | — | P2 | Unit |
| TC-P12 | FR-010 | — | NFR-01 | P2 | Integration |
| TC-P13 | FR-012, FR-060 | BR-02 | — | P1 | Integration |
| TC-P14 | FR-031 | — | — | P2 | Integration |
| TC-P15 | FR-004, FR-150 | — | — | P2 | Integration |

### 7.2 Financial Contracts

| Test Case | FR | BR | NFR | Priority | Category |
|---|---|---|---|---|---|
| TC-C01 | FR-130, FR-131 | — | — | P1 | Integration |
| TC-C02 | FR-130, FR-131 | — | — | P1 | Integration |
| TC-C03 | FR-111, FR-131 | — | — | P1 | Unit + Integration |
| TC-C04 | FR-130, FR-131 | — | — | P1 | Integration |
| TC-C05 | FR-152 | BR-11 | — | P1 | Integration |
| TC-C06 | FR-100, FR-132 | BR-05 | — | P1 | Integration |
| TC-C07 | FR-134 | BR-08 | — | P1 | Integration |
| TC-C08 | FR-133 | — | — | P1 | Integration |
| TC-C09 | FR-130, FR-132 | — | — | P1 | Integration |
| TC-C10 | FR-132, FR-134 | BR-08 | — | P1 | Integration |
| TC-C11 | FR-091, FR-111 | BR-03 | — | P1 | Integration |
| TC-C12 | FR-072, FR-130 | BR-04 | — | P1 | Integration |
| TC-C13 | FR-082 | — | — | P1 | Integration |
| TC-C14 | FR-111 | — | — | P2 | Integration |
| TC-C15 | FR-130 | — | — | P2 | Integration |
| TC-C16 | FR-130 | — | — | P1 | Integration |
| TC-C17 | FR-131 | — | — | P2 | Unit + Integration |
| TC-C18 | FR-131 | — | — | P2 | Unit |
| TC-C19 | FR-132 | — | — | P2 | Integration |
| TC-C20 | FR-130 | — | NFR-03 | P2 | Integration |

### 7.3 Reservations

| Test Case | FR | BR | NFR | Priority | Category |
|---|---|---|---|---|---|
| TC-R01 | FR-120 | — | — | P1 | Integration |
| TC-R02 | FR-041, FR-120 | — | — | P1 | Integration |
| TC-R03 | FR-041 | BR-10 | — | P1 | Integration |
| TC-R04 | FR-120 | — | — | P1 | Integration |
| TC-R05 | FR-120 | BR-15 | — | P1 | Integration |
| TC-R06 | FR-120, FR-040 | — | — | P2 | Integration |
| TC-R07 | FR-120 | — | — | P2 | Unit |
| TC-R08 | FR-120 | BR-10 | — | P2 | Integration |
| TC-R09 | FR-120 | — | — | P2 | Integration |
| TC-R10 | FR-120 | — | — | P3 | Integration |

### 7.4 Multi-Tenancy

| Test Case | FR | BR | NFR | Priority | Category |
|---|---|---|---|---|---|
| TC-T01 | FR-160 | BR-12 | NFR-05 | P1 | Integration |
| TC-T02 | FR-160 | BR-12 | NFR-05 | P1 | Integration |
| TC-T03 | FR-160 | — | — | P1 | Contract |
| TC-T04 | FR-070, FR-160 | BR-12 | — | P1 | Integration |
| TC-T05 | FR-160 | BR-12 | NFR-05 | P1 | Integration |
| TC-T06 | FR-140, FR-160 | BR-12 | — | P2 | Integration |
| TC-T07 | FR-160 | — | NFR-02 | P2 | Integration |
| TC-T08 | FR-161 | — | — | P2 | Integration |

### 7.5 Pricing

| Test Case | FR | BR | NFR | Priority | Category |
|---|---|---|---|---|---|
| TC-PR01 | FR-060 | — | — | P1 | Integration |
| TC-PR02 | FR-061 | — | — | P1 | Integration |
| TC-PR03 | FR-060 | — | NFR-03 | P1 | Integration |
| TC-PR04 | FR-060 | — | — | P2 | Integration |
| TC-PR05 | FR-060 | — | — | P2 | Integration |
| TC-PR06 | FR-060 | — | — | P2 | Unit + Integration |
| TC-PR07 | FR-061 | — | — | P2 | Integration |
| TC-PR08 | FR-062 | — | — | P2 | Unit |

### 7.6 End-to-End Scenarios

| Test Case | FR | BR | NFR | Priority | Category |
|---|---|---|---|---|---|
| E2E-01 | FR-010..013, FR-060, FR-082, FR-090, FR-100, FR-130..134 | BR-03..08, BR-11 | — | P1 | E2E |
| E2E-02 | FR-040, FR-041, FR-120 | BR-10, BR-15 | — | P1 | E2E |
| E2E-03 | FR-010..013, FR-140 | BR-07, BR-13 | — | P1 | E2E |
| E2E-04 | FR-160 | BR-12 | NFR-05 | P1 | E2E |
| E2E-05 | FR-130, FR-132, FR-134 | BR-08 | — | P1 | E2E |

### 7.7 Performance

| Test Case | FR | BR | NFR | Priority | Category |
|---|---|---|---|---|---|
| PERF-01: Read throughput | — | — | NFR-01 (1000 TPS) | P1 | Performance |
| PERF-02: Write throughput | — | — | NFR-01 (200 TPS) | P1 | Performance |
| PERF-03: Concurrent users | — | — | NFR-01 (500 users) | P1 | Performance |
| PERF-04: Pricing latency | FR-060 | — | NFR-01 (<=200ms 95p) | P1 | Performance |
| PERF-05: Numbering latency | FR-072 | — | NFR-01 (<=400ms 95p) | P1 | Performance |
| PERF-06: MV refresh | — | — | NFR-02 | P2 | Performance |
| PERF-07: Installment generation | FR-111 | — | NFR-01 | P2 | Performance |

### 7.8 Security

| Test Case | FR | BR | NFR | Priority | Category |
|---|---|---|---|---|---|
| SEC-01..04 | — | — | NFR-05 (OWASP) | P1 | Security |
| SEC-05..09 | FR-160 | BR-12 | NFR-05 | P1 | Security |
| SEC-10..14 | — | — | NFR-05 (Auth) | P1 | Security |
| SEC-15..18 | — | — | NFR-05 (Rate limit) | P2 | Security |
| SEC-19..22 | FR-140 | — | NFR-05 (Data protection) | P2 | Security |

### 7.9 Business Rule Coverage Summary

| Business Rule | Test Cases | Covered |
|---|---|---|
| BR-01: No overlapping versions | TC-P02, TC-P09 | Yes |
| BR-02: No channel without pricing | TC-P13 | Yes |
| BR-03: No installments without documents | TC-C11 | Yes |
| BR-04: No disbursement without number | TC-C12 | Yes |
| BR-05: Late penalty after grace | TC-C06 | Yes |
| BR-07: Maker-Checker activation | TC-P03, E2E-03 | Yes |
| BR-08: Aging escalation | TC-C07, TC-C10, E2E-05 | Yes |
| BR-09: No delete category with active products | TC-P04 | Yes |
| BR-10: Hold auto-expire after TTL | TC-R03, TC-R08 | Yes |
| BR-11: Idempotent payments | TC-C05 | Yes |
| BR-12: Tenant data isolation | TC-T01..T08, E2E-04, SEC-05..09 | Yes |
| BR-13: Audit on state change | E2E-03 | Yes |
| BR-14: KYC level check for contracts | TC-C11 (implicit via eligibility) | Yes |
| BR-15: Cancellation penalty policy | TC-R05 | Yes |

---

## Appendix A: Test Case Summary by Priority

| Priority | Count | Description |
|---|---|---|
| **P1 (Critical)** | 42 | Core business logic, financial accuracy, security, data isolation |
| **P2 (Important)** | 25 | Edge cases, validation, multi-currency, configuration |
| **P3 (Nice-to-have)** | 4 | UI-related, cosmetic, minor features |

## Appendix B: Test Execution Schedule

| Phase | Test Types | Trigger |
|---|---|---|
| **Per commit** | Unit, lint, static analysis | Every push |
| **Per PR** | Unit, integration, contract | Every pull request |
| **Pre-release** | All above + E2E, security scan | Merge to main |
| **Weekly** | Full OWASP ZAP scan, performance regression | Scheduled |
| **Monthly** | Load test at peak capacity, DR recovery test | Scheduled |
| **Per milestone** | Full regression suite, penetration test | Release gate |

## Appendix C: Defect Severity Classification

| Severity | Definition | SLA |
|---|---|---|
| **S1 — Critical** | System down, data loss, security breach, financial calculation error | Fix within 4 hours |
| **S2 — High** | Feature broken, workaround exists, cross-tenant data leak potential | Fix within 24 hours |
| **S3 — Medium** | Non-critical feature issue, UI/UX degradation | Fix within 1 sprint |
| **S4 — Low** | Cosmetic, documentation, minor inconvenience | Backlog |
