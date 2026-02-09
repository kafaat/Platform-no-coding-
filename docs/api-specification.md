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

### GET /api/v1/pricing/price-lists

List price lists with optional filters.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `currency` | string | Filter by currency: YER, USD, SAR |
| `page` | integer | Page number (default: 1) |
| `size` | integer | Page size (default: 20, max: 100) |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 10,
      "name": "قائمة أسعار التجزئة",
      "currency": "YER",
      "valid_from": "2026-01-01",
      "valid_to": "2026-12-31",
      "created_at": "2026-01-01T00:00:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "size": 20
}
```

### POST /api/v1/pricing/price-lists

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

### GET /api/v1/pricing/price-lists/{id}

Get a single price list with its product entries.

**Response:** `200 OK`
```json
{
  "id": 10,
  "name": "قائمة أسعار التجزئة",
  "currency": "YER",
  "valid_from": "2026-01-01",
  "valid_to": "2026-12-31",
  "products": [
    {
      "product_id": 123,
      "price": 1000.00,
      "min_qty": 1,
      "max_qty": null
    }
  ],
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-15T10:30:00Z"
}
```

### PUT /api/v1/pricing/price-lists/{id}

Update a price list.

**Request Body:**
```json
{
  "name": "قائمة أسعار التجزئة - محدثة",
  "currency": "YER",
  "valid_from": "2026-01-01",
  "valid_to": "2027-06-30"
}
```

**Response:** `200 OK`
```json
{
  "id": 10,
  "name": "قائمة أسعار التجزئة - محدثة",
  "currency": "YER",
  "valid_from": "2026-01-01",
  "valid_to": "2027-06-30",
  "updated_at": "2026-02-09T12:00:00Z"
}
```

### DELETE /api/v1/pricing/price-lists/{id}

Delete a price list. Fails if the price list is currently linked to active product channels (BR-02).

**Response:** `204 No Content`

**Error Response:** `409 Conflict`
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Cannot delete price list linked to active product channels",
    "details": [
      {
        "field": "price_list_id",
        "reason": "Price list 10 is linked to 3 active product channels"
      }
    ],
    "request_id": "req-abc-456"
  }
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

### GET /api/v1/numbering/schemes

List all numbering schemes.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `entity_type` | string | Filter by entity type (e.g., CONTRACT, PRODUCT, RESERVATION) |
| `is_active` | boolean | Filter by active status |
| `page` | integer | Page number (default: 1) |
| `size` | integer | Page size (default: 20, max: 100) |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "code": "CONTRACT_NUM",
      "name_ar": "ترقيم العقود",
      "name_en": "Contract Numbering",
      "pattern": "FIN-LOAN-{YYYY}-{SEQ:6}",
      "entity_type": "CONTRACT",
      "is_active": true,
      "created_at": "2026-01-01T00:00:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "size": 20
}
```

### GET /api/v1/numbering/schemes/{id}

Get a numbering scheme with its current sequences.

**Response:** `200 OK`
```json
{
  "id": 1,
  "code": "CONTRACT_NUM",
  "name_ar": "ترقيم العقود",
  "name_en": "Contract Numbering",
  "pattern": "FIN-LOAN-{YYYY}-{SEQ:6}",
  "entity_type": "CONTRACT",
  "is_active": true,
  "sequences": [
    {
      "id": 10,
      "period_key": "2026",
      "current_value": 1234,
      "max_value": 999999,
      "updated_at": "2026-02-09T12:00:00Z"
    }
  ],
  "created_at": "2026-01-01T00:00:00Z"
}
```

### GET /api/v1/numbering/sequences

List numbering sequences with current values.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `scheme_id` | integer | Filter by numbering scheme |
| `period_key` | string | Filter by period (e.g., "2026") |
| `page` | integer | Page number (default: 1) |
| `size` | integer | Page size (default: 20, max: 100) |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 10,
      "scheme_id": 1,
      "scheme_code": "CONTRACT_NUM",
      "period_key": "2026",
      "current_value": 1234,
      "max_value": 999999,
      "updated_at": "2026-02-09T12:00:00Z"
    }
  ],
  "total": 12,
  "page": 1,
  "size": 20
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

### GET /api/v1/contracts/{id}/early-settlement

Preview early settlement amount without executing (read-only).

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `settlement_date` | date | Settlement calculation date (ISO 8601, default: today) |

**Response:** `200 OK`
```json
{
  "contract_id": 1001,
  "contract_number": "FIN-LOAN-2026-001234",
  "settlement_date": "2026-03-01",
  "outstanding_principal": 375000.00,
  "accrued_interest": 3125.00,
  "settlement_fee": 1875.00,
  "total_settlement": 380000.00,
  "currency": "YER"
}
```

### POST /api/v1/contracts/{id}/early-settlement

Calculate and execute early settlement. Closes the contract and generates subledger entries.

**Required Headers:**

| Header | Required | Description |
|---|---|---|
| `Authorization` | Yes | `Bearer <token>` |
| `X-Tenant-ID` | Yes | Tenant identifier |
| `X-Idempotency-Key` | Yes | Unique key to prevent duplicate settlements |

**Request Body:**
```json
{
  "settlement_date": "2026-03-01",
  "channel": "BRANCH",
  "idempotency_key": "es-1001-20260301"
}
```

**Response:** `200 OK`
```json
{
  "contract_id": 1001,
  "contract_number": "FIN-LOAN-2026-001234",
  "settlement_date": "2026-03-01",
  "outstanding_principal": 375000.00,
  "accrued_interest": 3125.00,
  "settlement_fee": 1875.00,
  "total_settlement": 380000.00,
  "currency": "YER",
  "contract_status": "CLOSED",
  "subledger_entries": [
    {
      "event_type": "EARLY_SETTLEMENT",
      "dr_account": "1001-CASH",
      "cr_account": "1201-LOAN_RECEIVABLE",
      "amount": 375000.00,
      "description": "Early settlement — principal"
    },
    {
      "event_type": "EARLY_SETTLEMENT",
      "dr_account": "1001-CASH",
      "cr_account": "4101-INTEREST_INCOME",
      "amount": 3125.00,
      "description": "Early settlement — accrued interest"
    },
    {
      "event_type": "EARLY_SETTLEMENT",
      "dr_account": "1001-CASH",
      "cr_account": "4201-FEE_INCOME",
      "amount": 1875.00,
      "description": "Early settlement — fee"
    }
  ],
  "closed_at": "2026-03-01T10:00:00Z"
}
```

**Error Response:** `422 Unprocessable Entity`
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Contract is not eligible for early settlement",
    "details": [
      {
        "field": "status",
        "reason": "Contract status must be ACTIVE or IN_ARREARS, current status: CLOSED"
      }
    ],
    "request_id": "req-es-789"
  }
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

### GET /api/v1/reservations

List reservations with filters.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `product_id` | integer | Filter by product |
| `customer_id` | integer | Filter by customer |
| `status` | string | Filter by status: HOLD, CONFIRMED, EXPIRED, CANCELLED, COMPLETED |
| `from` | datetime | Start of period (ISO 8601) |
| `to` | datetime | End of period (ISO 8601) |
| `page` | integer | Page number (default: 1) |
| `size` | integer | Page size (default: 20, max: 100) |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 3001,
      "product_id": 75,
      "customer_id": 200,
      "status": "CONFIRMED",
      "slot_from": "2026-03-01T09:00:00Z",
      "slot_to": "2026-03-01T12:00:00Z",
      "payment_ref": "PAY-2026-XYZ",
      "created_at": "2026-02-09T12:00:00Z"
    },
    {
      "id": 3002,
      "product_id": 75,
      "customer_id": 201,
      "status": "HOLD",
      "slot_from": "2026-03-02T14:00:00Z",
      "slot_to": "2026-03-02T17:00:00Z",
      "hold_until": "2026-02-09T13:15:00Z",
      "created_at": "2026-02-09T12:30:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "size": 20
}
```

### GET /api/v1/reservations/{id}

Get a single reservation with full details.

**Response:** `200 OK`
```json
{
  "id": 3001,
  "tenant_id": 1,
  "product_id": 75,
  "customer_id": 200,
  "status": "CONFIRMED",
  "slot_from": "2026-03-01T09:00:00Z",
  "slot_to": "2026-03-01T12:00:00Z",
  "hold_until": null,
  "payment_ref": "PAY-2026-XYZ",
  "cancellation_policy": {
    "id": 5,
    "name_en": "Standard Policy",
    "penalty_type": "PERCENT",
    "penalty_value": 10.00,
    "free_cancel_hours": 24
  },
  "product": {
    "id": 75,
    "name_ar": "قاعة اجتماعات أ",
    "name_en": "Meeting Room A"
  },
  "customer": {
    "id": 200,
    "name_en": "Ahmed Mohammed"
  },
  "created_at": "2026-02-09T12:00:00Z",
  "updated_at": "2026-02-09T12:30:00Z"
}
```

---

## 6. Categories

### POST /api/v1/categories

Create a product category.

**Request Body:**
```json
{
  "parent_id": null,
  "name_ar": "إلكترونيات",
  "name_en": "Electronics",
  "type": "PHYSICAL",
  "default_policies": {
    "channels": ["WEB", "MOBILE"],
    "tax_rate": 0.05
  }
}
```

**Response:** `201 Created`
```json
{
  "id": 5,
  "parent_id": null,
  "name_ar": "إلكترونيات",
  "name_en": "Electronics",
  "is_active": true
}
```

### GET /api/v1/categories

List categories as tree.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `type` | string | Filter by type |
| `is_active` | boolean | Filter by active status |
| `flat` | boolean | Return flat list instead of tree (default: false) |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "name_ar": "المنتجات المالية",
      "name_en": "Financial Products",
      "type": "FINANCIAL",
      "is_active": true,
      "children": [
        {"id": 2, "name_ar": "قروض", "name_en": "Loans", "children": []}
      ]
    }
  ]
}
```

### GET /api/v1/categories/{id}

Get a single category with its children and parent chain.

**Response:** `200 OK`
```json
{
  "id": 2,
  "parent_id": 1,
  "name_ar": "قروض",
  "name_en": "Loans",
  "type": "FINANCIAL",
  "is_active": true,
  "default_policies": {
    "channels": ["WEB", "MOBILE", "BRANCH"],
    "tax_rate": 0.00
  },
  "parent": {
    "id": 1,
    "name_ar": "المنتجات المالية",
    "name_en": "Financial Products"
  },
  "children": [],
  "product_count": 12,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-15T10:00:00Z"
}
```

### PUT /api/v1/categories/{id}

Update a category.

### DELETE /api/v1/categories/{id}

Disable a category (BR-09: cannot delete if active products exist).

**Response:** `200 OK` or `409 CONFLICT` if active products exist.

---

## 7. Attributes

### POST /api/v1/attributes/definitions

Create an attribute definition.

**Request Body:**
```json
{
  "code": "COLOR",
  "label_ar": "اللون",
  "label_en": "Color",
  "datatype": "ENUM",
  "required": false,
  "validation": {"allowed": ["RED", "BLUE", "GREEN"]},
  "json_schema": null
}
```

**Response:** `201 Created`

### GET /api/v1/attributes/definitions

List attribute definitions with filters.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `datatype` | string | Filter by datatype: TEXT, NUMBER, DATE, BOOLEAN, ENUM, JSON |
| `required` | boolean | Filter by required flag |
| `search` | string | Search by code or label |
| `page` | integer | Page number (default: 1) |
| `size` | integer | Page size (default: 20, max: 100) |

### GET /api/v1/attributes/definitions/{id}

Get a single attribute definition.

**Response:** `200 OK`
```json
{
  "id": 1,
  "code": "COLOR",
  "label_ar": "اللون",
  "label_en": "Color",
  "datatype": "ENUM",
  "required": false,
  "validation": {"allowed": ["RED", "BLUE", "GREEN"]},
  "json_schema": null,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

### PUT /api/v1/attributes/definitions/{id}

Update an attribute definition.

**Request Body:**
```json
{
  "code": "COLOR",
  "label_ar": "اللون",
  "label_en": "Color",
  "datatype": "ENUM",
  "required": true,
  "validation": {"allowed": ["RED", "BLUE", "GREEN", "BLACK", "WHITE"]}
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "code": "COLOR",
  "label_ar": "اللون",
  "label_en": "Color",
  "datatype": "ENUM",
  "required": true,
  "validation": {"allowed": ["RED", "BLUE", "GREEN", "BLACK", "WHITE"]},
  "updated_at": "2026-02-09T12:00:00Z"
}
```

### DELETE /api/v1/attributes/definitions/{id}

Delete an attribute definition. Fails if the attribute is currently assigned to any attribute set.

**Response:** `204 No Content`

**Error Response:** `409 Conflict`
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Cannot delete attribute definition in use",
    "details": [
      {
        "field": "attribute_id",
        "reason": "Attribute 1 is assigned to 2 attribute sets"
      }
    ],
    "request_id": "req-attr-123"
  }
}
```

### POST /api/v1/attributes/sets

Create an attribute set.

**Request Body:**
```json
{
  "name": "Electronics Attributes",
  "description": "Common attributes for electronics",
  "attributes": [
    {"attribute_id": 1, "sort_order": 0},
    {"attribute_id": 2, "sort_order": 1}
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": 10,
  "name": "Electronics Attributes",
  "description": "Common attributes for electronics",
  "attributes": [
    {"attribute_id": 1, "sort_order": 0},
    {"attribute_id": 2, "sort_order": 1}
  ],
  "created_at": "2026-02-09T12:00:00Z"
}
```

### GET /api/v1/attributes/sets

List attribute sets.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `search` | string | Search by name or description |
| `page` | integer | Page number (default: 1) |
| `size` | integer | Page size (default: 20, max: 100) |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 10,
      "name": "Electronics Attributes",
      "description": "Common attributes for electronics",
      "attribute_count": 2,
      "created_at": "2026-02-09T12:00:00Z"
    }
  ],
  "total": 8,
  "page": 1,
  "size": 20
}
```

### GET /api/v1/attributes/sets/{id}

Get a single attribute set with its attribute definitions.

**Response:** `200 OK`
```json
{
  "id": 10,
  "name": "Electronics Attributes",
  "description": "Common attributes for electronics",
  "attributes": [
    {
      "attribute_id": 1,
      "sort_order": 0,
      "definition": {
        "code": "COLOR",
        "label_ar": "اللون",
        "label_en": "Color",
        "datatype": "ENUM",
        "required": false
      }
    },
    {
      "attribute_id": 2,
      "sort_order": 1,
      "definition": {
        "code": "STORAGE_GB",
        "label_ar": "سعة التخزين",
        "label_en": "Storage (GB)",
        "datatype": "NUMBER",
        "required": true
      }
    }
  ],
  "created_at": "2026-02-09T12:00:00Z",
  "updated_at": "2026-02-09T12:00:00Z"
}
```

### PUT /api/v1/attributes/sets/{id}

Update an attribute set.

**Request Body:**
```json
{
  "name": "Electronics Attributes V2",
  "description": "Updated attributes for electronics",
  "attributes": [
    {"attribute_id": 1, "sort_order": 0},
    {"attribute_id": 2, "sort_order": 1},
    {"attribute_id": 5, "sort_order": 2}
  ]
}
```

**Response:** `200 OK`
```json
{
  "id": 10,
  "name": "Electronics Attributes V2",
  "description": "Updated attributes for electronics",
  "attributes": [
    {"attribute_id": 1, "sort_order": 0},
    {"attribute_id": 2, "sort_order": 1},
    {"attribute_id": 5, "sort_order": 2}
  ],
  "updated_at": "2026-02-09T14:00:00Z"
}
```

### DELETE /api/v1/attributes/sets/{id}

Delete an attribute set. Fails if the set is currently linked to any product.

**Response:** `204 No Content`

**Error Response:** `409 Conflict`
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Cannot delete attribute set in use",
    "details": [
      {
        "field": "attribute_set_id",
        "reason": "Attribute set 10 is linked to 5 products"
      }
    ],
    "request_id": "req-attrset-456"
  }
}
```

### PUT /api/v1/products/{id}/attributes

Set attribute values for a product.

**Request Body:**
```json
{
  "values": [
    {"attribute_id": 1, "value_text": "RED"},
    {"attribute_id": 2, "value_number": 256}
  ]
}
```

**Response:** `200 OK`

---

## 8. Channels

### GET /api/v1/channels

List all available channels.

**Response:** `200 OK`
```json
{
  "data": [
    {"id": 1, "code": "WEB", "name_ar": "الويب", "name_en": "Web"},
    {"id": 2, "code": "MOBILE", "name_ar": "الجوال", "name_en": "Mobile App"},
    {"id": 3, "code": "POS", "name_ar": "نقطة البيع", "name_en": "Point of Sale"},
    {"id": 4, "code": "API", "name_ar": "واجهة برمجية", "name_en": "API Integration"},
    {"id": 5, "code": "USSD", "name_ar": "خدمة USSD", "name_en": "USSD Service"},
    {"id": 6, "code": "IVR", "name_ar": "الرد الصوتي", "name_en": "IVR"}
  ]
}
```

### POST /api/v1/channels

Create a new channel.

**Request Body:**
```json
{
  "code": "KIOSK",
  "name_ar": "كشك الخدمة الذاتية",
  "name_en": "Self-Service Kiosk"
}
```

**Response:** `201 Created`
```json
{
  "id": 7,
  "code": "KIOSK",
  "name_ar": "كشك الخدمة الذاتية",
  "name_en": "Self-Service Kiosk",
  "created_at": "2026-02-09T12:00:00Z"
}
```

### PUT /api/v1/channels/{id}

Update a channel.

**Request Body:**
```json
{
  "code": "KIOSK",
  "name_ar": "كشك الخدمة الذاتية - محدث",
  "name_en": "Self-Service Kiosk (Updated)"
}
```

**Response:** `200 OK`
```json
{
  "id": 7,
  "code": "KIOSK",
  "name_ar": "كشك الخدمة الذاتية - محدث",
  "name_en": "Self-Service Kiosk (Updated)",
  "updated_at": "2026-02-09T14:00:00Z"
}
```

### DELETE /api/v1/channels/{id}

Delete a channel. Fails if the channel is currently linked to active products.

**Response:** `204 No Content`

**Error Response:** `409 Conflict`
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Cannot delete channel linked to active products",
    "details": [
      {
        "field": "channel_id",
        "reason": "Channel 7 is linked to 3 active products"
      }
    ],
    "request_id": "req-ch-789"
  }
}
```

### PUT /api/v1/products/{id}/channels

Configure product channels.

**Request Body:**
```json
{
  "channels": [
    {
      "channel_id": 1,
      "enabled": true,
      "limits": {"max_qty": 100, "max_price": 50000},
      "display": {"show_price": true, "show_stock": true},
      "feature_flags": {"new_ui": true}
    }
  ]
}
```

**Response:** `200 OK`

---

## 9. Charges

### POST /api/v1/charges

Create a charge/fee/penalty definition.

**Request Body:**
```json
{
  "code": "LATE_FEE",
  "name": "غرامة تأخير",
  "kind": "FINE",
  "basis": "PERCENT",
  "value": 2.5,
  "per": "MONTH",
  "when_event": "OnLate",
  "params": {"grace_days": 7, "max_amount": 10000}
}
```

**Response:** `201 Created`

### GET /api/v1/charges

List charges with filters.

| Param | Type | Description |
|---|---|---|
| `kind` | string | FEE, FINE, SUBSCRIPTION, COMMISSION |
| `page` | integer | Page number |
| `size` | integer | Page size |

### GET /api/v1/charges/{id}

Get a single charge/fee/penalty definition.

**Response:** `200 OK`
```json
{
  "id": 1,
  "code": "LATE_FEE",
  "name": "غرامة تأخير",
  "kind": "FINE",
  "basis": "PERCENT",
  "value": 2.5,
  "per": "MONTH",
  "when_event": "OnLate",
  "params": {"grace_days": 7, "max_amount": 10000},
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

### PUT /api/v1/charges/{id}

Update a charge/fee/penalty definition.

**Request Body:**
```json
{
  "code": "LATE_FEE",
  "name": "غرامة تأخير - محدثة",
  "kind": "FINE",
  "basis": "PERCENT",
  "value": 3.0,
  "per": "MONTH",
  "when_event": "OnLate",
  "params": {"grace_days": 5, "max_amount": 15000}
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "code": "LATE_FEE",
  "name": "غرامة تأخير - محدثة",
  "kind": "FINE",
  "basis": "PERCENT",
  "value": 3.0,
  "per": "MONTH",
  "when_event": "OnLate",
  "params": {"grace_days": 5, "max_amount": 15000},
  "updated_at": "2026-02-09T12:00:00Z"
}
```

### DELETE /api/v1/charges/{id}

Delete a charge definition. Fails if the charge is currently linked to any product.

**Response:** `204 No Content`

**Error Response:** `409 Conflict`
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Cannot delete charge linked to products",
    "details": [
      {
        "field": "charge_id",
        "reason": "Charge 1 is linked to 4 products"
      }
    ],
    "request_id": "req-chg-101"
  }
}
```

---

## 10. Customers

### POST /api/v1/customers

Create a customer.

**Request Body:**
```json
{
  "code": "CUST-001",
  "name_ar": "أحمد محمد",
  "name_en": "Ahmed Mohammed",
  "kyc_level": "BASIC",
  "score": 650.00,
  "phone": "+967771234567",
  "email": "ahmed@example.com"
}
```

**Response:** `201 Created`
```json
{
  "id": 200,
  "code": "CUST-001",
  "kyc_level": "BASIC",
  "created_at": "2026-02-09T12:00:00Z"
}
```

### GET /api/v1/customers

List customers with filters.

| Param | Type | Description |
|---|---|---|
| `kyc_level` | string | NONE, BASIC, FULL |
| `search` | string | Search by name or code |
| `page` | integer | Page number |
| `size` | integer | Page size |

### GET /api/v1/customers/{id}

Get customer details.

### PUT /api/v1/customers/{id}

Update customer information.

### DELETE /api/v1/customers/{id}

Soft delete (deactivate) a customer. The customer record is retained for audit and compliance purposes but marked as inactive. Active contracts or reservations will block deactivation.

**Response:** `200 OK`
```json
{
  "id": 200,
  "code": "CUST-001",
  "name_en": "Ahmed Mohammed",
  "is_active": false,
  "deactivated_at": "2026-02-09T12:00:00Z"
}
```

**Error Response:** `409 Conflict`
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Cannot deactivate customer with active obligations",
    "details": [
      {
        "field": "customer_id",
        "reason": "Customer 200 has 2 active contracts and 1 confirmed reservation"
      }
    ],
    "request_id": "req-cust-del-200"
  }
}
```

---

## 11. Audit

### GET /api/v1/audit/logs

Query audit logs.

| Param | Type | Description |
|---|---|---|
| `entity_type` | string | product, contract, reservation, etc. |
| `entity_id` | integer | Specific entity ID |
| `action` | string | CREATE, UPDATE, DELETE, STATE_CHANGE |
| `from` | datetime | Start date |
| `to` | datetime | End date |
| `user_id` | string | Filter by user |
| `page` | integer | Page number |
| `size` | integer | Page size |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 5001,
      "entity_type": "contract",
      "entity_id": 1001,
      "action": "STATE_CHANGE",
      "old_data": {"status": "DRAFT"},
      "new_data": {"status": "ACTIVE"},
      "user_id": "user-123",
      "ip": "192.168.1.10",
      "created_at": "2026-02-09T14:30:00Z"
    }
  ],
  "total": 250,
  "page": 1,
  "size": 20
}
```

### GET /api/v1/audit/state-transitions

Query state transitions for an entity.

### GET /api/v1/audit/events

Query domain events (Event Sourcing).

---

## 12. Accounting

### POST /api/v1/accounting/templates

Create an accounting template that defines debit/credit entries for a specific event type.

**Required Headers:**

| Header | Required | Description |
|---|---|---|
| `Authorization` | Yes | `Bearer <token>` |
| `X-Tenant-ID` | Yes | Tenant identifier |
| `X-Idempotency-Key` | Yes | Unique key to prevent duplicate creation |

**Request Body:**
```json
{
  "tenant_id": 1,
  "name": "قالب محاسبة المبيعات",
  "event": "SALE",
  "entries": [
    {
      "dr": "1201-ACCOUNTS_RECEIVABLE",
      "cr": "4101-SALES_REVENUE",
      "description": "Revenue recognition on sale"
    },
    {
      "dr": "5101-COST_OF_GOODS_SOLD",
      "cr": "1301-INVENTORY",
      "description": "Cost of goods sold"
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "tenant_id": 1,
  "name": "قالب محاسبة المبيعات",
  "event": "SALE",
  "entries": [
    {
      "seq": 1,
      "dr": "1201-ACCOUNTS_RECEIVABLE",
      "cr": "4101-SALES_REVENUE",
      "description": "Revenue recognition on sale"
    },
    {
      "seq": 2,
      "dr": "5101-COST_OF_GOODS_SOLD",
      "cr": "1301-INVENTORY",
      "description": "Cost of goods sold"
    }
  ],
  "created_at": "2026-02-09T12:00:00Z"
}
```

**Supported Event Types:**

| Event | Description |
|---|---|
| `SALE` | Product sale transaction |
| `RETURN` | Product return/refund |
| `DISBURSEMENT` | Loan disbursement |
| `PRINCIPAL_PAYMENT` | Principal portion of payment |
| `INTEREST_PAYMENT` | Interest portion of payment |
| `FEE_COLLECTION` | Fee/charge collection |
| `LATE_PENALTY` | Late payment penalty |
| `WRITE_OFF` | Bad debt write-off |

### GET /api/v1/accounting/templates

List accounting templates with filters.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `event` | string | Filter by event type (e.g., SALE, DISBURSEMENT) |
| `search` | string | Search by template name |
| `page` | integer | Page number (default: 1) |
| `size` | integer | Page size (default: 20, max: 100) |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "name": "قالب محاسبة المبيعات",
      "event": "SALE",
      "entry_count": 2,
      "created_at": "2026-02-09T12:00:00Z"
    },
    {
      "id": 2,
      "name": "قالب صرف القرض",
      "event": "DISBURSEMENT",
      "entry_count": 1,
      "created_at": "2026-02-09T12:00:00Z"
    }
  ],
  "total": 8,
  "page": 1,
  "size": 20
}
```

### GET /api/v1/accounting/templates/{id}

Get a single accounting template with its entries.

**Response:** `200 OK`
```json
{
  "id": 1,
  "tenant_id": 1,
  "name": "قالب محاسبة المبيعات",
  "event": "SALE",
  "entries": [
    {
      "seq": 1,
      "dr": "1201-ACCOUNTS_RECEIVABLE",
      "cr": "4101-SALES_REVENUE",
      "description": "Revenue recognition on sale"
    },
    {
      "seq": 2,
      "dr": "5101-COST_OF_GOODS_SOLD",
      "cr": "1301-INVENTORY",
      "description": "Cost of goods sold"
    }
  ],
  "created_at": "2026-02-09T12:00:00Z",
  "updated_at": "2026-02-09T12:00:00Z"
}
```

### PUT /api/v1/accounting/templates/{id}

Update an accounting template.

**Request Body:**
```json
{
  "name": "قالب محاسبة المبيعات - محدث",
  "event": "SALE",
  "entries": [
    {
      "dr": "1201-ACCOUNTS_RECEIVABLE",
      "cr": "4101-SALES_REVENUE",
      "description": "Revenue recognition on sale"
    },
    {
      "dr": "5101-COST_OF_GOODS_SOLD",
      "cr": "1301-INVENTORY",
      "description": "Cost of goods sold"
    },
    {
      "dr": "2201-TAX_PAYABLE",
      "cr": "1201-ACCOUNTS_RECEIVABLE",
      "description": "Sales tax liability"
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "tenant_id": 1,
  "name": "قالب محاسبة المبيعات - محدث",
  "event": "SALE",
  "entries": [
    {
      "seq": 1,
      "dr": "1201-ACCOUNTS_RECEIVABLE",
      "cr": "4101-SALES_REVENUE",
      "description": "Revenue recognition on sale"
    },
    {
      "seq": 2,
      "dr": "5101-COST_OF_GOODS_SOLD",
      "cr": "1301-INVENTORY",
      "description": "Cost of goods sold"
    },
    {
      "seq": 3,
      "dr": "2201-TAX_PAYABLE",
      "cr": "1201-ACCOUNTS_RECEIVABLE",
      "description": "Sales tax liability"
    }
  ],
  "updated_at": "2026-02-09T14:00:00Z"
}
```

### POST /api/v1/accounting/product-mappings

Map a product to an accounting template for a specific event type.

**Required Headers:**

| Header | Required | Description |
|---|---|---|
| `Authorization` | Yes | `Bearer <token>` |
| `X-Tenant-ID` | Yes | Tenant identifier |
| `X-Idempotency-Key` | Yes | Unique key to prevent duplicate mappings |

**Request Body:**
```json
{
  "product_id": 123,
  "template_id": 1,
  "event_type": "SALE"
}
```

**Response:** `201 Created`
```json
{
  "id": 50,
  "product_id": 123,
  "template_id": 1,
  "event_type": "SALE",
  "template_name": "قالب محاسبة المبيعات",
  "created_at": "2026-02-09T12:00:00Z"
}
```

**Error Response:** `409 Conflict`
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Product-event mapping already exists",
    "details": [
      {
        "field": "product_id",
        "reason": "Product 123 already has a SALE accounting template mapped"
      }
    ],
    "request_id": "req-map-123"
  }
}
```

### GET /api/v1/accounting/product-mappings

List product-accounting template mappings.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `product_id` | integer | Filter by product |
| `template_id` | integer | Filter by template |
| `event_type` | string | Filter by event type |
| `page` | integer | Page number (default: 1) |
| `size` | integer | Page size (default: 20, max: 100) |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 50,
      "product_id": 123,
      "product_name_en": "Test Product",
      "template_id": 1,
      "template_name": "قالب محاسبة المبيعات",
      "event_type": "SALE",
      "created_at": "2026-02-09T12:00:00Z"
    },
    {
      "id": 51,
      "product_id": 123,
      "product_name_en": "Test Product",
      "template_id": 3,
      "template_name": "قالب الإرجاع",
      "event_type": "RETURN",
      "created_at": "2026-02-09T12:00:00Z"
    }
  ],
  "total": 2,
  "page": 1,
  "size": 20
}
```

### GET /api/v1/subledger/entries

Query subledger entries with filters. Subledger entries are the individual debit/credit postings generated by financial events (payments, disbursements, penalties, etc.).

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `contract_id` | integer | Filter by contract |
| `event_type` | string | Filter by event type (e.g., PRINCIPAL_PAYMENT, INTEREST_PAYMENT, DISBURSEMENT, LATE_PENALTY, WRITE_OFF) |
| `from` | date | Start date (ISO 8601) |
| `to` | date | End date (ISO 8601) |
| `dr_account` | string | Filter by debit account code |
| `cr_account` | string | Filter by credit account code |
| `page` | integer | Page number (default: 1) |
| `size` | integer | Page size (default: 20, max: 100) |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 8001,
      "contract_id": 1001,
      "contract_number": "FIN-LOAN-2026-001234",
      "event_type": "PRINCIPAL_PAYMENT",
      "dr_account": "1001-CASH",
      "cr_account": "1201-LOAN_RECEIVABLE",
      "amount": 41666.67,
      "currency": "YER",
      "posted_at": "2026-02-01T10:00:00Z",
      "ref": "PAY-9001",
      "idempotency_key": "pay-1001-5001"
    },
    {
      "id": 8002,
      "contract_id": 1001,
      "contract_number": "FIN-LOAN-2026-001234",
      "event_type": "INTEREST_PAYMENT",
      "dr_account": "1001-CASH",
      "cr_account": "4101-INTEREST_INCOME",
      "amount": 8333.33,
      "currency": "YER",
      "posted_at": "2026-02-01T10:00:00Z",
      "ref": "PAY-9001",
      "idempotency_key": "pay-1001-5001-int"
    }
  ],
  "total": 24,
  "page": 1,
  "size": 20
}
```

---

## 13. Eligibility

### GET /api/v1/eligibility/rules

List CEL-based eligibility rules.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `page` | integer | Page number (default: 1) |
| `size` | integer | Page size (default: 20, max: 100) |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": 1,
      "name": "Minimum Credit Score",
      "condition_cel": "customer.score >= 600 && customer.kyc_level == 'FULL'",
      "params": {},
      "created_at": "2026-01-01T00:00:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "size": 20
}
```

### POST /api/v1/eligibility/rules

Create an eligibility rule.

### GET /api/v1/eligibility/rules/{id}

Get a single eligibility rule.

### PUT /api/v1/eligibility/rules/{id}

Update an eligibility rule.

### DELETE /api/v1/eligibility/rules/{id}

Delete an eligibility rule.

**Response:** `204 No Content`

### GET /api/v1/eligibility/documents

List document requirements.

| Param | Type | Description |
|---|---|---|
| `mandatory` | boolean | Filter by mandatory flag |
| `page` | integer | Page number |
| `size` | integer | Page size |

### POST /api/v1/eligibility/documents

Create a document requirement.

### GET /api/v1/eligibility/documents/{id}

Get a document requirement.

### PUT /api/v1/eligibility/documents/{id}

Update a document requirement.

### DELETE /api/v1/eligibility/documents/{id}

Delete a document requirement.

### GET /api/v1/eligibility/collaterals

List collateral requirements.

| Param | Type | Description |
|---|---|---|
| `type` | string | Filter by collateral type (REAL_ESTATE, VEHICLE, DEPOSIT) |
| `page` | integer | Page number |
| `size` | integer | Page size |

### POST /api/v1/eligibility/collaterals

Create a collateral requirement.

### GET /api/v1/eligibility/collaterals/{id}

Get a collateral requirement.

### PUT /api/v1/eligibility/collaterals/{id}

Update a collateral requirement.

### DELETE /api/v1/eligibility/collaterals/{id}

Delete a collateral requirement.

### GET /api/v1/products/{id}/eligibility

Get eligibility rules linked to a product.

### PUT /api/v1/products/{id}/eligibility

Set eligibility rules for a product.

### GET /api/v1/products/{id}/documents

Get document requirements linked to a product.

### PUT /api/v1/products/{id}/documents

Set document requirements for a product. BR-03: No installments before mandatory documents complete.

### GET /api/v1/products/{id}/collaterals

Get collateral requirements linked to a product.

### PUT /api/v1/products/{id}/collaterals

Set collateral requirements for a product.

---

## 14. Composition (BOM/Bundle/KIT)

### GET /api/v1/products/{id}/composition

List composition items for a product (BOM/Bundle/KIT).

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "parent_product_id": 10,
    "child_product_id": 45,
    "qty": 2,
    "policy": "EXPLODE",
    "price_ratio": 0.3
  }
]
```

### POST /api/v1/products/{id}/composition

Add a composition item.

**Request Body:**
```json
{
  "child_product_id": 45,
  "qty": 2,
  "policy": "EXPLODE",
  "price_ratio": 0.3
}
```

### PUT /api/v1/products/{id}/composition/{itemId}

Update a composition item.

### DELETE /api/v1/products/{id}/composition/{itemId}

Remove a composition item.

**Response:** `204 No Content`

---

## 15. Identifiers (LOT/Serial)

### GET /api/v1/products/{id}/identifiers

List product identifiers with optional type filter.

| Param | Type | Description |
|---|---|---|
| `id_type` | string | PRODUCT, INVENTORY, LOCATION, EXTERNAL, CONTRACT |
| `page` | integer | Page number |
| `size` | integer | Page size |

### GET /api/v1/products/{id}/identifiers/{identifierId}

Get a specific product identifier.

### POST /api/v1/products/{id}/identifiers

Generate a new product identifier from a numbering scheme.

**Request Body:**
```json
{
  "id_type": "INVENTORY",
  "scheme_id": 3,
  "context": {"warehouse": "WH-001"}
}
```

### DELETE /api/v1/products/{id}/identifiers/{identifierId}

Delete a product identifier.

**Response:** `204 No Content`

---

## 16. Schedule Templates (FR-110-112)

### GET /api/v1/schedules/templates

List schedule templates.

| Param | Type | Description |
|---|---|---|
| `task_type` | string | Filter by task type (INSTALLMENT, BILLING, AGING) |
| `is_active` | boolean | Filter by active status |
| `page` | integer | Page number |
| `size` | integer | Page size |

### GET /api/v1/schedules/templates/{id}

Get a schedule template.

### POST /api/v1/schedules/templates

Create a schedule template.

**Request Body:**
```json
{
  "name": "Monthly Installment Schedule",
  "task_type": "INSTALLMENT",
  "cron_expression": "0 0 1 * *",
  "params": {"reminder_days": 3},
  "is_active": true
}
```

### PUT /api/v1/schedules/templates/{id}

Update a schedule template.

### DELETE /api/v1/schedules/templates/{id}

Delete a schedule template.

**Response:** `204 No Content`

### PATCH /api/v1/schedules/templates/{id}/toggle-active

Toggle schedule template active/inactive status.

---

## 17. Pricing Rules

### GET /api/v1/pricing/price-lists/{id}/rules

List CEL-based pricing rules for a price list.

### POST /api/v1/pricing/price-lists/{id}/rules

Create a pricing rule.

**Request Body:**
```json
{
  "name": "Volume Discount",
  "cel_expression": "qty >= 10 ? price * 0.9 : price",
  "priority": 1,
  "is_active": true
}
```

### PUT /api/v1/pricing/price-lists/{id}/rules/{ruleId}

Update a pricing rule.

### DELETE /api/v1/pricing/price-lists/{id}/rules/{ruleId}

Delete a pricing rule.

**Response:** `204 No Content`

---

## 18. Additional Product Endpoints

### DELETE /api/v1/products/{id}

Delete a product (soft-delete).

**Response:** `204 No Content`

### GET /api/v1/products/{id}/attributes

Get attribute values for a product.

### GET /api/v1/products/{id}/versions/{versionNo}

Get a specific product version.

### GET /api/v1/products/{id}/versions/diff

Compare two product versions field-by-field (FR-141).

| Param | Type | Description |
|---|---|---|
| `from` | integer | Base version number |
| `to` | integer | Target version number |

**Response:** `200 OK`
```json
{
  "product_id": 123,
  "from_version": 1,
  "to_version": 2,
  "changes": [
    {
      "field": "data.description",
      "old_value": "Original description",
      "new_value": "Updated description"
    }
  ]
}
```

### PATCH /api/v1/categories/{id}/toggle-active

Toggle category active/inactive status.

BR-09: Cannot deactivate categories with active products. Returns 409 Conflict.

### GET /api/v1/categories/{id}/attribute-sets

Get attribute sets linked to a category (FR-002).

### POST /api/v1/categories/{id}/attribute-sets

Link an attribute set to a category.

**Request Body:**
```json
{
  "set_id": 10
}
```

### DELETE /api/v1/categories/{id}/attribute-sets/{setId}

Unlink an attribute set from a category.

### GET /api/v1/reservations/policies

List cancellation policies for reservations.

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
