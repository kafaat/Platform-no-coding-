-- ============================================================
-- Dynamic Product System — Database Schema (DDL)
-- Version: 2.0
-- Database: PostgreSQL 15+
-- Encoding: UTF-8
-- ============================================================

-- ============================================================
-- 1. TENANT & CUSTOMER (Multi-tenancy Foundation)
-- ============================================================

CREATE TABLE tenant (
  id         BIGSERIAL PRIMARY KEY,
  code       TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  settings   JSONB DEFAULT '{}',
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE tenant IS 'كيان المستأجر — Multi-tenancy root';

-- -----------------------------------------------------------

CREATE TABLE customer (
  id         BIGSERIAL PRIMARY KEY,
  tenant_id  BIGINT NOT NULL REFERENCES tenant(id),
  code       TEXT NOT NULL,
  name_ar    TEXT,
  name_en    TEXT,
  kyc_level  TEXT CHECK (kyc_level IN ('NONE','BASIC','FULL')),
  score      NUMERIC(5,2),
  phone      TEXT,
  email      TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, code)
);

CREATE INDEX idx_customer_tenant ON customer(tenant_id);

COMMENT ON TABLE customer IS 'العميل — مرجع للعقود والحجوزات';

-- ============================================================
-- 2. CATEGORIES (Self-referencing Tree)
-- ============================================================

CREATE TABLE product_category (
  id               BIGSERIAL PRIMARY KEY,
  tenant_id        BIGINT NOT NULL REFERENCES tenant(id),
  parent_id        BIGINT REFERENCES product_category(id),
  name_ar          TEXT NOT NULL,
  name_en          TEXT,
  type             TEXT NOT NULL,
  is_active        BOOLEAN DEFAULT true,
  default_policies JSONB DEFAULT '{}'
);

CREATE INDEX idx_category_parent ON product_category(parent_id);
CREATE INDEX idx_category_tenant ON product_category(tenant_id);

COMMENT ON TABLE product_category IS 'شجرة الفئات اللانهائية مع سياسات افتراضية';

-- ============================================================
-- 3. PRODUCT & VERSIONS
-- ============================================================

CREATE TABLE product (
  id             BIGSERIAL PRIMARY KEY,
  tenant_id      BIGINT NOT NULL REFERENCES tenant(id),
  category_id    BIGINT NOT NULL REFERENCES product_category(id),
  type           TEXT NOT NULL CHECK (type IN ('PHYSICAL','DIGITAL','SERVICE','RESERVATION','FINANCIAL')),
  name_ar        TEXT NOT NULL,
  name_en        TEXT,
  divisible      BOOLEAN DEFAULT false,
  lifecycle_from DATE,
  lifecycle_to   DATE,
  status         TEXT NOT NULL DEFAULT 'DRAFT'
                   CHECK (status IN ('DRAFT','ACTIVE','SUSPENDED','RETIRED')),
  payload        JSONB DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_product_tenant_status ON product(tenant_id, status);
CREATE INDEX idx_product_category      ON product(category_id);
CREATE INDEX idx_product_type          ON product(type);

COMMENT ON TABLE product IS 'المنتج الأساسي — خمسة أنواع';

-- -----------------------------------------------------------

CREATE TABLE product_version (
  id             BIGSERIAL PRIMARY KEY,
  product_id     BIGINT NOT NULL REFERENCES product(id),
  version_no     INT NOT NULL,
  effective_from DATE NOT NULL,
  effective_to   DATE,
  data           JSONB DEFAULT '{}',
  approved_by    TEXT,
  approved_at    TIMESTAMPTZ,
  UNIQUE(product_id, version_no),
  CHECK (effective_to IS NULL OR effective_to > effective_from)
);

COMMENT ON TABLE product_version IS 'إصدارات المنتج مع تواريخ فعالية — يُمنع التداخل عبر Trigger';

-- ============================================================
-- 4. ATTRIBUTES (EAV Pattern)
-- ============================================================

CREATE TABLE attribute_definition (
  id          BIGSERIAL PRIMARY KEY,
  tenant_id   BIGINT NOT NULL REFERENCES tenant(id),
  code        TEXT NOT NULL,
  label_ar    TEXT,
  label_en    TEXT,
  datatype    TEXT NOT NULL CHECK (datatype IN ('STRING','NUMBER','DATE','BOOL','ENUM','JSON')),
  required    BOOLEAN DEFAULT false,
  validation  JSONB DEFAULT '{}',
  json_schema JSONB,
  UNIQUE(tenant_id, code)
);

COMMENT ON TABLE attribute_definition IS 'تعريف السمة الديناميكية';

-- -----------------------------------------------------------

CREATE TABLE attribute_set (
  id          BIGSERIAL PRIMARY KEY,
  tenant_id   BIGINT NOT NULL REFERENCES tenant(id),
  name        TEXT NOT NULL,
  description TEXT
);

COMMENT ON TABLE attribute_set IS 'مجموعة سمات قابلة للربط بالفئات والمنتجات';

-- -----------------------------------------------------------

CREATE TABLE attribute_set_item (
  id           BIGSERIAL PRIMARY KEY,
  set_id       BIGINT NOT NULL REFERENCES attribute_set(id),
  attribute_id BIGINT NOT NULL REFERENCES attribute_definition(id),
  sort_order   INT DEFAULT 0,
  UNIQUE(set_id, attribute_id)
);

-- -----------------------------------------------------------

CREATE TABLE category_attribute_set (
  id          BIGSERIAL PRIMARY KEY,
  category_id BIGINT NOT NULL REFERENCES product_category(id),
  set_id      BIGINT NOT NULL REFERENCES attribute_set(id),
  UNIQUE(category_id, set_id)
);

COMMENT ON TABLE category_attribute_set IS 'ربط مجموعة سمات بفئة';

-- -----------------------------------------------------------

CREATE TABLE product_attribute_set (
  id         BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES product(id),
  set_id     BIGINT NOT NULL REFERENCES attribute_set(id),
  UNIQUE(product_id, set_id)
);

COMMENT ON TABLE product_attribute_set IS 'ربط مجموعة سمات بمنتج (تجاوز الفئة)';

-- -----------------------------------------------------------

CREATE TABLE attribute_value (
  id           BIGSERIAL PRIMARY KEY,
  product_id   BIGINT NOT NULL REFERENCES product(id),
  attribute_id BIGINT NOT NULL REFERENCES attribute_definition(id),
  value_text   TEXT,
  value_number NUMERIC(18,4),
  value_date   DATE,
  value_bool   BOOLEAN,
  value_json   JSONB,
  UNIQUE(product_id, attribute_id)
);

CREATE INDEX idx_attr_val_product ON attribute_value(product_id);
CREATE INDEX idx_attr_val_json    ON attribute_value USING GIN(value_json);

COMMENT ON TABLE attribute_value IS 'قيم السمات — EAV مع أعمدة مفصّلة حسب النوع';

-- ============================================================
-- 5. UNITS OF MEASURE & COMPOSITION
-- ============================================================

CREATE TABLE uom (
  code    TEXT PRIMARY KEY,
  name_ar TEXT,
  name_en TEXT
);

COMMENT ON TABLE uom IS 'وحدات القياس';

-- -----------------------------------------------------------

CREATE TABLE uom_conversion (
  id        BIGSERIAL PRIMARY KEY,
  from_code TEXT NOT NULL REFERENCES uom(code),
  to_code   TEXT NOT NULL REFERENCES uom(code),
  factor    NUMERIC(18,8) NOT NULL CHECK (factor > 0),
  UNIQUE(from_code, to_code)
);

-- -----------------------------------------------------------

CREATE TABLE product_unit (
  id         BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES product(id),
  uom_code   TEXT NOT NULL REFERENCES uom(code),
  is_base    BOOLEAN DEFAULT false,
  min_qty    NUMERIC(18,4),
  max_qty    NUMERIC(18,4)
);

-- -----------------------------------------------------------

CREATE TABLE product_composition (
  id                BIGSERIAL PRIMARY KEY,
  parent_product_id BIGINT NOT NULL REFERENCES product(id),
  child_product_id  BIGINT NOT NULL REFERENCES product(id),
  qty               NUMERIC(18,4) NOT NULL CHECK (qty > 0),
  policy            TEXT NOT NULL CHECK (policy IN ('EXPLODE','NO_EXPLODE')),
  price_ratio       NUMERIC(5,4) DEFAULT 0,
  CHECK (parent_product_id != child_product_id)
);

COMMENT ON TABLE product_composition IS 'التركيب BOM/Bundle/KIT';

-- ============================================================
-- 6. NUMBERING & IDENTIFIERS
-- ============================================================

CREATE TABLE numbering_scheme (
  id         BIGSERIAL PRIMARY KEY,
  tenant_id  BIGINT NOT NULL REFERENCES tenant(id),
  code       TEXT NOT NULL,
  pattern    TEXT NOT NULL,
  context    JSONB DEFAULT '{}',
  gap_policy TEXT DEFAULT 'ALLOW' CHECK (gap_policy IN ('ALLOW','DENY','REUSE')),
  UNIQUE(tenant_id, code)
);

COMMENT ON TABLE numbering_scheme IS 'مخطط الترقيم — مقاطع ثابتة/تاريخ/فرع/سلسلة';

-- -----------------------------------------------------------

CREATE TABLE numbering_sequence (
  id             BIGSERIAL PRIMARY KEY,
  scheme_id      BIGINT NOT NULL REFERENCES numbering_scheme(id),
  branch_code    TEXT,
  channel_code   TEXT,
  current_value  BIGINT NOT NULL DEFAULT 0,
  reserved_until TIMESTAMPTZ,
  UNIQUE(scheme_id, branch_code, channel_code)
);

COMMENT ON TABLE numbering_sequence IS 'مخزن تسلسل مستقل لكل فرع/قناة — Atomic Increment';

-- -----------------------------------------------------------

CREATE TABLE product_identifier (
  id         BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES product(id),
  id_type    TEXT NOT NULL CHECK (id_type IN ('PRODUCT','INVENTORY','LOCATION','EXTERNAL','CONTRACT')),
  identifier TEXT NOT NULL,
  scheme_id  BIGINT REFERENCES numbering_scheme(id),
  UNIQUE(product_id, id_type, identifier)
);

-- ============================================================
-- 7. PRICING
-- ============================================================

CREATE TABLE price_list (
  id         BIGSERIAL PRIMARY KEY,
  tenant_id  BIGINT NOT NULL REFERENCES tenant(id),
  name       TEXT NOT NULL,
  currency   TEXT NOT NULL DEFAULT 'YER',
  valid_from DATE NOT NULL,
  valid_to   DATE,
  CHECK (valid_to IS NULL OR valid_to > valid_from)
);

COMMENT ON TABLE price_list IS 'قائمة أسعار متعددة العملات والفترات';

-- -----------------------------------------------------------

CREATE TABLE price_list_product (
  id            BIGSERIAL PRIMARY KEY,
  price_list_id BIGINT NOT NULL REFERENCES price_list(id),
  product_id    BIGINT NOT NULL REFERENCES product(id),
  base_price    NUMERIC(18,2) NOT NULL CHECK (base_price >= 0),
  min_price     NUMERIC(18,2),
  max_price     NUMERIC(18,2),
  UNIQUE(price_list_id, product_id)
);

-- -----------------------------------------------------------

CREATE TABLE price_rule (
  id            BIGSERIAL PRIMARY KEY,
  price_list_id BIGINT NOT NULL REFERENCES price_list(id),
  condition_cel TEXT NOT NULL,
  formula_cel   TEXT NOT NULL,
  priority      INT DEFAULT 0
);

COMMENT ON TABLE price_rule IS 'قاعدة تسعير بمحرك CEL — شروط ومعادلات';

-- ============================================================
-- 8. CHANNELS
-- ============================================================

CREATE TABLE channel (
  id      BIGSERIAL PRIMARY KEY,
  code    TEXT NOT NULL UNIQUE,
  name_ar TEXT,
  name_en TEXT
);

COMMENT ON TABLE channel IS 'القنوات: Web/Mobile/POS/API/USSD/IVR';

-- -----------------------------------------------------------

CREATE TABLE product_channel (
  id            BIGSERIAL PRIMARY KEY,
  product_id    BIGINT NOT NULL REFERENCES product(id),
  channel_id    BIGINT NOT NULL REFERENCES channel(id),
  enabled       BOOLEAN DEFAULT true,
  limits        JSONB DEFAULT '{}',
  display       JSONB DEFAULT '{}',
  feature_flags JSONB DEFAULT '{}',
  UNIQUE(product_id, channel_id)
);

-- ============================================================
-- 9. CHARGES, FEES & PENALTIES
-- ============================================================

CREATE TABLE charge (
  id         BIGSERIAL PRIMARY KEY,
  tenant_id  BIGINT NOT NULL REFERENCES tenant(id),
  code       TEXT NOT NULL,
  name       TEXT NOT NULL,
  kind       TEXT NOT NULL CHECK (kind IN ('FEE','FINE','SUBSCRIPTION','COMMISSION')),
  basis      TEXT NOT NULL,
  value      NUMERIC(18,4) NOT NULL,
  per        TEXT,
  when_event TEXT,
  params     JSONB DEFAULT '{}',
  UNIQUE(tenant_id, code)
);

COMMENT ON TABLE charge IS 'رسم/غرامة/اشتراك/عمولة';

-- -----------------------------------------------------------

CREATE TABLE product_charge_link (
  id              BIGSERIAL PRIMARY KEY,
  product_id      BIGINT NOT NULL REFERENCES product(id),
  charge_id       BIGINT NOT NULL REFERENCES charge(id),
  override_params JSONB DEFAULT '{}',
  UNIQUE(product_id, charge_id)
);

-- ============================================================
-- 10. ACCOUNTING
-- ============================================================

CREATE TABLE accounting_template (
  id        BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenant(id),
  name      TEXT NOT NULL,
  event     TEXT NOT NULL,
  entries   JSONB NOT NULL DEFAULT '[]'
);

COMMENT ON TABLE accounting_template IS 'قالب قيود محاسبية حسب الحدث';

-- -----------------------------------------------------------

CREATE TABLE product_accounting_map (
  id          BIGSERIAL PRIMARY KEY,
  product_id  BIGINT NOT NULL REFERENCES product(id),
  template_id BIGINT NOT NULL REFERENCES accounting_template(id),
  event_type  TEXT NOT NULL,
  UNIQUE(product_id, event_type)
);

-- ============================================================
-- 11. ELIGIBILITY, DOCUMENTS & COLLATERAL
-- ============================================================

CREATE TABLE eligibility_rule (
  id            BIGSERIAL PRIMARY KEY,
  tenant_id     BIGINT NOT NULL REFERENCES tenant(id),
  name          TEXT NOT NULL,
  condition_cel TEXT NOT NULL,
  params        JSONB DEFAULT '{}'
);

COMMENT ON TABLE eligibility_rule IS 'قاعدة أهلية بمحرك CEL';

-- -----------------------------------------------------------

CREATE TABLE document_requirement (
  id        BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenant(id),
  code      TEXT NOT NULL,
  name      TEXT NOT NULL,
  params    JSONB DEFAULT '{}',
  UNIQUE(tenant_id, code)
);

-- -----------------------------------------------------------

CREATE TABLE collateral_requirement (
  id             BIGSERIAL PRIMARY KEY,
  tenant_id      BIGINT NOT NULL REFERENCES tenant(id),
  type           TEXT NOT NULL,
  coverage_ratio NUMERIC(5,4) NOT NULL CHECK (coverage_ratio > 0),
  params         JSONB DEFAULT '{}'
);

-- -----------------------------------------------------------

CREATE TABLE product_eligibility_link (
  id         BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES product(id),
  rule_id    BIGINT NOT NULL REFERENCES eligibility_rule(id),
  UNIQUE(product_id, rule_id)
);

-- -----------------------------------------------------------

CREATE TABLE product_document_link (
  id           BIGSERIAL PRIMARY KEY,
  product_id   BIGINT NOT NULL REFERENCES product(id),
  doc_id       BIGINT NOT NULL REFERENCES document_requirement(id),
  is_mandatory BOOLEAN DEFAULT true,
  UNIQUE(product_id, doc_id)
);

-- -----------------------------------------------------------

CREATE TABLE product_collateral_link (
  id            BIGSERIAL PRIMARY KEY,
  product_id    BIGINT NOT NULL REFERENCES product(id),
  collateral_id BIGINT NOT NULL REFERENCES collateral_requirement(id),
  UNIQUE(product_id, collateral_id)
);

-- ============================================================
-- 12. SCHEDULE TEMPLATES
-- ============================================================

CREATE TABLE schedule_template (
  id        BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenant(id),
  name      TEXT NOT NULL,
  payload   JSONB NOT NULL DEFAULT '{}'
);

COMMENT ON TABLE schedule_template IS 'قالب جدول أقساط/مطالبات';

-- ============================================================
-- 13. CONTRACTS (Financial)
-- ============================================================

CREATE TABLE contract (
  id              BIGSERIAL PRIMARY KEY,
  tenant_id       BIGINT NOT NULL REFERENCES tenant(id),
  product_id      BIGINT NOT NULL REFERENCES product(id),
  customer_id     BIGINT NOT NULL REFERENCES customer(id),
  contract_number TEXT UNIQUE,
  status          TEXT NOT NULL DEFAULT 'DRAFT'
                    CHECK (status IN ('DRAFT','ACTIVE','IN_ARREARS','RESTRUCTURED','WRITTEN_OFF','CLOSED')),
  opened_at       TIMESTAMPTZ,
  closed_at       TIMESTAMPTZ,
  currency        TEXT NOT NULL DEFAULT 'YER',
  principal       NUMERIC(18,2) NOT NULL CHECK (principal > 0),
  interest_type   TEXT CHECK (interest_type IN ('FLAT','REDUCING','FIXED_AMOUNT')),
  day_count       TEXT DEFAULT '30E/360'
                    CHECK (day_count IN ('30E/360','ACT/365','ACT/360')),
  meta            JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_contract_tenant_status ON contract(tenant_id, status);
CREATE INDEX idx_contract_customer      ON contract(customer_id);

COMMENT ON TABLE contract IS 'العقد المالي — قرض/ائتمان/سقف';

-- ============================================================
-- 14. INSTALLMENTS
-- ============================================================

CREATE TABLE installment (
  id             BIGSERIAL PRIMARY KEY,
  contract_id    BIGINT NOT NULL REFERENCES contract(id),
  seq            INT NOT NULL,
  due_on         DATE NOT NULL,
  principal_due  NUMERIC(18,2) DEFAULT 0,
  interest_due   NUMERIC(18,2) DEFAULT 0,
  fee_due        NUMERIC(18,2) DEFAULT 0,
  paid_principal NUMERIC(18,2) DEFAULT 0,
  paid_interest  NUMERIC(18,2) DEFAULT 0,
  paid_fee       NUMERIC(18,2) DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'DUE'
                   CHECK (status IN ('DUE','PAID','PARTIAL','LATE','WAIVED')),
  UNIQUE(contract_id, seq)
);

CREATE INDEX idx_installment_due ON installment(due_on, status);

COMMENT ON TABLE installment IS 'أقساط العقد المالي';

-- ============================================================
-- 15. PAYMENT EVENTS
-- ============================================================

CREATE TABLE payment_event (
  id               BIGSERIAL PRIMARY KEY,
  contract_id      BIGINT NOT NULL REFERENCES contract(id),
  installment_id   BIGINT REFERENCES installment(id),
  paid_on          TIMESTAMPTZ NOT NULL,
  amount_principal NUMERIC(18,2) DEFAULT 0,
  amount_interest  NUMERIC(18,2) DEFAULT 0,
  amount_fee       NUMERIC(18,2) DEFAULT 0,
  channel          TEXT,
  idempotency_key  TEXT UNIQUE NOT NULL
);

COMMENT ON TABLE payment_event IS 'أحداث الدفع مع Idempotency Key';

-- ============================================================
-- 16. PENALTY EVENTS
-- ============================================================

CREATE TABLE penalty_event (
  id             BIGSERIAL PRIMARY KEY,
  contract_id    BIGINT NOT NULL REFERENCES contract(id),
  installment_id BIGINT REFERENCES installment(id),
  kind           TEXT NOT NULL,
  amount         NUMERIC(18,2) NOT NULL,
  aging_bucket   TEXT CHECK (aging_bucket IN ('30','60','90','180','180+')),
  created_at     TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE penalty_event IS 'أحداث الغرامات مع Aging Buckets';

-- ============================================================
-- 17. SUB-LEDGER ENTRIES
-- ============================================================

CREATE TABLE subledger_entry (
  id              BIGSERIAL PRIMARY KEY,
  contract_id     BIGINT NOT NULL REFERENCES contract(id),
  event_type      TEXT NOT NULL,
  dr_account      TEXT NOT NULL,
  cr_account      TEXT NOT NULL,
  amount          NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  posted_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  ref             TEXT,
  idempotency_key TEXT UNIQUE NOT NULL
);

CREATE INDEX idx_subledger_contract ON subledger_entry(contract_id, posted_at);

COMMENT ON TABLE subledger_entry IS 'قيود الدفتر الفرعي — IFRS 9';

-- ============================================================
-- 18. RESERVATIONS
-- ============================================================

CREATE TABLE cancellation_policy (
  id        BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenant(id),
  name      TEXT NOT NULL,
  rules     JSONB NOT NULL DEFAULT '[]'
);

COMMENT ON TABLE cancellation_policy IS 'سياسات الإلغاء والغرامات';

-- -----------------------------------------------------------

CREATE TABLE reservation (
  id                     BIGSERIAL PRIMARY KEY,
  tenant_id              BIGINT NOT NULL REFERENCES tenant(id),
  product_id             BIGINT NOT NULL REFERENCES product(id),
  customer_id            BIGINT NOT NULL REFERENCES customer(id),
  slot_from              TIMESTAMPTZ NOT NULL,
  slot_to                TIMESTAMPTZ NOT NULL,
  status                 TEXT NOT NULL DEFAULT 'HOLD'
                           CHECK (status IN ('HOLD','CONFIRMED','CANCELLED','EXPIRED','COMPLETED')),
  hold_until             TIMESTAMPTZ,
  deposit_amount         NUMERIC(18,2) DEFAULT 0,
  cancellation_policy_id BIGINT REFERENCES cancellation_policy(id),
  created_at             TIMESTAMPTZ DEFAULT now(),
  CHECK (slot_to > slot_from)
);

CREATE INDEX idx_reservation_product_slot ON reservation(product_id, slot_from, slot_to);
CREATE INDEX idx_reservation_status       ON reservation(status);

COMMENT ON TABLE reservation IS 'الحجوزات — HOLD/CONFIRMED/CANCELLED/EXPIRED';

-- ============================================================
-- 19. AUDIT & EVENT SOURCING
-- ============================================================

CREATE TABLE audit_log (
  id          BIGSERIAL PRIMARY KEY,
  tenant_id   BIGINT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   BIGINT NOT NULL,
  action      TEXT NOT NULL CHECK (action IN ('CREATE','UPDATE','DELETE','STATE_CHANGE')),
  old_data    JSONB,
  new_data    JSONB,
  user_id     TEXT,
  ip          INET,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_entity      ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_tenant_time ON audit_log(tenant_id, created_at DESC);

COMMENT ON TABLE audit_log IS 'سجل تدقيق غير قابل للتعديل (immutable)';

-- -----------------------------------------------------------

CREATE TABLE state_transition (
  id           BIGSERIAL PRIMARY KEY,
  tenant_id    BIGINT NOT NULL,
  entity_type  TEXT NOT NULL,
  entity_id    BIGINT NOT NULL,
  from_state   TEXT NOT NULL,
  to_state     TEXT NOT NULL,
  triggered_by TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_state_entity ON state_transition(entity_type, entity_id);

COMMENT ON TABLE state_transition IS 'سجل انتقالات الحالة';

-- -----------------------------------------------------------

CREATE TABLE domain_event (
  id             BIGSERIAL PRIMARY KEY,
  tenant_id      BIGINT NOT NULL,
  aggregate_type TEXT NOT NULL,
  aggregate_id   BIGINT NOT NULL,
  event_type     TEXT NOT NULL,
  payload        JSONB NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_event_aggregate ON domain_event(aggregate_type, aggregate_id, created_at);

COMMENT ON TABLE domain_event IS 'أحداث النطاق — Event Sourcing للعقود المالية';

-- ============================================================
-- 19.5 SNAPSHOTS (Operational snapshots for audit/performance)
-- ============================================================

-- FR-063: Pricing snapshot at transaction time
CREATE TABLE pricing_snapshot (
  id              BIGSERIAL PRIMARY KEY,
  tenant_id       BIGINT NOT NULL REFERENCES tenant(id),
  product_id      BIGINT NOT NULL REFERENCES product(id),
  channel_code    TEXT,
  currency        TEXT NOT NULL,
  base_price      NUMERIC(18,2) NOT NULL,
  discount        NUMERIC(18,2) DEFAULT 0,
  tax             NUMERIC(18,2) DEFAULT 0,
  total           NUMERIC(18,2) NOT NULL,
  rules_applied   JSONB DEFAULT '[]',
  context_ref     TEXT,
  context_type    TEXT CHECK (context_type IN ('CONTRACT','RESERVATION','ORDER','INVOICE')),
  snapshot_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_pricing_snap_ref ON pricing_snapshot(context_type, context_ref);
CREATE INDEX idx_pricing_snap_product ON pricing_snapshot(product_id, snapshot_at);

COMMENT ON TABLE pricing_snapshot IS 'FR-063: لقطة تسعيرية وقت العملية للتدقيق';

-- -----------------------------------------------------------

-- FR-023: Attribute snapshot at transaction time
CREATE TABLE attribute_snapshot (
  id              BIGSERIAL PRIMARY KEY,
  tenant_id       BIGINT NOT NULL REFERENCES tenant(id),
  product_id      BIGINT NOT NULL REFERENCES product(id),
  attributes      JSONB NOT NULL,
  context_ref     TEXT,
  context_type    TEXT CHECK (context_type IN ('CONTRACT','RESERVATION','ORDER','INVOICE')),
  snapshot_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_attr_snap_ref ON attribute_snapshot(context_type, context_ref);

COMMENT ON TABLE attribute_snapshot IS 'FR-023: لقطة سمات المنتج وقت العملية للتدقيق';

-- ============================================================
-- 20. TRIGGERS (Business Rules)
-- ============================================================

-- BR-01: Prevent overlapping product versions
CREATE OR REPLACE FUNCTION fn_check_version_overlap()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM product_version
    WHERE product_id = NEW.product_id
      AND id != COALESCE(NEW.id, 0)
      AND effective_from < COALESCE(NEW.effective_to, '9999-12-31'::DATE)
      AND COALESCE(effective_to, '9999-12-31'::DATE) > NEW.effective_from
  ) THEN
    RAISE EXCEPTION 'Version date range overlaps with an existing version for product_id=%', NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_version_no_overlap
  BEFORE INSERT OR UPDATE ON product_version
  FOR EACH ROW EXECUTE FUNCTION fn_check_version_overlap();

COMMENT ON FUNCTION fn_check_version_overlap IS 'BR-01: منع تداخل فترات إصدارات المنتج';

-- Auto-update updated_at on product changes
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_product_updated_at
  BEFORE UPDATE ON product
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- BR-09: Prevent deleting categories with active products
CREATE OR REPLACE FUNCTION fn_prevent_category_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM product
    WHERE category_id = OLD.id
      AND status IN ('ACTIVE','SUSPENDED')
  ) THEN
    RAISE EXCEPTION 'Cannot delete category id=% — it has active products. Disable it instead.', OLD.id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_category_delete
  BEFORE DELETE ON product_category
  FOR EACH ROW EXECUTE FUNCTION fn_prevent_category_delete();

COMMENT ON FUNCTION fn_prevent_category_delete IS 'BR-09: منع حذف فئة تحتوي منتجات نشطة';

-- BR-10: Auto-expire HOLD reservations past TTL
-- Note: This function should be called periodically via pg_cron or application scheduler
CREATE OR REPLACE FUNCTION fn_expire_held_reservations()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE reservation
  SET status = 'EXPIRED'
  WHERE status = 'HOLD'
    AND hold_until IS NOT NULL
    AND hold_until < now();

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_expire_held_reservations IS 'BR-10: انتهاء الحجوزات المؤقتة بعد TTL — يُستدعى دورياً';

-- ============================================================
-- 21. ROW LEVEL SECURITY (Multi-tenancy)
-- ============================================================

-- Enable RLS on all tenant-scoped tables
ALTER TABLE customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE product ENABLE ROW LEVEL SECURITY;
ALTER TABLE attribute_definition ENABLE ROW LEVEL SECURITY;
ALTER TABLE attribute_set ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE charge ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_rule ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_requirement ENABLE ROW LEVEL SECURITY;
ALTER TABLE collateral_requirement ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation ENABLE ROW LEVEL SECURITY;
ALTER TABLE cancellation_policy ENABLE ROW LEVEL SECURITY;
ALTER TABLE numbering_scheme ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE state_transition ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE attribute_snapshot ENABLE ROW LEVEL SECURITY;

-- Create tenant isolation policies (FR-160, BR-12)
-- Uses app.current_tenant session variable set by the application layer
CREATE POLICY tenant_isolation ON customer
  USING (tenant_id = current_setting('app.current_tenant')::BIGINT);
CREATE POLICY tenant_isolation ON product_category
  USING (tenant_id = current_setting('app.current_tenant')::BIGINT);
CREATE POLICY tenant_isolation ON product
  USING (tenant_id = current_setting('app.current_tenant')::BIGINT);
CREATE POLICY tenant_isolation ON attribute_definition
  USING (tenant_id = current_setting('app.current_tenant')::BIGINT);
CREATE POLICY tenant_isolation ON attribute_set
  USING (tenant_id = current_setting('app.current_tenant')::BIGINT);
CREATE POLICY tenant_isolation ON price_list
  USING (tenant_id = current_setting('app.current_tenant')::BIGINT);
CREATE POLICY tenant_isolation ON charge
  USING (tenant_id = current_setting('app.current_tenant')::BIGINT);
CREATE POLICY tenant_isolation ON accounting_template
  USING (tenant_id = current_setting('app.current_tenant')::BIGINT);
CREATE POLICY tenant_isolation ON eligibility_rule
  USING (tenant_id = current_setting('app.current_tenant')::BIGINT);
CREATE POLICY tenant_isolation ON document_requirement
  USING (tenant_id = current_setting('app.current_tenant')::BIGINT);
CREATE POLICY tenant_isolation ON collateral_requirement
  USING (tenant_id = current_setting('app.current_tenant')::BIGINT);
CREATE POLICY tenant_isolation ON schedule_template
  USING (tenant_id = current_setting('app.current_tenant')::BIGINT);
CREATE POLICY tenant_isolation ON contract
  USING (tenant_id = current_setting('app.current_tenant')::BIGINT);
CREATE POLICY tenant_isolation ON reservation
  USING (tenant_id = current_setting('app.current_tenant')::BIGINT);
CREATE POLICY tenant_isolation ON cancellation_policy
  USING (tenant_id = current_setting('app.current_tenant')::BIGINT);
CREATE POLICY tenant_isolation ON numbering_scheme
  USING (tenant_id = current_setting('app.current_tenant')::BIGINT);
CREATE POLICY tenant_isolation ON audit_log
  USING (tenant_id = current_setting('app.current_tenant')::BIGINT);
CREATE POLICY tenant_isolation ON state_transition
  USING (tenant_id = current_setting('app.current_tenant')::BIGINT);
CREATE POLICY tenant_isolation ON domain_event
  USING (tenant_id = current_setting('app.current_tenant')::BIGINT);
CREATE POLICY tenant_isolation ON pricing_snapshot
  USING (tenant_id = current_setting('app.current_tenant')::BIGINT);
CREATE POLICY tenant_isolation ON attribute_snapshot
  USING (tenant_id = current_setting('app.current_tenant')::BIGINT);

-- ============================================================
-- 22. PARTITIONING (Performance — NFR-01, NFR-02)
-- ============================================================

-- For production deployment, partition these high-volume tables:
--
-- audit_log: PARTITION BY RANGE (created_at)
--   — Yearly partitions for 7-year retention (NFR-07)
--
-- domain_event: PARTITION BY RANGE (created_at)
--   — Monthly partitions for event sourcing replay performance
--
-- installment: PARTITION BY RANGE (due_on)
--   — Quarterly partitions for financial reporting
--
-- payment_event: PARTITION BY RANGE (paid_on)
--   — Monthly partitions
--
-- subledger_entry: PARTITION BY RANGE (posted_at)
--   — Monthly partitions for IFRS 9 reconciliation
--
-- Example:
-- CREATE TABLE audit_log (
--   ...
-- ) PARTITION BY RANGE (created_at);
--
-- CREATE TABLE audit_log_2026 PARTITION OF audit_log
--   FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
