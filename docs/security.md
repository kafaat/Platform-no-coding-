# Security & Compliance Document — Dynamic Product System

**Document Version**: 1.0
**Last Updated**: 2026-02-09
**Classification**: CONFIDENTIAL — تصنيف: سري
**Status**: Active

---

## Table of Contents

1. [Overview](#1-overview)
2. [Authentication & Authorization](#2-authentication--authorization)
3. [Data Protection](#3-data-protection)
4. [Multi-tenancy Security](#4-multi-tenancy-security)
5. [API Security](#5-api-security)
6. [OWASP Top 10 Compliance](#6-owasp-top-10-compliance)
7. [Audit & Monitoring](#7-audit--monitoring)
8. [Financial Compliance](#8-financial-compliance)
9. [Security Checklist](#9-security-checklist)

---

## 1. Overview

### 1.1 Purpose — الغرض

This document defines the security architecture, controls, and compliance posture for the **Dynamic Product System** (نظام المنتجات الديناميكي) — a multi-tenant, no-code SaaS platform managing financial contracts, product catalogs, reservations, and sensitive customer data.

The platform handles:

- **Financial instruments** (loans, credit lines, installment schedules) governed by IFRS 9
- **Personally Identifiable Information (PII)** including customer names, phone numbers, emails, KYC documents
- **Payment transactions** with sub-ledger accounting entries
- **Multi-tenant data** requiring strict isolation between organizations

### 1.2 Security-First Approach — نهج الأمان أولاً

Security is not a bolt-on feature but a foundational design principle. Every architectural decision — from database schema design (Row Level Security) to API gateway configuration (mandatory tenant headers) — incorporates security by default.

**Core Principles:**

| Principle | Description |
|---|---|
| Defense in Depth | Multiple layers of controls (network, application, database, encryption) |
| Least Privilege | Users and services receive only the minimum permissions necessary |
| Zero Trust | Every request is authenticated and authorized, regardless of origin |
| Secure by Default | All new features ship with restrictive defaults; access is explicitly granted |
| Fail Secure | System failures result in denial of access, not open access |

### 1.3 Compliance Targets — أهداف الامتثال

| Standard | Scope | Status |
|---|---|---|
| **OWASP Top 10 (2021)** | Application security — all 10 categories addressed | Mandatory |
| **IFRS 9** | Financial instrument classification, measurement, impairment | Mandatory |
| **ISO 27001** | Information security management system (aligned, not certified) | Aligned |
| **ISO 20022** | Financial messaging structure | Adopted |
| **PCI DSS** | Payment card data (when applicable) | Scoped |
| **GDPR** | Data protection and privacy (right to erasure, data portability) | Aligned |
| **OpenTelemetry** | Observability and security monitoring | Adopted |

### 1.4 Scope

This document applies to all components of the Dynamic Product System:

- Product Kernel, Attributes Engine, Pricing Service
- Numbering Service, Accounting Mapper
- Contracts Service, Reservations Service
- Event Bus (Kafka/RabbitMQ)
- API Gateway, Authentication Service
- PostgreSQL database layer
- Redis cache layer
- Administrative dashboards

---

## 2. Authentication & Authorization

### 2.1 Authentication — المصادقة

#### 2.1.1 Protocol

The system uses **OAuth 2.0 / OpenID Connect (OIDC)** for authentication, supporting the following grant types:

| Grant Type | Use Case |
|---|---|
| Authorization Code + PKCE | Web and mobile user login |
| Client Credentials | Machine-to-machine (API_CLIENT) |
| Refresh Token | Silent token renewal |
| Device Code | IoT/POS terminal authentication |

#### 2.1.2 JWT Token Structure

All authenticated requests carry a signed JWT (RS256 or ES256) with the following claims:

```json
{
  "iss": "https://auth.platform.example.com",
  "sub": "user-uuid-123",
  "aud": "dynamic-product-api",
  "tenant_id": 42,
  "roles": ["FINANCE_OFFICER"],
  "permissions": [
    "contract:create",
    "contract:read",
    "payment:create",
    "installment:read",
    "subledger:read"
  ],
  "branch_code": "SANA",
  "locale": "ar",
  "iat": 1738000000,
  "exp": 1738003600,
  "jti": "unique-token-id-789"
}
```

| Claim | Type | Description |
|---|---|---|
| `iss` | string | Token issuer URL |
| `sub` | string | User unique identifier (UUID) |
| `aud` | string | Intended audience (API identifier) |
| `tenant_id` | integer | Tenant isolation identifier (المستأجر) |
| `roles` | string[] | Assigned RBAC roles |
| `permissions` | string[] | Fine-grained permissions |
| `branch_code` | string | Branch restriction for ABAC (optional) |
| `locale` | string | User preferred language (`ar` / `en`) |
| `iat` | integer | Issued at (Unix timestamp) |
| `exp` | integer | Expiration (Unix timestamp) |
| `jti` | string | Unique token ID (for revocation) |

#### 2.1.3 Token Lifecycle

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Login      │────>│  Auth Server │────>│  Access      │
│   (OIDC)     │     │  (IdP)       │     │  Token (1h)  │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                │
                           Token expires         │
                                                ▼
                    ┌──────────────┐     ┌─────────────┐
                    │  Auth Server │<────│  Refresh     │
                    │  (validate)  │     │  Token (24h) │
                    └──────┬───────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  New Access  │
                    │  Token (1h)  │
                    └─────────────┘
```

| Token | TTL | Storage | Rotation |
|---|---|---|---|
| Access Token | 1 hour | Memory only (never localStorage) | On expiry via refresh |
| Refresh Token | 24 hours | Secure HttpOnly cookie | Rotated on each use (one-time use) |
| ID Token | 1 hour | Memory only | Alongside access token |

**Token Revocation:**
- Immediate revocation via token blacklist (Redis, keyed by `jti`)
- Refresh token rotation: old refresh tokens are invalidated on use
- On password change or account suspension: all tokens for the user are revoked
- Blacklist TTL matches the maximum token expiration to prevent unbounded growth

#### 2.1.4 Multi-Factor Authentication (MFA) — المصادقة متعددة العوامل

MFA is **required** for the following operations:

| Operation | MFA Required | Reason |
|---|---|---|
| Financial contract creation | Yes | High-value financial operation |
| Payment recording above threshold | Yes | Configurable per-tenant (default: 100,000 YER) |
| Contract write-off | Yes | Irreversible financial action |
| Product activation (Maker-Checker) | Yes | Approval step for production changes |
| User role assignment | Yes | Privilege escalation prevention |
| Tenant configuration changes | Yes | System-wide impact |
| Bulk operations (batch payments) | Yes | High-risk batch processing |

**Supported MFA Methods:**

| Method | Priority | Notes |
|---|---|---|
| TOTP (Authenticator App) | Primary | Google Authenticator, Authy |
| SMS OTP | Secondary | Critical for Yemen market (fallback) |
| Hardware Key (FIDO2/WebAuthn) | Preferred | For SUPER_ADMIN and FINANCE_OFFICER |
| Email OTP | Tertiary | Lowest priority, for recovery only |

---

### 2.2 Authorization — التفويض

The system implements a hybrid **RBAC + ABAC** model: Role-Based Access Control defines what a user *can* do; Attribute-Based Access Control constrains *where* and *when* they can do it.

#### 2.2.1 Role Definitions — تعريفات الأدوار

| Role | Code | Description (EN) | الوصف (AR) | Scope |
|---|---|---|---|---|
| Super Admin | `SUPER_ADMIN` | Full system access across all tenants | مسؤول النظام الكامل | Global |
| Tenant Admin | `TENANT_ADMIN` | Full access within a single tenant | مسؤول المستأجر | Tenant |
| Product Manager | `PRODUCT_MANAGER` | Product CRUD, pricing, channels, attributes | مدير المنتجات | Tenant |
| Finance Officer | `FINANCE_OFFICER` | Contracts, payments, sub-ledger, write-offs | المسؤول المالي | Tenant |
| Risk Officer | `RISK_OFFICER` | Eligibility rules, collateral, credit assessment | مسؤول المخاطر | Tenant |
| Customer Service | `CUSTOMER_SERVICE` | Read-only contracts, basic customer operations | خدمة العملاء | Tenant |
| Auditor | `AUDITOR` | Read-only audit logs, reports, domain events | المدقق | Tenant |
| API Client | `API_CLIENT` | Machine-to-machine integration (scoped) | عميل الواجهة البرمجية | Tenant |

#### 2.2.2 Permission Matrix — مصفوفة الصلاحيات

**Legend:** C = Create | R = Read | U = Update | D = Delete/Disable | A = Approve | X = Execute

| Resource | SUPER_ADMIN | TENANT_ADMIN | PRODUCT_MANAGER | FINANCE_OFFICER | RISK_OFFICER | CUSTOMER_SERVICE | AUDITOR | API_CLIENT |
|---|---|---|---|---|---|---|---|---|
| **Tenant Config** | CRUD | RU | - | - | - | - | R | - |
| **Product** | CRUD | CRUD | CRUD | R | R | R | R | R |
| **Product Version** | CRUD | CRUD | CRUD | R | R | R | R | R |
| **Product Activation** | A | A | - | - | - | - | - | - |
| **Category** | CRUD | CRUD | CRUD | R | R | R | R | R |
| **Attribute Def** | CRUD | CRUD | CRUD | R | R | R | R | R |
| **Attribute Value** | CRUD | CRUD | CRUD | R | R | R | R | R |
| **Price List** | CRUD | CRUD | CRUD | R | R | R | R | R |
| **Price Rule** | CRUD | CRUD | CRUD | R | R | - | R | R |
| **Pricing Quote** | X | X | X | X | X | X | - | X |
| **Channel Config** | CRUD | CRUD | CRUD | R | R | R | R | R |
| **Charge** | CRUD | CRUD | CRU | R | R | R | R | R |
| **Numbering Scheme** | CRUD | CRUD | CRU | R | R | - | R | - |
| **Number Reserve** | X | X | X | X | - | - | - | X |
| **Accounting Template** | CRUD | CRUD | R | CRU | - | - | R | - |
| **Contract** | CRUD | CRUD | R | CRUD | R | R | R | CR |
| **Contract Activation** | A | A | - | A | A | - | - | - |
| **Installment** | CRUD | CRUD | - | CRUD | R | R | R | R |
| **Payment** | CRD | CRD | - | CR | - | R | R | C |
| **Write-off** | X | - | - | X | X | - | - | - |
| **Eligibility Rule** | CRUD | CRUD | R | R | CRUD | R | R | R |
| **Collateral Req** | CRUD | CRUD | R | R | CRUD | R | R | - |
| **Document Req** | CRUD | CRUD | R | R | CRUD | R | R | - |
| **Customer** | CRUD | CRUD | R | R | R | RU | R | R |
| **Reservation** | CRUD | CRUD | R | R | - | CRU | R | CR |
| **Cancellation Policy** | CRUD | CRUD | CRU | R | - | R | R | R |
| **Audit Log** | R | R | - | R | R | - | R | - |
| **Domain Event** | R | R | - | R | - | - | R | - |
| **State Transition** | R | R | R | R | R | R | R | - |
| **User Management** | CRUD | CRU | - | - | - | - | - | - |

#### 2.2.3 ABAC Rules — قواعد التحكم القائمة على السمات

ABAC policies are evaluated **after** RBAC permission checks pass, adding contextual constraints:

**Rule 1: Tenant Isolation (BR-12)**
```
// Every request is scoped to the authenticated user's tenant
DENY IF request.tenant_id != token.tenant_id
EXCEPT WHEN token.role == "SUPER_ADMIN"
```

**Rule 2: Branch Restriction**
```
// Finance officers may be restricted to their branch
DENY IF resource.branch_code != token.branch_code
WHEN token.role IN ("FINANCE_OFFICER", "CUSTOMER_SERVICE")
  AND token.branch_code IS NOT NULL
```

**Rule 3: Approval Amount Limits**
```
// Tiered approval limits for contract creation
ALLOW IF contract.principal <= 500,000 YER
  AND token.role == "FINANCE_OFFICER"

REQUIRE_APPROVAL IF contract.principal > 500,000 YER
  AND contract.principal <= 5,000,000 YER
  AND approver.role IN ("TENANT_ADMIN", "RISK_OFFICER")

REQUIRE_DUAL_APPROVAL IF contract.principal > 5,000,000 YER
  AND approver_1.role == "RISK_OFFICER"
  AND approver_2.role == "TENANT_ADMIN"
```

**Rule 4: Time-Based Restrictions**
```
// Restrict high-value operations to business hours
DENY IF operation IN ("WRITE_OFF", "BULK_PAYMENT", "CONTRACT_RESTRUCTURE")
  AND current_time NOT BETWEEN "08:00" AND "17:00" (tenant timezone)
  UNLESS token.role == "SUPER_ADMIN"
```

**Rule 5: Maker-Checker Enforcement (BR-07)**
```
// The user who created a resource cannot approve it
DENY IF approval.approver_id == resource.created_by
WHEN operation == "APPROVE"
  AND resource_type IN ("product", "contract")
```

**Rule 6: IP Allowlisting**
```
// API_CLIENT tokens are bound to registered IP ranges
DENY IF token.role == "API_CLIENT"
  AND request.source_ip NOT IN tenant.allowed_ip_ranges
```

---

## 3. Data Protection

### 3.1 Encryption — التشفير

#### 3.1.1 At Rest

| Layer | Method | Key Size | Scope |
|---|---|---|---|
| **Database (full disk)** | AES-256 (PostgreSQL TDE or LUKS) | 256-bit | All data files, WAL, temp files |
| **PII columns** | Application-level AES-256-GCM | 256-bit | `customer.phone`, `customer.email`, `customer.name_ar`, `customer.name_en` |
| **KYC documents** | AES-256-GCM | 256-bit | Object storage (S3-compatible) |
| **Backups** | AES-256 | 256-bit | All database and file backups |
| **Redis cache** | TLS + encrypted data | 256-bit | Session data, pricing cache |

**Application-Level Encryption Pattern:**

```
┌────────────┐     ┌─────────────┐     ┌──────────────┐
│ Plaintext  │────>│ Encrypt     │────>│ Ciphertext   │
│ PII Field  │     │ (AES-256-   │     │ + IV + Tag   │
│            │     │  GCM)       │     │ stored in DB │
└────────────┘     └──────┬──────┘     └──────────────┘
                          │
                   ┌──────▼──────┐
                   │ Key from    │
                   │ Vault/KMS   │
                   └─────────────┘
```

#### 3.1.2 In Transit

| Path | Protocol | Minimum Version |
|---|---|---|
| Client to API Gateway | TLS | 1.3 |
| API Gateway to Services | mTLS | 1.3 |
| Service to PostgreSQL | TLS | 1.2 (1.3 preferred) |
| Service to Redis | TLS | 1.2 |
| Service to Kafka | TLS + SASL | 1.2 |
| Inter-service (Kubernetes) | mTLS (Istio/Linkerd) | 1.3 |

**TLS Configuration:**

- Cipher suites: `TLS_AES_256_GCM_SHA384`, `TLS_CHACHA20_POLY1305_SHA256`
- Key exchange: ECDHE (P-256 or X25519)
- Certificate rotation: Automated via cert-manager (90-day certificates)
- HSTS enabled with `max-age=31536000; includeSubDomains; preload`

#### 3.1.3 Key Management — إدارة المفاتيح

| Component | Solution | Key Rotation |
|---|---|---|
| **Primary KMS** | HashiCorp Vault (production) or AWS KMS | Automatic, 90 days |
| **Database encryption key (DEK)** | Envelope encryption via KMS | 90 days |
| **PII field keys** | Per-tenant DEKs wrapped by KMS master key | 90 days |
| **JWT signing keys** | RS256/ES256 key pairs in Vault | 180 days (with overlap period) |
| **API client secrets** | Vault dynamic secrets | On-demand, max 365 days |

**Envelope Encryption:**

```
Master Key (KMS)
  └── Tenant Key (per tenant)
        ├── PII Encryption Key (per tenant)
        ├── Document Encryption Key (per tenant)
        └── Backup Encryption Key (per tenant)
```

### 3.2 PII Handling — معالجة البيانات الشخصية

#### 3.2.1 PII Classification

| Field | Table | Classification | Encryption | Masking |
|---|---|---|---|---|
| `phone` | `customer` | PII — Sensitive | AES-256-GCM | Show last 4: `*******4567` |
| `email` | `customer` | PII — Sensitive | AES-256-GCM | Partial: `a***@example.com` |
| `name_ar` | `customer` | PII — Personal | AES-256-GCM | Full mask in logs: `[REDACTED]` |
| `name_en` | `customer` | PII — Personal | AES-256-GCM | Full mask in logs: `[REDACTED]` |
| `kyc_level` | `customer` | PII — Metadata | None (enum) | None |
| `score` | `customer` | PII — Financial | None (numeric) | Masked in non-privileged responses |
| KYC Documents | Object Storage | PII — Highly Sensitive | AES-256-GCM | Not exposed via API |
| `contract_number` | `contract` | Business — Sensitive | None | Full in authorized context |
| `principal` | `contract` | Financial — Sensitive | None | Visible to authorized roles only |

#### 3.2.2 Masking Rules

**API Response Masking:**

Responses are masked based on the requesting role. The Contracts Service and Customer Service apply field-level masking before serialization:

```json
// CUSTOMER_SERVICE role sees masked customer data:
{
  "id": 200,
  "code": "CUST-001",
  "name_ar": "[مقنّع]",
  "name_en": "[MASKED]",
  "phone": "*******4567",
  "email": "a***@example.com",
  "kyc_level": "BASIC"
}

// FINANCE_OFFICER role sees full data:
{
  "id": 200,
  "code": "CUST-001",
  "name_ar": "أحمد محمد",
  "name_en": "Ahmed Mohammed",
  "phone": "+967771234567",
  "email": "ahmed@example.com",
  "kyc_level": "BASIC"
}
```

**Log Masking:**

All structured logs (JSON format) pass through a sanitization layer that:

- Replaces PII fields with `[REDACTED]`
- Truncates tokens to first 8 characters: `eyJhbGci...` becomes `eyJhbGci[TRUNCATED]`
- Removes request/response bodies from logs for endpoints tagged as `sensitive`
- Retains correlation IDs (`X-Request-ID`, `X-Correlation-ID`) for traceability

#### 3.2.3 Right to Erasure (GDPR-Aligned) — حق المحو

When a customer exercises their right to erasure:

1. **Eligibility Check**: Verify no active contracts or legal retention obligations
2. **Financial Data Retention**: Financial records (contracts, payments, sub-ledger entries) are retained for 7 years per regulatory requirements but PII is pseudonymized
3. **Pseudonymization Process**:
   - Replace `name_ar`, `name_en` with `[DELETED_CUSTOMER_{hash}]`
   - Replace `phone`, `email` with cryptographic hash (one-way)
   - Delete KYC documents from object storage
   - Retain transactional records with pseudonymized references
4. **Audit Trail**: The erasure event itself is logged in `audit_log` (without PII)
5. **Cache Invalidation**: Purge all Redis entries containing the customer's data
6. **Propagation**: Emit `CustomerErased` domain event for downstream services

#### 3.2.4 Data Retention Policy — سياسة الاحتفاظ بالبيانات

| Data Category | Retention Period | Action After Expiry |
|---|---|---|
| Financial transactions (contracts, payments, sub-ledger) | 7 years | Archive to cold storage, then delete |
| Audit logs | 3 years (active) + 4 years (archive) | Purge from active, retain in archive |
| Domain events | 7 years | Archive with financial data |
| Customer PII (no active relationship) | 2 years after last activity | Pseudonymize or delete on request |
| Session data (Redis) | 24 hours | Auto-expire (TTL) |
| Idempotency keys | 72 hours | Auto-expire (TTL) |
| Temporary reservation holds | Configurable TTL (default: 15 min) | Auto-expire (BR-10) |
| Pricing snapshots | 7 years (linked to transactions) | Archive with financial data |

### 3.3 Sensitive Data Handling — معالجة البيانات الحساسة

#### 3.3.1 Never Log — لا تُسجَّل أبداً

The following data types must **never** appear in application logs, error messages, debug output, or monitoring dashboards:

| Data Type | Examples |
|---|---|
| Passwords | User passwords, service account credentials |
| Authentication tokens | JWT access tokens, refresh tokens, API keys (full) |
| Encryption keys | DEKs, KEKs, HMAC secrets |
| Full card numbers | PAN, CVV, expiry dates |
| Full PII | Unmasked phone numbers, email addresses, names |
| Database credentials | Connection strings with passwords |
| KYC document content | National ID numbers, passport scans |

#### 3.3.2 Always Mask in API Responses

| Field | Masking Rule | Example |
|---|---|---|
| `phone` | Show last 4 digits | `+967*******4567` |
| `email` | First char + `***` + domain | `a***@example.com` |
| `name_ar` / `name_en` | Role-dependent (masked for CUSTOMER_SERVICE, AUDITOR) | `[مقنّع]` / `[MASKED]` |
| `score` | Hidden from CUSTOMER_SERVICE | `***` |
| `contract_number` | Full for authorized roles, partial for others | `FIN-LOAN-****-001234` |
| API keys | Show first 8, last 4 | `dps_live_ab...xyz9` |

---

## 4. Multi-tenancy Security

### 4.1 Row Level Security (RLS) — أمان مستوى الصف

#### 4.1.1 Implementation

PostgreSQL Row Level Security (RLS) is the **primary enforcement mechanism** for tenant data isolation (BR-12). RLS is enabled on all 20+ tenant-scoped tables in the schema.

**RLS-Enabled Tables:**

```
customer, product_category, product, attribute_definition,
attribute_set, price_list, charge, accounting_template,
eligibility_rule, document_requirement, collateral_requirement,
schedule_template, contract, reservation, cancellation_policy,
numbering_scheme, audit_log, state_transition, domain_event,
pricing_snapshot, attribute_snapshot
```

**Policy Definition (applied to every tenant-scoped table):**

```sql
-- Example: contract table
ALTER TABLE contract ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON contract
  USING (tenant_id = current_setting('app.current_tenant')::BIGINT);
```

#### 4.1.2 Session Variable Flow

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌────────────┐
│  Client  │────>│  API Gateway │────>│  App Service │────>│ PostgreSQL │
│          │     │  validates   │     │  sets session│     │  RLS       │
│          │     │  X-Tenant-ID │     │  variable    │     │  enforces  │
└──────────┘     └──────────────┘     └──────────────┘     └────────────┘
                       │                     │
                       │ Validate:           │ SET app.current_tenant = '42';
                       │ X-Tenant-ID == 42   │
                       │ token.tenant_id ==42│
                       ▼                     ▼
                 REJECT if mismatch   All queries automatically
                                      filtered to tenant_id = 42
```

**Critical Implementation Rules:**

1. The `app.current_tenant` session variable is set **at the beginning of every database transaction**
2. The value is derived from the validated JWT `tenant_id` claim — never from client-supplied headers alone
3. The API gateway performs a **cross-check**: `X-Tenant-ID` header must match `token.tenant_id`
4. If the header and token disagree, the request is rejected with `403 FORBIDDEN`
5. `SUPER_ADMIN` users may operate across tenants by explicitly setting the target tenant (logged and audited)

#### 4.1.3 RLS Testing Strategy

| Test Type | Description | Frequency |
|---|---|---|
| **Unit Tests** | For each RLS-enabled table, verify that queries with `tenant_id=A` never return rows with `tenant_id=B` | Every CI build |
| **Cross-Tenant Injection** | Attempt to insert/update rows with a different `tenant_id` than the session variable | Every CI build |
| **Missing Session Variable** | Verify that queries fail (not return all data) when `app.current_tenant` is not set | Every CI build |
| **SUPER_ADMIN Bypass** | Verify that SUPER_ADMIN can access cross-tenant data only when explicitly authorized | Weekly |
| **Performance** | Ensure RLS policies do not degrade query performance beyond 5% overhead | Monthly |
| **Penetration Test** | External testers attempt tenant boundary violations | Quarterly |

### 4.2 Tenant Isolation — عزل المستأجرين

#### 4.2.1 Data Isolation

| Layer | Mechanism | Enforcement |
|---|---|---|
| **Database rows** | RLS policies on all tenant-scoped tables | PostgreSQL (automatic) |
| **Database connections** | Connection pool per tenant (optional, for premium tiers) | Application |
| **Cache (Redis)** | Key prefix: `tenant:{tenant_id}:` for all cached data | Application |
| **Message queue** | Topic partitioning by `tenant_id` or separate virtual hosts | Kafka/RabbitMQ |
| **File storage** | Separate bucket prefixes: `/{tenant_id}/documents/` | Object storage policy |

#### 4.2.2 Configuration Isolation

Each tenant has independent configuration stored in `tenant.settings` (JSONB):

```json
{
  "branding": { "logo_url": "...", "primary_color": "#1a5276" },
  "limits": {
    "max_products": 10000,
    "max_contracts": 50000,
    "max_users": 200,
    "max_api_keys": 20
  },
  "policies": {
    "mfa_required": true,
    "password_min_length": 12,
    "session_timeout_minutes": 30,
    "ip_allowlist_enabled": true
  },
  "financial": {
    "default_currency": "YER",
    "approval_threshold": 500000,
    "max_loan_principal": 10000000
  },
  "retention": {
    "financial_years": 7,
    "audit_years": 3
  }
}
```

#### 4.2.3 Resource Isolation

| Resource | Isolation Method | Limit Type |
|---|---|---|
| API rate limits | Per-tenant quotas (see Section 5.2) | Configurable per plan |
| Database connections | Per-tenant connection pool cap | Hard limit |
| Storage | Per-tenant quota | Soft limit with alerts |
| Compute (async jobs) | Per-tenant queue priority | Weighted fair queuing |
| Concurrent users | Per-tenant session limit | Configurable per plan |

#### 4.2.4 Network Isolation

| Control | Description |
|---|---|
| **Tenant-specific API keys** | Each API_CLIENT token is bound to a single tenant |
| **IP allowlisting** | Optional per-tenant IP restriction for API_CLIENT connections |
| **Webhook endpoints** | Per-tenant webhook URLs with HMAC signature verification |
| **VPN/Private endpoints** | Available for premium tenants (dedicated VPC peering) |

---

## 5. API Security

### 5.1 Required Headers — الترويسات المطلوبة

| Header | Required | Description | Validation |
|---|---|---|---|
| `Authorization` | Always | `Bearer <JWT>` | Valid signature, not expired, not revoked |
| `X-Tenant-ID` | Always | Tenant identifier (integer) | Must match `token.tenant_id` |
| `X-Idempotency-Key` | Write operations | UUID v4 for deduplication | Format: UUID v4, unique within 72h TTL |
| `X-Request-ID` | Recommended | Unique request identifier | UUID v4, generated by client or gateway |
| `X-Correlation-ID` | Recommended | Distributed tracing correlation | UUID v4, propagated across services |
| `Content-Type` | Body requests | `application/json` | Strict enforcement; reject others |
| `Accept-Language` | Optional | `ar` or `en` (default: `ar`) | Validated against supported locales |
| `User-Agent` | Recommended | Client identification | Logged for analytics and abuse detection |

**Response Security Headers:**

| Header | Value | Purpose |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Force HTTPS |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `Content-Security-Policy` | `default-src 'self'; frame-ancestors 'none'` | XSS and injection prevention |
| `X-XSS-Protection` | `0` | Disabled (CSP supersedes) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer information |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Restrict browser features |
| `Cache-Control` | `no-store` (for sensitive endpoints) | Prevent caching of sensitive data |

### 5.2 Rate Limiting — تحديد المعدل

#### 5.2.1 Per-Tenant Limits

| Tier | Read (req/min) | Write (req/min) | Burst | Concurrent |
|---|---|---|---|---|
| **Standard** | 1,000 | 200 | 50 req/sec | 100 |
| **Premium** | 5,000 | 1,000 | 200 req/sec | 500 |
| **Enterprise** | Custom | Custom | Custom | Custom |

#### 5.2.2 Per-Endpoint Limits

| Endpoint | Rate Limit | Reason |
|---|---|---|
| `POST /api/v1/contracts` | 50/min | High-cost operation (saga) |
| `POST /api/v1/contracts/{id}/payments` | 100/min | Financial transaction |
| `POST /api/v1/pricing/quote` | 500/min | Compute-intensive (CEL evaluation) |
| `POST /api/v1/numbering/reserve` | 200/min | Atomic sequence operation |
| `POST /api/v1/reservations` | 200/min | Capacity reservation |
| `GET /api/v1/products` | 1,000/min | Read-heavy, cacheable |
| `GET /api/v1/audit/logs` | 100/min | Expensive queries (large dataset) |
| `POST /auth/login` | 10/min per IP | Brute-force prevention |
| `POST /auth/mfa/verify` | 5/min per user | MFA brute-force prevention |

**Rate Limit Response Headers:**

```
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 150
X-RateLimit-Reset: 1738003660
Retry-After: 30
```

**Rate Limit Exceeded Response:**

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded. Retry after 30 seconds.",
    "details": {
      "limit": 200,
      "window": "1 minute",
      "retry_after": 30
    },
    "request_id": "req-abc-123"
  }
}
```

### 5.3 Input Validation — التحقق من المدخلات

#### 5.3.1 JSON Schema Validation

All API request bodies are validated against registered JSON Schemas before processing:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "product_id": { "type": "integer", "minimum": 1 },
    "customer_id": { "type": "integer", "minimum": 1 },
    "principal": { "type": "number", "minimum": 0.01, "maximum": 999999999.99 },
    "currency": { "type": "string", "enum": ["YER", "USD", "SAR"] }
  },
  "required": ["product_id", "customer_id", "principal", "currency"],
  "additionalProperties": false
}
```

**Validation Rules:**

| Check | Implementation |
|---|---|
| Type validation | JSON Schema `type` keyword |
| Range validation | `minimum`, `maximum`, `minLength`, `maxLength` |
| Enum validation | `enum` keyword (e.g., status, currency, product type) |
| Pattern validation | `pattern` keyword (regex for codes, identifiers) |
| No extra fields | `additionalProperties: false` — reject unexpected fields |
| Nested objects | Recursive schema validation for JSONB payloads |

#### 5.3.2 SQL Injection Prevention

| Control | Implementation |
|---|---|
| **Parameterized queries** | All database queries use parameterized statements (never string concatenation) |
| **ORM layer** | Object-Relational Mapping with prepared statements |
| **Stored procedures** | Business logic in PL/pgSQL uses `$1`, `$2` parameter binding |
| **JSONB queries** | Parameterized `jsonb_path_query` — no user input in path expressions |
| **Input sanitization** | All string inputs are sanitized; control characters stripped |

#### 5.3.3 XSS Prevention

| Control | Implementation |
|---|---|
| **Output encoding** | All dynamic content is HTML-entity encoded before rendering |
| **Content-Security-Policy** | Strict CSP headers prevent inline script execution |
| **JSON responses** | API responses are `Content-Type: application/json` (not rendered as HTML) |
| **Bilingual content** | Arabic and English text fields (`name_ar`, `name_en`) are sanitized on input |
| **JSONB content** | User-supplied JSONB values (`payload`, `settings`, `meta`) are validated against schema |

#### 5.3.4 CSRF Protection

| Control | Implementation |
|---|---|
| **SameSite cookies** | All cookies set with `SameSite=Strict` (or `Lax` for OAuth flows) |
| **CSRF tokens** | Synchronizer Token Pattern for state-changing requests from browser clients |
| **Origin validation** | `Origin` and `Referer` headers validated against allowed origins |
| **API clients** | Bearer token authentication (not cookie-based) makes CSRF not applicable for API_CLIENT |

#### 5.3.5 Request Size Limits

| Parameter | Limit | Reason |
|---|---|---|
| Request body | 1 MB (default), 10 MB (file upload) | Prevent memory exhaustion |
| URL length | 2,048 characters | Standard browser limit |
| Header size (total) | 8 KB | Prevent header injection attacks |
| JSON depth | 10 levels | Prevent nested object bombs |
| Array items | 1,000 (default) | Prevent large payload processing |
| Query string parameters | 50 | Prevent parameter pollution |
| Multipart file count | 10 files | Prevent resource exhaustion |

### 5.4 Idempotency — مفتاح عدم التكرار

#### 5.4.1 How It Works

All write operations (`POST`, `PUT`, `DELETE`) require an `X-Idempotency-Key` header (UUID v4). The system guarantees that replaying a request with the same idempotency key returns the same response without re-executing the operation.

**Flow:**

```
Client                    API Gateway              Service              Redis
  │                           │                       │                   │
  │  POST /payments           │                       │                   │
  │  X-Idempotency-Key: K1   │                       │                   │
  │──────────────────────────>│                       │                   │
  │                           │  Check key K1         │                   │
  │                           │──────────────────────────────────────────>│
  │                           │                       │   NOT FOUND       │
  │                           │<──────────────────────────────────────────│
  │                           │  Process request      │                   │
  │                           │──────────────────────>│                   │
  │                           │                       │  Execute          │
  │                           │  Response: 201        │                   │
  │                           │<──────────────────────│                   │
  │                           │  Store (K1 → Response)│                   │
  │                           │──────────────────────────────────────────>│
  │  Response: 201            │                       │  TTL: 72h         │
  │<──────────────────────────│                       │                   │
  │                           │                       │                   │
  │  RETRY (same K1)          │                       │                   │
  │──────────────────────────>│                       │                   │
  │                           │  Check key K1         │                   │
  │                           │──────────────────────────────────────────>│
  │                           │                       │  FOUND (cached)   │
  │                           │<──────────────────────────────────────────│
  │  Response: 201 (cached)   │                       │                   │
  │<──────────────────────────│                       │                   │
```

#### 5.4.2 Storage & TTL

| Parameter | Value |
|---|---|
| Storage backend | Redis |
| Key format | `idempotency:{tenant_id}:{key}` |
| TTL | 72 hours |
| Stored value | HTTP status code + response body (serialized) |
| Conflict handling | If key exists but request body differs: `409 CONFLICT` |

#### 5.4.3 Database Enforcement

In addition to the application-level Redis check, the database enforces idempotency via `UNIQUE` constraints:

```sql
-- payment_event table
idempotency_key TEXT UNIQUE NOT NULL

-- subledger_entry table
idempotency_key TEXT UNIQUE NOT NULL
```

This provides a second line of defense: even if the Redis check fails, a duplicate insert will be rejected by the database.

---

## 6. OWASP Top 10 (2021) Compliance

### A01: Broken Access Control — ضعف التحكم في الوصول

| Threat | Mitigation |
|---|---|
| Unauthorized access to another tenant's data | RLS enforced at database level on all 20+ tables; `app.current_tenant` session variable validated against JWT |
| Privilege escalation | RBAC + ABAC enforcement; permission matrix strictly enforced; role changes require MFA |
| Insecure Direct Object References (IDOR) | All resource access checks verify `tenant_id` ownership before returning data |
| Missing function-level access control | Every API endpoint is decorated with required roles/permissions; default-deny policy |
| Maker-Checker bypass (BR-07) | ABAC rule prevents creator from approving their own resource |
| URL/path traversal | API routes are explicitly defined; no file-system path resolution from user input |

**Controls:**
- Default deny: all endpoints require authentication
- Permission checks at controller level AND service level (defense in depth)
- Automated RBAC tests in CI pipeline
- Quarterly access control review

### A02: Cryptographic Failures — فشل التشفير

| Threat | Mitigation |
|---|---|
| PII stored in plaintext | Application-level AES-256-GCM encryption for all PII fields |
| Weak TLS configuration | TLS 1.3 minimum; strong cipher suites only; automated certificate rotation |
| Hardcoded encryption keys | All keys managed via HashiCorp Vault / AWS KMS; no keys in code or config files |
| Weak password hashing | Argon2id with minimum parameters: memory=64MB, iterations=3, parallelism=4 |
| Data exposure in logs | Structured log sanitization layer; PII fields auto-redacted |
| Unencrypted backups | All backups encrypted with AES-256; keys stored separately from backup data |

### A03: Injection — الحقن

| Threat | Mitigation |
|---|---|
| SQL injection | Parameterized queries exclusively; no string concatenation for SQL |
| NoSQL injection | JSONB path queries use parameterized functions |
| CEL injection (pricing rules) | CEL expressions are validated and sandboxed; user input is bound as variables, not embedded in expressions |
| LDAP injection | Not applicable (OAuth2/OIDC authentication) |
| OS command injection | No shell execution from user input; containerized services |
| Log injection | Structured JSON logging; newlines and control characters stripped from user input |

### A04: Insecure Design — تصميم غير آمن

| Threat | Mitigation |
|---|---|
| Missing threat model | Security architecture documented (this document); threat modeling during design phase |
| Business logic flaws | Business rules (BR-01 through BR-12) enforced at database level (triggers, constraints) and application level |
| Missing rate limiting | Per-tenant, per-endpoint rate limiting (Section 5.2) |
| Absence of abuse detection | Payment pattern analysis; anomaly detection on contract creation velocity |
| Insufficient input validation | JSON Schema validation on all inputs; strict enum checks; `additionalProperties: false` |

**Design Principles:**
- Secure by default (restrictive defaults, explicit grants)
- Defense in depth (validation at gateway, service, database layers)
- Fail secure (errors result in access denial)
- Separation of concerns (Maker-Checker, segregation of duties)

### A05: Security Misconfiguration — خطأ في تكوين الأمان

| Threat | Mitigation |
|---|---|
| Default credentials | No default admin accounts; initial setup requires secure credential generation |
| Unnecessary features enabled | PostgreSQL: only required extensions loaded; container images: minimal base (distroless) |
| Missing security headers | All security headers set at API gateway level (Section 5.1) |
| Verbose error messages | Production errors return generic messages; detailed errors only in non-production environments |
| Unpatched dependencies | Automated dependency scanning (Dependabot/Renovate); monthly patch cycle |
| Cloud misconfiguration | Infrastructure as Code (Terraform); security-focused reviews for all IaC changes |
| Debug endpoints exposed | Debug/health endpoints behind internal network; no debug mode in production |

### A06: Vulnerable and Outdated Components — مكونات ضعيفة وقديمة

| Threat | Mitigation |
|---|---|
| Known CVEs in dependencies | Automated CVE scanning in CI/CD (Snyk, Trivy, or Grype) |
| Outdated runtime versions | PostgreSQL 15+, container base images updated monthly |
| Supply chain attacks | Dependency lock files (pinned versions); container image signing (Cosign) |
| Transitive vulnerabilities | Deep dependency scanning; automated PRs for security patches |

**Process:**
- Weekly automated scans of all dependencies
- Critical/High CVEs: patch within 72 hours
- Medium CVEs: patch within 30 days
- Automated container image scanning on every build
- Software Bill of Materials (SBOM) generated for each release

### A07: Identification and Authentication Failures — فشل المصادقة والتعريف

| Threat | Mitigation |
|---|---|
| Credential stuffing | Rate limiting on auth endpoints (10/min per IP); account lockout after 5 failed attempts |
| Brute-force attacks | Progressive delays; CAPTCHA after 3 failures; MFA requirement |
| Session fixation | New session ID issued on authentication; refresh token rotation |
| Weak passwords | Minimum 12 characters; complexity requirements; breach database check (HaveIBeenPwned API) |
| Missing MFA | MFA required for all financial operations and admin actions (Section 2.1.4) |
| Token theft | Short-lived access tokens (1h); secure HttpOnly cookies for refresh tokens; token revocation |

### A08: Software and Data Integrity Failures — فشل سلامة البرمجيات والبيانات

| Threat | Mitigation |
|---|---|
| Unsigned updates | Container image signing with Cosign; verified deployments only |
| CI/CD tampering | Protected branches; required reviews; signed commits |
| Insecure deserialization | JSON-only API; no object deserialization from untrusted sources |
| Data tampering | Audit log is immutable (no UPDATE/DELETE permissions); domain events are append-only |
| Webhook integrity | All outbound webhooks signed with HMAC-SHA256; tenants verify signatures |
| Sub-ledger tampering | Idempotency keys + immutable subledger entries; double-entry bookkeeping validates balances |

### A09: Security Logging and Monitoring Failures — فشل التسجيل والمراقبة الأمنية

| Threat | Mitigation |
|---|---|
| Missing audit trail | All state changes logged to `audit_log`; all financial events to `domain_event` |
| Insufficient alerting | OpenTelemetry metrics → Grafana dashboards with alert rules |
| Log tampering | Centralized log aggregation; write-once log storage; audit tables have no UPDATE/DELETE grants |
| Missing correlation | `X-Request-ID` and `X-Correlation-ID` propagated across all services |
| Delayed detection | Real-time alerting for: failed auth attempts, cross-tenant violations, unusual payment patterns |

**Logged Events:**
- All authentication attempts (success and failure)
- All authorization denials
- All state transitions (product, contract, reservation)
- All financial transactions (payments, write-offs, penalties)
- All configuration changes (tenant settings, user roles)
- All data access to PII fields

### A10: Server-Side Request Forgery (SSRF) — تزوير طلبات من جانب الخادم

| Threat | Mitigation |
|---|---|
| Internal service access via user-controlled URLs | No user-controlled URLs are used for server-side HTTP requests |
| Webhook URL abuse | Webhook URLs validated against allowlist; private IP ranges blocked (10.x, 172.16.x, 192.168.x, 169.254.x) |
| DNS rebinding | DNS resolution validated before connection; timeout on DNS resolution |
| Cloud metadata access | IMDSv2 enforced (AWS); metadata endpoint blocked from application containers |
| File inclusion | No file paths derived from user input; object storage access via signed URLs only |

---

## 7. Audit & Monitoring

### 7.1 Audit Trail — سجل التدقيق

#### 7.1.1 Architecture

The audit system uses three complementary tables:

| Table | Purpose | Data Captured |
|---|---|---|
| `audit_log` | General entity change tracking | Entity type, ID, action (CREATE/UPDATE/DELETE/STATE_CHANGE), old/new data, user, IP, timestamp |
| `state_transition` | State machine transitions | Entity type, ID, from_state, to_state, triggered_by, timestamp |
| `domain_event` | Event sourcing for financial contracts | Aggregate type, ID, event type, full payload, timestamp |

#### 7.1.2 Immutability

Audit tables are **immutable** — no UPDATE or DELETE operations are permitted:

```sql
-- Application database role has only INSERT and SELECT on audit tables
GRANT INSERT, SELECT ON audit_log TO app_role;
GRANT INSERT, SELECT ON state_transition TO app_role;
GRANT INSERT, SELECT ON domain_event TO app_role;
-- No UPDATE or DELETE granted
```

Additional safeguards:
- Database triggers prevent UPDATE/DELETE even from superuser accounts (optional, for high-security deployments)
- Audit log entries include cryptographic hash of the previous entry (chain integrity, optional)
- Partitioned by `created_at` for retention management without DELETE operations (drop old partitions)

#### 7.1.3 Domain Events for Event Sourcing

Financial contracts use event sourcing for a complete, replayable history:

| Event Type | Trigger | Payload |
|---|---|---|
| `ContractCreated` | `POST /contracts` | Full contract details |
| `ContractActivated` | Status change to ACTIVE | Approver, activation date |
| `ScheduleGenerated` | `POST /contracts/{id}/schedule` | Full installment schedule |
| `PaymentReceived` | `POST /contracts/{id}/payments` | Payment amounts, channel, idempotency key |
| `PenaltyApplied` | Aging job | Penalty type, amount, aging bucket |
| `ContractRestructured` | Restructure approval | New terms, reason |
| `ContractWrittenOff` | Write-off approval | Write-off amount, approver, reason |
| `ContractClosed` | Final payment or write-off | Closing balance, close date |

### 7.2 Security Monitoring — المراقبة الأمنية

#### 7.2.1 Real-Time Alerts

| Event | Severity | Alert Threshold | Response |
|---|---|---|---|
| Failed authentication attempts | HIGH | 5 failures in 5 min (per user) | Account lockout + notify admin |
| Cross-tenant access attempt | CRITICAL | Any occurrence | Immediate block + incident ticket |
| Unusual payment pattern | HIGH | Payment > 3x average for customer | Flag for review; hold disbursement |
| Rate limit exceeded | MEDIUM | 10 consecutive 429 responses | Monitor; escalate if persistent |
| RLS policy violation | CRITICAL | Any occurrence | Block + incident ticket + forensics |
| MFA bypass attempt | HIGH | 3 failures in 10 min | Temporary lockout + alert |
| Admin role assignment | MEDIUM | Any occurrence | Notify security team |
| Bulk data export | MEDIUM | > 1000 records in single query | Log + notify data owner |
| After-hours financial operation | LOW | High-value operation outside business hours | Log + email notification |

#### 7.2.2 OpenTelemetry Integration

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Application │────>│  OTel        │────>│  Grafana     │
│  Services    │     │  Collector   │     │  Stack       │
│              │     │              │     │              │
│  - Traces    │     │  - Process   │     │  - Dashboards│
│  - Metrics   │     │  - Filter    │     │  - Alerts    │
│  - Logs      │     │  - Export    │     │  - Loki/Tempo│
└──────────────┘     └──────────────┘     └──────────────┘
```

**Key Metrics:**

| Metric | Type | Description |
|---|---|---|
| `auth.login.attempts` | Counter | Total login attempts (labeled: success/failure) |
| `auth.mfa.failures` | Counter | MFA verification failures |
| `rls.violations` | Counter | RLS policy violations detected |
| `api.request.duration` | Histogram | Request latency by endpoint |
| `api.ratelimit.exceeded` | Counter | Rate limit violations by tenant |
| `contract.payment.amount` | Histogram | Payment amounts for anomaly detection |
| `tenant.active_sessions` | Gauge | Active sessions per tenant |
| `encryption.key.age_days` | Gauge | Days since last key rotation |

**Distributed Tracing:**

Every request is traced end-to-end with:
- `trace_id`: Unique per request chain
- `span_id`: Unique per service operation
- `X-Correlation-ID`: Business correlation (propagated from client)
- Sensitive data is excluded from trace attributes

### 7.3 Incident Response — الاستجابة للحوادث

#### 7.3.1 Severity Classification

| Severity | Description | Response Time | Examples |
|---|---|---|---|
| **P1 — Critical** | Active data breach or system compromise | 15 minutes | Cross-tenant data leak, RLS bypass, credential compromise |
| **P2 — High** | Potential breach or significant vulnerability | 1 hour | Suspicious access patterns, unpatched critical CVE |
| **P3 — Medium** | Security policy violation, no data exposure | 4 hours | Rate limit abuse, failed pen test finding |
| **P4 — Low** | Minor security improvement needed | 24 hours | Missing header, non-critical config issue |

#### 7.3.2 Incident Response Process

```
1. DETECT     → Automated monitoring alerts or manual report
                 (OpenTelemetry → Grafana → PagerDuty)

2. TRIAGE     → Classify severity (P1-P4)
                 → Assign incident commander
                 → Open incident channel

3. CONTAIN    → Isolate affected tenant(s)
                 → Revoke compromised credentials
                 → Block attack source (IP, user, API key)
                 → Enable enhanced logging

4. ERADICATE  → Identify root cause
                 → Patch vulnerability
                 → Verify fix in staging

5. RECOVER    → Deploy fix to production
                 → Verify system integrity
                 → Restore normal operations
                 → Re-enable affected accounts (with password reset)

6. REVIEW     → Post-incident review (within 48h)
                 → Update runbooks and monitoring
                 → Notify affected tenants (if data exposure)
                 → Regulatory notification (if required)
                 → Update this security document
```

#### 7.3.3 Communication

| Audience | When | Channel |
|---|---|---|
| Security team | Immediately on detection | PagerDuty + Slack |
| Engineering lead | P1/P2 within 15 min | Phone + Slack |
| Affected tenants | After containment (P1/P2) | Email + in-app notification |
| Regulatory bodies | Within 72h if data breach (GDPR) | Formal written notification |
| All tenants | Post-incident (if systemic) | Status page + email |

---

## 8. Financial Compliance

### 8.1 IFRS 9 Compliance — الامتثال للمعيار الدولي لإعداد التقارير المالية 9

The Dynamic Product System implements IFRS 9 requirements for financial instrument management through the Contracts Service and Accounting Mapper.

#### 8.1.1 Sub-Ledger Entries — قيود الدفتر الفرعي

Every financial transaction generates immutable sub-ledger entries in `subledger_entry`:

| Event Type | Debit Account | Credit Account | Description |
|---|---|---|---|
| `DISBURSEMENT` | Loan Receivable (1201) | Cash/Bank (1001) | Loan disbursement |
| `PAYMENT` | Cash/Bank (1001) | Loan Receivable (1201) | Principal repayment |
| `INTEREST_ACCRUAL` | Interest Receivable (1202) | Interest Income (4001) | Periodic interest accrual |
| `INTEREST_PAYMENT` | Cash/Bank (1001) | Interest Receivable (1202) | Interest received |
| `FEE_COLLECTION` | Cash/Bank (1001) | Fee Income (4002) | Fee payment |
| `PENALTY_ACCRUAL` | Penalty Receivable (1203) | Penalty Income (4003) | Late payment penalty |
| `PROVISION` | Impairment Expense (5001) | ECL Provision (2001) | Expected credit loss |
| `WRITE_OFF` | ECL Provision (2001) | Loan Receivable (1201) | Bad debt write-off |

**Integrity Controls:**
- Every entry has a unique `idempotency_key` (prevents duplicate postings)
- Double-entry principle: every transaction has equal debit and credit
- Entries are immutable (INSERT only, no UPDATE/DELETE)
- Reconciliation jobs verify debit/credit balance integrity daily

#### 8.1.2 Aging Bucket Management (BR-08) — إدارة مجموعات التقادم

| Bucket | Days Past Due | Action | IFRS 9 Stage |
|---|---|---|---|
| Current | 0 | Normal servicing | Stage 1 |
| 30 Days | 1-30 | Alert to account officer | Stage 1 |
| 60 Days | 31-60 | Escalate to supervisor | Stage 2 |
| 90 Days | 61-90 | Suspend contract; collection action | Stage 2 |
| 180 Days | 91-180 | Classify as impaired | Stage 3 |
| 180+ Days | >180 | Recommend write-off | Stage 3 |

**Automated Aging Process:**
1. Daily scheduled job scans installments past due date
2. Classifies into aging buckets based on `due_on` vs current date
3. Generates `penalty_event` entries with applicable fees
4. Updates contract status: `ACTIVE` → `IN_ARREARS` (automated)
5. Emits domain events for each state transition
6. Creates audit log entries for every action

#### 8.1.3 Write-Off Procedures — إجراءات الشطب

Write-off is an irreversible action with multiple safeguards:

1. **Eligibility**: Only contracts in `IN_ARREARS` status for 180+ days
2. **Authorization**: Requires `FINANCE_OFFICER` + `RISK_OFFICER` dual approval (ABAC rule)
3. **MFA**: Both approvers must complete MFA challenge
4. **Documentation**: Reason and supporting documents must be attached
5. **Accounting**: Automatic sub-ledger entries (provision reversal + write-off)
6. **Audit Trail**: Full event sourcing record with all approvers and timestamps
7. **Reporting**: Written-off amounts reported in IFRS 9 disclosures

#### 8.1.4 Audit Trail Requirements

| Requirement | Implementation |
|---|---|
| Complete transaction history | `domain_event` table with event sourcing for all contract lifecycle events |
| Immutable records | No UPDATE/DELETE on financial tables; corrections via reversal entries |
| Timestamp integrity | `TIMESTAMPTZ` with database server time (not client time) |
| User attribution | Every action linked to authenticated user via `user_id` in audit_log |
| Reconstruction capability | Event replay from `domain_event` can reconstruct contract state at any point in time |
| External audit access | `AUDITOR` role provides read-only access to all audit data |
| Retention | 7 years for all financial records (partition-based retention management) |

### 8.2 Maker-Checker (BR-07) — صانع-مدقق

#### 8.2.1 Workflow — سير العمل

The Maker-Checker pattern enforces separation of duties for critical operations:

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│    MAKER      │     │   SYSTEM      │     │   CHECKER     │
│  (initiator)  │     │  (validate)   │     │  (approver)   │
└───────┬───────┘     └───────┬───────┘     └───────┬───────┘
        │                     │                     │
        │  Create/Change      │                     │
        │  (status: PENDING)  │                     │
        │────────────────────>│                     │
        │                     │                     │
        │                     │  Validate:          │
        │                     │  - checker != maker │
        │                     │  - checker has role │
        │                     │  - MFA verified     │
        │                     │                     │
        │                     │  Notify checker     │
        │                     │────────────────────>│
        │                     │                     │
        │                     │     Approve/Reject  │
        │                     │<────────────────────│
        │                     │                     │
        │                     │  Apply change       │
        │                     │  (status: ACTIVE)   │
        │                     │                     │
        │  Notification       │                     │
        │<────────────────────│                     │
```

#### 8.2.2 Operations Requiring Maker-Checker

| Operation | Maker Role(s) | Checker Role(s) | MFA |
|---|---|---|---|
| Product activation | PRODUCT_MANAGER | TENANT_ADMIN, SUPER_ADMIN | Yes |
| Contract activation | FINANCE_OFFICER | TENANT_ADMIN, RISK_OFFICER | Yes |
| Contract write-off | FINANCE_OFFICER | RISK_OFFICER + TENANT_ADMIN | Yes |
| Contract restructure | FINANCE_OFFICER | RISK_OFFICER | Yes |
| Price list activation | PRODUCT_MANAGER | TENANT_ADMIN | No |
| User role assignment | TENANT_ADMIN | SUPER_ADMIN | Yes |
| Eligibility rule change | RISK_OFFICER | TENANT_ADMIN | No |
| Bulk payment processing | FINANCE_OFFICER | TENANT_ADMIN | Yes |

#### 8.2.3 Separation of Duties

| Principle | Enforcement |
|---|---|
| Maker cannot approve their own action | ABAC rule: `approval.approver_id != resource.created_by` |
| Checker must have appropriate role | RBAC permission check on approval endpoint |
| Both parties must be authenticated | Valid JWT required; MFA for high-value operations |
| Approval window | Pending approvals expire after configurable TTL (default: 48 hours) |
| Approval cannot be delegated | Approval is tied to the authenticated user's identity |

#### 8.2.4 Approval Audit Trail

Every approval action is recorded with:

```json
{
  "entity_type": "contract",
  "entity_id": 1001,
  "action": "STATE_CHANGE",
  "old_data": { "status": "DRAFT" },
  "new_data": { "status": "ACTIVE" },
  "user_id": "checker-user-456",
  "ip": "192.168.1.20",
  "metadata": {
    "maker_id": "maker-user-123",
    "maker_at": "2026-02-09T10:00:00Z",
    "checker_id": "checker-user-456",
    "checker_at": "2026-02-09T14:30:00Z",
    "mfa_method": "TOTP",
    "approval_type": "STANDARD"
  }
}
```

---

## 9. Security Checklist — قائمة التحقق الأمني

### 9.1 Pre-Deployment Checklist

| Category | Item | Status |
|---|---|---|
| **Authentication** | | |
| | OAuth2/OIDC provider configured and tested | [ ] |
| | JWT signing keys stored in Vault/KMS (not in code) | [ ] |
| | Token expiration configured (access: 1h, refresh: 24h) | [ ] |
| | Refresh token rotation enabled (one-time use) | [ ] |
| | MFA enabled for financial operations | [ ] |
| | Account lockout after 5 failed attempts | [ ] |
| | Password policy enforced (min 12 chars, complexity, breach check) | [ ] |
| **Authorization** | | |
| | RBAC roles and permissions configured per matrix (Section 2.2.2) | [ ] |
| | ABAC rules deployed (tenant isolation, branch restriction, approval limits) | [ ] |
| | Maker-Checker workflow tested for all applicable operations | [ ] |
| | Default deny policy verified (no unauthenticated access) | [ ] |
| | SUPER_ADMIN access logging and alerting configured | [ ] |
| **Data Protection** | | |
| | TLS 1.3 configured on all external endpoints | [ ] |
| | mTLS configured for inter-service communication | [ ] |
| | PII fields encrypted at application level (AES-256-GCM) | [ ] |
| | Database TDE or full-disk encryption enabled | [ ] |
| | Backup encryption verified | [ ] |
| | Key rotation schedule configured in Vault/KMS | [ ] |
| | PII masking verified in logs (no plaintext PII in any log output) | [ ] |
| | PII masking verified in API responses (role-based) | [ ] |
| **Multi-tenancy** | | |
| | RLS enabled on all 20+ tenant-scoped tables | [ ] |
| | RLS policies tested with cross-tenant queries (zero leakage) | [ ] |
| | `app.current_tenant` session variable set in all database transactions | [ ] |
| | `X-Tenant-ID` header cross-validated against JWT `tenant_id` | [ ] |
| | Redis keys prefixed with `tenant:{id}:` | [ ] |
| | Object storage paths include tenant ID | [ ] |
| **API Security** | | |
| | All security response headers configured (Section 5.1) | [ ] |
| | Rate limiting configured per-tenant and per-endpoint | [ ] |
| | JSON Schema validation on all input endpoints | [ ] |
| | Request size limits configured | [ ] |
| | Idempotency key validation on all write endpoints | [ ] |
| | CORS policy restricts origins to known domains | [ ] |
| | No sensitive data in URL query parameters | [ ] |
| **OWASP** | | |
| | SQL injection: parameterized queries verified (no string concatenation) | [ ] |
| | XSS: output encoding and CSP headers configured | [ ] |
| | CSRF: SameSite cookies and CSRF tokens configured | [ ] |
| | SSRF: private IP ranges blocked for outbound requests | [ ] |
| | Dependency scanning (CVE) integrated in CI/CD | [ ] |
| | Container image scanning integrated in CI/CD | [ ] |
| | No debug endpoints exposed in production | [ ] |
| | Error messages do not leak internal details in production | [ ] |
| **Audit & Monitoring** | | |
| | Audit log tables created with INSERT/SELECT only permissions | [ ] |
| | OpenTelemetry collector deployed and receiving data | [ ] |
| | Grafana dashboards configured for security metrics | [ ] |
| | Alert rules configured for critical security events | [ ] |
| | Log aggregation configured (centralized, tamper-resistant) | [ ] |
| | Incident response runbook documented and tested | [ ] |
| | PagerDuty/on-call rotation configured for P1/P2 incidents | [ ] |
| **Financial Compliance** | | |
| | Sub-ledger entries generated for all financial transactions | [ ] |
| | Double-entry bookkeeping verification job scheduled | [ ] |
| | Aging bucket automation tested (30/60/90/180 day thresholds) | [ ] |
| | Write-off workflow tested with dual approval | [ ] |
| | 7-year retention policy configured (partitioning + archival) | [ ] |
| | IFRS 9 stage classification automated | [ ] |
| | Event sourcing replay tested for contract reconstruction | [ ] |
| **Infrastructure** | | |
| | Kubernetes network policies restrict pod-to-pod traffic | [ ] |
| | Database credentials rotated and stored in Vault | [ ] |
| | Container images use minimal base (distroless/alpine) | [ ] |
| | No root processes in containers | [ ] |
| | Resource limits (CPU/memory) set on all pods | [ ] |
| | Pod security standards enforced (restricted profile) | [ ] |
| | Secrets not stored in environment variables (use mounted volumes from Vault) | [ ] |
| | Cloud IAM roles follow least-privilege principle | [ ] |
| | Database accessible only from application VPC (no public endpoint) | [ ] |
| | Redis accessible only from application VPC | [ ] |

### 9.2 Periodic Review Schedule

| Review | Frequency | Owner | Description |
|---|---|---|---|
| Access control review | Quarterly | Security Team | Review all role assignments; remove stale access |
| Penetration testing | Quarterly | External Vendor | Full application and infrastructure pen test |
| Dependency audit | Weekly (automated) | CI/CD Pipeline | Scan all dependencies for known CVEs |
| Key rotation verification | Monthly | Security Team | Verify all encryption keys within rotation schedule |
| RLS policy testing | Every release | QA Team | Automated cross-tenant isolation tests |
| Incident response drill | Semi-annually | Security Team | Simulated security incident exercise |
| Backup restoration test | Quarterly | Operations Team | Verify backup integrity and recovery procedures |
| Compliance audit | Annually | External Auditor | IFRS 9, ISO 27001 alignment, data protection |
| Security document review | Quarterly | Security Team | Update this document with new threats and controls |
| Tenant isolation audit | Monthly | Security Team | Review RLS logs, cross-tenant access attempts |

---

## Appendix A: Glossary — المصطلحات

| Term (EN) | Term (AR) | Definition |
|---|---|---|
| RLS | أمان مستوى الصف | Row Level Security — PostgreSQL feature for row-level access control |
| RBAC | التحكم بالوصول القائم على الأدوار | Role-Based Access Control |
| ABAC | التحكم بالوصول القائم على السمات | Attribute-Based Access Control |
| PII | بيانات التعريف الشخصية | Personally Identifiable Information |
| MFA | المصادقة متعددة العوامل | Multi-Factor Authentication |
| KMS | نظام إدارة المفاتيح | Key Management System |
| DEK | مفتاح تشفير البيانات | Data Encryption Key |
| KEK | مفتاح تشفير المفاتيح | Key Encryption Key |
| CEL | لغة التعبيرات المشتركة | Common Expression Language (rules engine) |
| IFRS 9 | المعيار الدولي 9 | International Financial Reporting Standard 9 |
| ECL | الخسائر الائتمانية المتوقعة | Expected Credit Loss |
| TDE | تشفير البيانات الشفاف | Transparent Data Encryption |
| mTLS | أمان طبقة النقل المتبادل | Mutual Transport Layer Security |
| SSRF | تزوير طلبات من جانب الخادم | Server-Side Request Forgery |
| IDOR | مرجع كائن مباشر غير آمن | Insecure Direct Object Reference |

---

## Appendix B: References

| Document | Location | Description |
|---|---|---|
| SRS V2.0 | `docs/SRS-v2.0.md` | Full software requirements specification |
| API Specification | `docs/api-specification.md` | REST API endpoint details |
| Database Schema | `db/schema.sql` | PostgreSQL DDL with RLS policies |
| OWASP Top 10 (2021) | [owasp.org](https://owasp.org/Top10/) | Application security risks |
| IFRS 9 | IAS/IFRS Standards | Financial instruments standard |
| ISO 27001 | ISO Standards | Information security management |
| OAuth 2.0 | RFC 6749 | Authorization framework |
| OpenID Connect | openid.net | Authentication layer on OAuth 2.0 |
| JWT | RFC 7519 | JSON Web Tokens |
| OpenTelemetry | opentelemetry.io | Observability framework |

---

*This document is reviewed quarterly and updated as the threat landscape and system architecture evolve. Last review: 2026-02-09.*

*هذا المستند يُراجع كل ربع سنة ويُحدَّث مع تطور بيئة التهديدات وبنية النظام. آخر مراجعة: 2026-02-09.*
