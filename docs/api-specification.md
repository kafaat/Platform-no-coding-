# API Specification — Dynamic Product System V2.0

## Overview

All APIs require the following headers:

| Header | Required | Description |
|---|---|---|
| `Authorization` | Yes | `Bearer <token>` — OAuth2/OIDC token |
| `X-Tenant-ID` | Yes | Tenant identifier for multi-tenancy isolation |
| `X-Idempotency-Key` | Write ops | Unique key to prevent duplicate operations |
| `Accept-Language` | No | `ar` or `en` (default: `ar`) |

**Base URL**: `/api/v1/`

**Versioning**: URL-based (`/api/v1/`, `/api/v2/`)

---

## 1. Products

### POST /api/v1/products

Create a new product (Draft).

**Request Body:**
```json
{
  "category_id": 1,
  "type": "PHYSICAL",
  "name_ar": "منتج تجريبي",
  "name_en": "Test Product"
}
```

**Response:** `201 Created`
```json
{
  "id": 123,
  "status": "DRAFT",
  "created_at": "2026-02-09T12:00:00Z"
}
```

### GET /api/v1/products

List products with filters.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `type` | string | Filter by type: PHYSICAL, DIGITAL, SERVICE, RESERVATION, FINANCIAL |
| `status` | string | Filter by status: DRAFT, ACTIVE, SUSPENDED, RETIRED |
| `category_id` | integer | Filter by category |
| `page` | integer | Page number (default: 1) |
| `size` | integer | Page size (default: 20, max: 100) |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 123,
      "type": "PHYSICAL",
      "name_ar": "منتج تجريبي",
      "name_en": "Test Product",
      "status": "ACTIVE",
      "category_id": 1,
      "current_version": 2,
      "channels": ["WEB", "MOBILE"]
    }
  ],
  "total": 150,
  "page": 1,
  "size": 20
}
```

### GET /api/v1/products/{id}

Get product details with all relations.

**Response:** `200 OK`
```json
{
  "id": 123,
  "tenant_id": 1,
  "category_id": 1,
  "type": "PHYSICAL",
  "name_ar": "منتج تجريبي",
  "name_en": "Test Product",
  "status": "ACTIVE",
  "divisible": false,
  "lifecycle_from": "2026-01-01",
  "lifecycle_to": null,
  "versions": [...],
  "attributes": [...],
  "channels": [...],
  "pricing": [...],
  "charges": [...]
}
```

### POST /api/v1/products/{id}/versions

Add a new version to a product.

**Request Body:**
```json
{
  "effective_from": "2026-03-01",
  "effective_to": "2026-12-31",
  "data": {
    "description": "Updated version"
  }
}
```

**Response:** `201 Created`
```json
{
  "version_id": 5,
  "version_no": 2,
  "effective_from": "2026-03-01",
  "effective_to": "2026-12-31"
}
```

### PUT /api/v1/products/{id}/status

Change product status (requires Maker-Checker for activation).

**Request Body:**
```json
{
  "status": "ACTIVE",
  "approved_by": "user-456"
}
```

**Response:** `200 OK`
```json
{
  "id": 123,
  "status": "ACTIVE",
  "approved_by": "user-456",
  "approved_at": "2026-02-09T14:00:00Z"
}
```

---

## 2. Pricing

### POST /api/v1/pricing/quote

Get a pricing quote for a product.

**Request Body:**
```json
{
  "product_id": 123,
  "channel": "WEB",
  "qty": 5,
  "currency": "YER"
}
```

**Response:** `200 OK`
```json
{
  "product_id": 123,
  "base_price": 1000.00,
  "discount": 50.00,
  "tax": 95.00,
  "total": 1045.00,
  "currency": "YER",
  "rules_applied": ["VOLUME_DISCOUNT", "CHANNEL_MARKUP"]
}
```

### POST /api/v1/price-lists

Create a new price list.

**Request Body:**
```json
{
  "name": "قائمة أسعار التجزئة",
  "currency": "YER",
  "valid_from": "2026-01-01",
  "valid_to": "2026-12-31"
}
```

**Response:** `201 Created`
```json
{
  "id": 10,
  "name": "قائمة أسعار التجزئة",
  "currency": "YER",
  "valid_from": "2026-01-01",
  "valid_to": "2026-12-31"
}
```

---

## 3. Numbering

### POST /api/v1/numbering/reserve

Reserve a sequential number.

**Request Body:**
```json
{
  "scheme_code": "CONTRACT_NUM",
  "context": {
    "branch": "SANA",
    "channel": "WEB"
  }
}
```

**Response:** `201 Created`
```json
{
  "identifier": "FIN-LOAN-2026-001234",
  "scheme_code": "CONTRACT_NUM",
  "sequence_value": 1234,
  "reserved_until": "2026-02-09T13:00:00Z"
}
```

---

## 4. Contracts

### POST /api/v1/contracts

Create a new financial contract.

**Request Body:**
```json
{
  "product_id": 50,
  "customer_id": 200,
  "principal": 500000.00,
  "currency": "YER",
  "terms": {
    "duration_months": 12,
    "interest_type": "REDUCING",
    "day_count": "30E/360",
    "grace_period_days": 7
  }
}
```

**Response:** `201 Created`
```json
{
  "contract_id": 1001,
  "contract_number": "FIN-LOAN-2026-001234",
  "status": "DRAFT",
  "principal": 500000.00,
  "currency": "YER"
}
```

### POST /api/v1/contracts/{id}/schedule

Generate installment schedule.

**Request Body:**
```json
{
  "template_id": 3
}
```

**Response:** `201 Created`
```json
{
  "contract_id": 1001,
  "installments": [
    {
      "seq": 1,
      "due_on": "2026-03-01",
      "principal_due": 41666.67,
      "interest_due": 8333.33,
      "fee_due": 0,
      "total": 50000.00
    }
  ],
  "summary": {
    "total_principal": 500000.00,
    "total_interest": 35000.00,
    "total_fees": 5000.00,
    "grand_total": 540000.00,
    "num_installments": 12
  }
}
```

### POST /api/v1/contracts/{id}/payments

Record a payment.

**Request Body:**
```json
{
  "installment_id": 5001,
  "amounts": {
    "principal": 41666.67,
    "interest": 8333.33,
    "fee": 0
  },
  "channel": "BRANCH"
}
```

**Response:** `201 Created`
```json
{
  "payment_id": 9001,
  "contract_id": 1001,
  "installment_id": 5001,
  "total_paid": 50000.00,
  "subledger_entries": [
    {
      "event_type": "PAYMENT",
      "dr_account": "1201-LOAN_RECEIVABLE",
      "cr_account": "1001-CASH",
      "amount": 50000.00
    }
  ]
}
```

### GET /api/v1/contracts/{id}/statement

Get account statement.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `from` | date | Start date (ISO 8601) |
| `to` | date | End date (ISO 8601) |

**Response:** `200 OK`
```json
{
  "contract_id": 1001,
  "contract_number": "FIN-LOAN-2026-001234",
  "entries": [
    {
      "date": "2026-02-09",
      "event_type": "DISBURSEMENT",
      "dr_account": "1201-LOAN_RECEIVABLE",
      "cr_account": "1001-CASH",
      "amount": 500000.00,
      "balance": 500000.00
    }
  ],
  "current_balance": 458333.33
}
```

---

## 5. Reservations

### GET /api/v1/reservations/availability

Check availability for a product.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `product_id` | integer | Required — product to check |
| `from` | datetime | Start of period |
| `to` | datetime | End of period |

**Response:** `200 OK`
```json
{
  "product_id": 75,
  "slots": [
    {
      "from": "2026-03-01T09:00:00Z",
      "to": "2026-03-01T12:00:00Z",
      "available": true,
      "capacity": 5,
      "booked": 2
    }
  ]
}
```

### POST /api/v1/reservations

Create a reservation (HOLD).

**Request Body:**
```json
{
  "product_id": 75,
  "customer_id": 200,
  "slot_from": "2026-03-01T09:00:00Z",
  "slot_to": "2026-03-01T12:00:00Z"
}
```

**Response:** `201 Created`
```json
{
  "id": 3001,
  "status": "HOLD",
  "hold_until": "2026-02-09T13:15:00Z",
  "slot_from": "2026-03-01T09:00:00Z",
  "slot_to": "2026-03-01T12:00:00Z"
}
```

### PUT /api/v1/reservations/{id}/confirm

Confirm a reservation after payment.

**Request Body:**
```json
{
  "payment_ref": "PAY-2026-XYZ"
}
```

**Response:** `200 OK`
```json
{
  "id": 3001,
  "status": "CONFIRMED",
  "payment_ref": "PAY-2026-XYZ"
}
```

### PUT /api/v1/reservations/{id}/cancel

Cancel a reservation.

**Response:** `200 OK`
```json
{
  "id": 3001,
  "status": "CANCELLED",
  "penalty": {
    "amount": 150.00,
    "currency": "YER",
    "reason": "Late cancellation (< 24h)"
  }
}
```

---

## Error Responses

All errors follow a consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Eligibility check failed",
    "details": [
      {
        "field": "score",
        "reason": "Score 450 is below minimum 500"
      }
    ],
    "request_id": "req-abc-123"
  }
}
```

### Error Codes

| HTTP Code | Error Code | Description |
|---|---|---|
| 400 | BAD_REQUEST | Invalid or missing input data |
| 401 | UNAUTHORIZED | Missing or expired token |
| 403 | FORBIDDEN | No permission for this tenant/action |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Conflict (overlapping version, duplicate number) |
| 422 | VALIDATION_ERROR | Validation failed (eligibility, missing documents) |
| 429 | RATE_LIMITED | Rate limit exceeded |
| 500 | INTERNAL_ERROR | Internal server error |

---

## Rate Limiting

| Tier | Read | Write |
|---|---|---|
| Standard | 1000 req/min | 200 req/min |
| Premium | 5000 req/min | 1000 req/min |

Rate limit headers are included in every response:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

---

## Pagination

All list endpoints support cursor-based or offset pagination:

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | 1 | Page number |
| `size` | integer | 20 | Items per page (max: 100) |

Response includes:
```json
{
  "data": [...],
  "total": 500,
  "page": 1,
  "size": 20,
  "has_next": true
}
```
