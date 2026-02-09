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

-- ============================================================
-- 23. MATERIALIZED VIEWS (CQRS Read Models)
-- نماذج القراءة المادية لتحسين أداء الاستعلامات
-- Materialized views for read-optimized query performance
-- ============================================================

-- mv_product_catalog: عرض كامل للمنتج يجمع المنتج + الفئة + الإصدار الحالي + السعر الأساسي + عدد القنوات النشطة
-- Full product catalog view joining product, category, current version, base price, and active channel count
CREATE MATERIALIZED VIEW mv_product_catalog AS
SELECT
    p.tenant_id,
    p.id,
    p.type,
    p.name_ar,
    p.name_en,
    pc.name_ar   AS category_name_ar,
    pc.name_en   AS category_name_en,
    p.status,
    pv.version_no,
    pv.effective_from,
    pr.base_price,
    pr.currency,
    COALESCE(ch.channel_count, 0) AS channel_count
FROM product p
JOIN product_category pc ON pc.id = p.category_id
LEFT JOIN LATERAL (
    SELECT pv2.version_no, pv2.effective_from
    FROM product_version pv2
    WHERE pv2.product_id = p.id
      AND pv2.effective_from <= CURRENT_DATE
      AND (pv2.effective_to IS NULL OR pv2.effective_to > CURRENT_DATE)
    ORDER BY pv2.effective_from DESC
    LIMIT 1
) pv ON true
LEFT JOIN LATERAL (
    SELECT plp2.base_price, pl2.currency
    FROM price_list_product plp2
    JOIN price_list pl2 ON pl2.id = plp2.price_list_id
    WHERE plp2.product_id = p.id
      AND pl2.valid_from <= CURRENT_DATE
      AND (pl2.valid_to IS NULL OR pl2.valid_to > CURRENT_DATE)
    ORDER BY pl2.valid_from DESC
    LIMIT 1
) pr ON true
LEFT JOIN LATERAL (
    SELECT COUNT(*)::INT AS channel_count
    FROM product_channel pch
    WHERE pch.product_id = p.id
      AND pch.enabled = true
) ch ON true
WITH NO DATA;

CREATE UNIQUE INDEX idx_mv_product_catalog_id ON mv_product_catalog(id);

COMMENT ON MATERIALIZED VIEW mv_product_catalog IS
    'كتالوج المنتجات — عرض مادي يجمع بيانات المنتج والفئة والإصدار والسعر والقنوات / Product catalog read model for CQRS';

-- -----------------------------------------------------------

-- mv_contract_portfolio: لوحة معلومات محفظة العقود
-- Contract portfolio dashboard with aggregated installment data
CREATE MATERIALIZED VIEW mv_contract_portfolio AS
SELECT
    c.id,
    c.tenant_id,
    c.contract_number,
    cu.name_ar  AS customer_name_ar,
    cu.name_en  AS customer_name_en,
    p.name_ar   AS product_name_ar,
    p.name_en   AS product_name_en,
    c.principal,
    c.currency,
    c.interest_type,
    c.status,
    c.opened_at,
    COALESCE(inst.total_due, 0)          AS total_due,
    COALESCE(inst.total_paid, 0)         AS total_paid,
    COALESCE(inst.total_due, 0)
        - COALESCE(inst.total_paid, 0)   AS outstanding_balance,
    inst.next_due_date,
    COALESCE(inst.days_overdue, 0)       AS days_overdue
FROM contract c
JOIN customer cu ON cu.id = c.customer_id
JOIN product p   ON p.id  = c.product_id
LEFT JOIN LATERAL (
    SELECT
        SUM(i.principal_due + i.interest_due + i.fee_due)     AS total_due,
        SUM(i.paid_principal + i.paid_interest + i.paid_fee)  AS total_paid,
        MIN(CASE WHEN i.status IN ('DUE','LATE') THEN i.due_on END) AS next_due_date,
        MAX(CASE
            WHEN i.status = 'LATE'
            THEN GREATEST(CURRENT_DATE - i.due_on, 0)
            ELSE 0
        END) AS days_overdue
    FROM installment i
    WHERE i.contract_id = c.id
) inst ON true
WITH NO DATA;

CREATE UNIQUE INDEX idx_mv_contract_portfolio_id ON mv_contract_portfolio(id);

COMMENT ON MATERIALIZED VIEW mv_contract_portfolio IS
    'محفظة العقود — عرض مادي مجمّع للأقساط والمدفوعات والتأخر / Contract portfolio dashboard read model';

-- -----------------------------------------------------------

-- mv_aging_report: تقرير الشيخوخة (التصنيف العمري) لكل عقد
-- Aging analysis per contract with bucket classification
CREATE MATERIALIZED VIEW mv_aging_report AS
SELECT
    c.id          AS contract_id,
    c.tenant_id,
    c.contract_number,
    c.customer_id,
    cu.name_ar    AS customer_name_ar,
    cu.name_en    AS customer_name_en,
    c.principal,
    c.currency,
    CASE
        WHEN COALESCE(aging.max_days_overdue, 0) = 0   THEN 'CURRENT'
        WHEN aging.max_days_overdue BETWEEN 1   AND 30  THEN '30'
        WHEN aging.max_days_overdue BETWEEN 31  AND 60  THEN '60'
        WHEN aging.max_days_overdue BETWEEN 61  AND 90  THEN '90'
        WHEN aging.max_days_overdue BETWEEN 91  AND 180 THEN '180'
        ELSE '180+'
    END AS current_bucket,
    COALESCE(aging.overdue_amount, 0)    AS overdue_amount,
    COALESCE(pen.total_penalties, 0)     AS total_penalties
FROM contract c
JOIN customer cu ON cu.id = c.customer_id
LEFT JOIN LATERAL (
    SELECT
        MAX(GREATEST(CURRENT_DATE - i.due_on, 0)) AS max_days_overdue,
        SUM(
            (i.principal_due - i.paid_principal)
          + (i.interest_due  - i.paid_interest)
          + (i.fee_due       - i.paid_fee)
        ) AS overdue_amount
    FROM installment i
    WHERE i.contract_id = c.id
      AND i.status IN ('LATE','DUE')
      AND i.due_on < CURRENT_DATE
) aging ON true
LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(pe.amount), 0) AS total_penalties
    FROM penalty_event pe
    WHERE pe.contract_id = c.id
) pen ON true
WHERE c.status IN ('ACTIVE','IN_ARREARS','RESTRUCTURED')
WITH NO DATA;

CREATE UNIQUE INDEX idx_mv_aging_report_contract ON mv_aging_report(contract_id);

COMMENT ON MATERIALIZED VIEW mv_aging_report IS
    'تقرير الشيخوخة — التصنيف العمري للمتأخرات حسب العقد / Aging bucket analysis per contract';

-- -----------------------------------------------------------

-- mv_revenue_summary: ملخص الإيرادات الشهرية حسب نوع المنتج
-- Monthly revenue summary by product type
CREATE MATERIALIZED VIEW mv_revenue_summary AS
SELECT
    TO_CHAR(c.opened_at, 'YYYY-MM')  AS month,
    p.type                            AS product_type,
    COUNT(DISTINCT c.id)              AS contract_count,
    SUM(c.principal)                  AS total_disbursed,
    COALESCE(SUM(pe_int.interest_collected), 0) AS total_interest_collected,
    COALESCE(SUM(pe_fee.fees_collected), 0)     AS total_fees_collected,
    COALESCE(SUM(pen.penalties), 0)             AS total_penalties
FROM contract c
JOIN product p ON p.id = c.product_id
LEFT JOIN LATERAL (
    SELECT SUM(pev.amount_interest) AS interest_collected
    FROM payment_event pev
    WHERE pev.contract_id = c.id
) pe_int ON true
LEFT JOIN LATERAL (
    SELECT SUM(pev.amount_fee) AS fees_collected
    FROM payment_event pev
    WHERE pev.contract_id = c.id
) pe_fee ON true
LEFT JOIN LATERAL (
    SELECT SUM(pne.amount) AS penalties
    FROM penalty_event pne
    WHERE pne.contract_id = c.id
) pen ON true
WHERE c.opened_at IS NOT NULL
GROUP BY TO_CHAR(c.opened_at, 'YYYY-MM'), p.type
WITH NO DATA;

CREATE INDEX idx_mv_revenue_summary_month ON mv_revenue_summary(month);

COMMENT ON MATERIALIZED VIEW mv_revenue_summary IS
    'ملخص الإيرادات الشهرية حسب نوع المنتج / Monthly revenue summary by product type';

-- -----------------------------------------------------------

-- fn_refresh_materialized_views: تحديث جميع النماذج المادية بشكل متزامن
-- Refresh all materialized views concurrently for zero-downtime reads
CREATE OR REPLACE FUNCTION fn_refresh_materialized_views()
RETURNS VOID AS $$
BEGIN
    -- تحديث متزامن — يتطلب وجود فهرس فريد على كل عرض مادي
    -- Concurrent refresh requires a unique index on each materialized view
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_product_catalog;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_contract_portfolio;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_aging_report;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_revenue_summary;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_refresh_materialized_views IS
    'تحديث جميع النماذج المادية بشكل متزامن — يُستدعى دورياً / Refresh all CQRS materialized views concurrently';

-- ============================================================
-- 24. STORED PROCEDURES (Core Business Logic)
-- الإجراءات المخزّنة — المنطق التجاري الأساسي
-- Core stored procedures for financial contract operations
-- ============================================================

-- -----------------------------------------------------------
-- fn_generate_installments: توليد جدول الأقساط لعقد مالي
-- Generate installment schedule for a financial contract
-- Supports FLAT and REDUCING (annuity) interest calculation
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_generate_installments(p_contract_id BIGINT)
RETURNS INTEGER AS $$
DECLARE
    v_contract       RECORD;
    v_annual_rate    NUMERIC(18,8);
    v_term_months    INTEGER;
    v_monthly_rate   NUMERIC(18,8);
    v_emi            NUMERIC(18,2);
    v_total_interest NUMERIC(18,2);
    v_monthly_principal NUMERIC(18,2);
    v_monthly_interest  NUMERIC(18,2);
    v_remaining_principal NUMERIC(18,2);
    v_due_date       DATE;
    v_seq            INTEGER;
    v_principal_sum  NUMERIC(18,2) := 0;
    v_interest_sum   NUMERIC(18,2) := 0;
BEGIN
    -- Fetch contract details
    SELECT c.id, c.principal, c.interest_type, c.opened_at, c.status, c.meta
    INTO v_contract
    FROM contract c
    WHERE c.id = p_contract_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Contract id=% not found', p_contract_id;
    END IF;

    -- العقد يجب أن يكون بحالة ACTIVE أو DRAFT لتوليد الأقساط
    -- Contract must be in ACTIVE or DRAFT status to generate installments
    IF v_contract.status NOT IN ('DRAFT', 'ACTIVE') THEN
        RAISE EXCEPTION 'Cannot generate installments for contract id=% with status=%', p_contract_id, v_contract.status;
    END IF;

    -- التحقق من عدم وجود أقساط سابقة
    -- Ensure no installments already exist
    IF EXISTS (SELECT 1 FROM installment WHERE contract_id = p_contract_id) THEN
        RAISE EXCEPTION 'Installments already exist for contract id=%', p_contract_id;
    END IF;

    -- استخراج معدل الفائدة وعدد الأشهر من meta
    -- Extract annual_rate and term_months from contract meta JSONB
    v_annual_rate := (v_contract.meta ->> 'annual_rate')::NUMERIC(18,8);
    v_term_months := (v_contract.meta ->> 'term_months')::INTEGER;

    IF v_annual_rate IS NULL OR v_annual_rate < 0 THEN
        RAISE EXCEPTION 'Invalid or missing annual_rate in contract meta for contract id=%', p_contract_id;
    END IF;

    IF v_term_months IS NULL OR v_term_months <= 0 THEN
        RAISE EXCEPTION 'Invalid or missing term_months in contract meta for contract id=%', p_contract_id;
    END IF;

    IF v_contract.opened_at IS NULL THEN
        RAISE EXCEPTION 'Contract id=% has no opened_at date', p_contract_id;
    END IF;

    v_monthly_rate := v_annual_rate / 12.0;

    -- ============================================================
    -- FLAT Interest: إجمالي الفائدة = المبلغ × المعدل × (المدة/12)
    -- Total interest = Principal * Rate * (Term / 12)
    -- Split equally across all installments
    -- ============================================================
    IF v_contract.interest_type = 'FLAT' THEN

        v_total_interest := ROUND(v_contract.principal * v_annual_rate * (v_term_months::NUMERIC / 12.0), 2);
        v_monthly_principal := ROUND(v_contract.principal / v_term_months, 2);
        v_monthly_interest  := ROUND(v_total_interest / v_term_months, 2);

        FOR v_seq IN 1..v_term_months LOOP
            v_due_date := (v_contract.opened_at::DATE) + (v_seq * INTERVAL '1 month')::INTERVAL;

            -- التعامل مع فرق التقريب في القسط الأخير
            -- Handle rounding difference on the last installment
            IF v_seq = v_term_months THEN
                v_monthly_principal := v_contract.principal - v_principal_sum;
                v_monthly_interest  := v_total_interest - v_interest_sum;
            END IF;

            INSERT INTO installment (contract_id, seq, due_on, principal_due, interest_due, fee_due, status)
            VALUES (p_contract_id, v_seq, v_due_date::DATE, v_monthly_principal, v_monthly_interest, 0, 'DUE');

            v_principal_sum := v_principal_sum + v_monthly_principal;
            v_interest_sum  := v_interest_sum  + v_monthly_interest;
        END LOOP;

    -- ============================================================
    -- REDUCING Interest (Annuity): القسط الثابت EMI
    -- EMI = P * r * (1+r)^n / ((1+r)^n - 1)
    -- where P = principal, r = monthly rate, n = term months
    -- ============================================================
    ELSIF v_contract.interest_type = 'REDUCING' THEN

        IF v_monthly_rate = 0 THEN
            -- حالة خاصة: معدل فائدة صفر
            -- Special case: zero interest rate
            v_emi := ROUND(v_contract.principal / v_term_months, 2);
        ELSE
            v_emi := ROUND(
                v_contract.principal * v_monthly_rate * POWER(1 + v_monthly_rate, v_term_months)
                / (POWER(1 + v_monthly_rate, v_term_months) - 1),
                2
            );
        END IF;

        v_remaining_principal := v_contract.principal;

        FOR v_seq IN 1..v_term_months LOOP
            v_due_date := (v_contract.opened_at::DATE) + (v_seq * INTERVAL '1 month')::INTERVAL;

            -- حساب فائدة القسط على الرصيد المتبقي
            -- Interest on remaining balance
            v_monthly_interest := ROUND(v_remaining_principal * v_monthly_rate, 2);
            v_monthly_principal := v_emi - v_monthly_interest;

            -- التعامل مع القسط الأخير لضمان المجموع الصحيح
            -- Last installment: settle any rounding remainder
            IF v_seq = v_term_months THEN
                v_monthly_principal := v_remaining_principal;
                v_monthly_interest  := v_emi - v_monthly_principal;
                -- Ensure non-negative interest
                IF v_monthly_interest < 0 THEN
                    v_monthly_interest := 0;
                END IF;
            END IF;

            INSERT INTO installment (contract_id, seq, due_on, principal_due, interest_due, fee_due, status)
            VALUES (p_contract_id, v_seq, v_due_date::DATE, v_monthly_principal, v_monthly_interest, 0, 'DUE');

            v_remaining_principal := v_remaining_principal - v_monthly_principal;
            v_principal_sum := v_principal_sum + v_monthly_principal;
        END LOOP;

    ELSE
        RAISE EXCEPTION 'Unsupported interest_type=% for contract id=%', v_contract.interest_type, p_contract_id;
    END IF;

    RETURN v_term_months;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_generate_installments IS
    'توليد جدول الأقساط لعقد مالي — يدعم FLAT و REDUCING / Generate installment schedule supporting FLAT and REDUCING (annuity) methods';

-- -----------------------------------------------------------
-- fn_process_payment: معالجة دفعة على قسط عقد مالي
-- Process a payment against a contract installment
-- Allocates to interest first, then principal, then fees
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_process_payment(
    p_contract_id     BIGINT,
    p_installment_id  BIGINT,
    p_amount          NUMERIC,
    p_channel         TEXT,
    p_idempotency_key TEXT
)
RETURNS BIGINT AS $$
DECLARE
    v_contract      RECORD;
    v_installment   RECORD;
    v_remaining     NUMERIC(18,2);
    v_alloc_interest  NUMERIC(18,2) := 0;
    v_alloc_principal NUMERIC(18,2) := 0;
    v_alloc_fee       NUMERIC(18,2) := 0;
    v_interest_due  NUMERIC(18,2);
    v_principal_due NUMERIC(18,2);
    v_fee_due       NUMERIC(18,2);
    v_payment_id    BIGINT;
    v_new_status    TEXT;
    v_all_paid      BOOLEAN;
BEGIN
    -- ============================================================
    -- التحقق من Idempotency — منع الدفع المكرر (BR-11)
    -- Idempotency check — prevent duplicate payments
    -- ============================================================
    IF EXISTS (SELECT 1 FROM payment_event WHERE idempotency_key = p_idempotency_key) THEN
        -- إرجاع معرف الدفعة الموجودة
        -- Return existing payment ID for idempotent retry
        SELECT id INTO v_payment_id
        FROM payment_event
        WHERE idempotency_key = p_idempotency_key;
        RETURN v_payment_id;
    END IF;

    -- التحقق من صحة المبلغ
    -- Validate payment amount
    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'Payment amount must be positive, got %', p_amount;
    END IF;

    -- التحقق من العقد
    -- Validate contract exists and is in payable status
    SELECT c.id, c.status, c.tenant_id
    INTO v_contract
    FROM contract c
    WHERE c.id = p_contract_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Contract id=% not found', p_contract_id;
    END IF;

    IF v_contract.status NOT IN ('ACTIVE', 'IN_ARREARS') THEN
        RAISE EXCEPTION 'Cannot process payment for contract id=% with status=%', p_contract_id, v_contract.status;
    END IF;

    -- التحقق من القسط
    -- Validate installment exists and belongs to this contract
    SELECT i.id, i.status,
           (i.interest_due  - i.paid_interest)  AS interest_remaining,
           (i.principal_due - i.paid_principal)  AS principal_remaining,
           (i.fee_due       - i.paid_fee)        AS fee_remaining
    INTO v_installment
    FROM installment i
    WHERE i.id = p_installment_id
      AND i.contract_id = p_contract_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Installment id=% not found for contract id=%', p_installment_id, p_contract_id;
    END IF;

    IF v_installment.status IN ('PAID', 'WAIVED') THEN
        RAISE EXCEPTION 'Installment id=% is already % — cannot accept payment', p_installment_id, v_installment.status;
    END IF;

    -- ============================================================
    -- توزيع المبلغ: الفائدة أولاً ثم الأصل ثم الرسوم
    -- Allocation order: Interest → Principal → Fees
    -- ============================================================
    v_remaining := p_amount;

    -- 1. Allocate to interest
    v_interest_due := v_installment.interest_remaining;
    IF v_remaining > 0 AND v_interest_due > 0 THEN
        v_alloc_interest := LEAST(v_remaining, v_interest_due);
        v_remaining := v_remaining - v_alloc_interest;
    END IF;

    -- 2. Allocate to principal
    v_principal_due := v_installment.principal_remaining;
    IF v_remaining > 0 AND v_principal_due > 0 THEN
        v_alloc_principal := LEAST(v_remaining, v_principal_due);
        v_remaining := v_remaining - v_alloc_principal;
    END IF;

    -- 3. Allocate to fees
    v_fee_due := v_installment.fee_remaining;
    IF v_remaining > 0 AND v_fee_due > 0 THEN
        v_alloc_fee := LEAST(v_remaining, v_fee_due);
        v_remaining := v_remaining - v_alloc_fee;
    END IF;

    -- تحذير: إذا تبقى مبلغ بعد التوزيع الكامل يتم تجاهله (overpayment)
    -- Note: Any excess after full allocation is ignored (overpayment handling is out of scope)

    -- ============================================================
    -- إدراج حدث الدفع
    -- Insert payment event
    -- ============================================================
    INSERT INTO payment_event (contract_id, installment_id, paid_on, amount_principal, amount_interest, amount_fee, channel, idempotency_key)
    VALUES (p_contract_id, p_installment_id, NOW(), v_alloc_principal, v_alloc_interest, v_alloc_fee, p_channel, p_idempotency_key)
    RETURNING id INTO v_payment_id;

    -- ============================================================
    -- تحديث مبالغ القسط المدفوعة وحالته
    -- Update installment paid amounts and status
    -- ============================================================
    UPDATE installment
    SET paid_principal = paid_principal + v_alloc_principal,
        paid_interest  = paid_interest  + v_alloc_interest,
        paid_fee       = paid_fee       + v_alloc_fee,
        status = CASE
            WHEN (paid_principal + v_alloc_principal) >= principal_due
             AND (paid_interest  + v_alloc_interest)  >= interest_due
             AND (paid_fee       + v_alloc_fee)       >= fee_due
            THEN 'PAID'
            ELSE 'PARTIAL'
        END
    WHERE id = p_installment_id;

    -- ============================================================
    -- قيود الدفتر الفرعي — أصل وفائدة
    -- Subledger entries for principal and interest portions
    -- ============================================================
    IF v_alloc_principal > 0 THEN
        INSERT INTO subledger_entry (contract_id, event_type, dr_account, cr_account, amount, posted_at, ref, idempotency_key)
        VALUES (
            p_contract_id,
            'PAYMENT_PRINCIPAL',
            'CASH',                       -- مدين: النقد
            'LOAN_RECEIVABLE',            -- دائن: ذمم القروض
            v_alloc_principal,
            NOW(),
            'payment_event_id=' || v_payment_id,
            p_idempotency_key || '_PRINCIPAL'
        );
    END IF;

    IF v_alloc_interest > 0 THEN
        INSERT INTO subledger_entry (contract_id, event_type, dr_account, cr_account, amount, posted_at, ref, idempotency_key)
        VALUES (
            p_contract_id,
            'PAYMENT_INTEREST',
            'CASH',                       -- مدين: النقد
            'INTEREST_INCOME',            -- دائن: إيراد الفائدة
            v_alloc_interest,
            NOW(),
            'payment_event_id=' || v_payment_id,
            p_idempotency_key || '_INTEREST'
        );
    END IF;

    -- ============================================================
    -- التحقق مما إذا تم سداد جميع الأقساط — إغلاق العقد
    -- Check if all installments are fully paid → close the contract
    -- ============================================================
    SELECT NOT EXISTS (
        SELECT 1 FROM installment
        WHERE contract_id = p_contract_id
          AND status NOT IN ('PAID', 'WAIVED')
    ) INTO v_all_paid;

    IF v_all_paid THEN
        UPDATE contract
        SET status = 'CLOSED',
            closed_at = NOW()
        WHERE id = p_contract_id;
    END IF;

    RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_process_payment IS
    'معالجة دفعة على قسط — توزيع تلقائي (فائدة ← أصل ← رسوم) مع قيود محاسبية / Process payment with auto-allocation (interest→principal→fees) and subledger entries';

-- -----------------------------------------------------------
-- fn_update_aging_buckets: تحديث التصنيف العمري للمتأخرات
-- Update aging buckets for all active contracts
-- Applies penalties based on BR-08 aging policy
-- Called by scheduler (pg_cron or application-level)
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_update_aging_buckets()
RETURNS INTEGER AS $$
DECLARE
    v_contract        RECORD;
    v_max_days_overdue INTEGER;
    v_aging_bucket    TEXT;
    v_contracts_updated INTEGER := 0;
    v_grace_period    INTEGER := 5;  -- فترة السماح بالأيام / Grace period in days
BEGIN
    -- المرور على جميع العقود النشطة والمتأخرة
    -- Iterate over all ACTIVE and IN_ARREARS contracts
    FOR v_contract IN
        SELECT c.id, c.tenant_id, c.status, c.meta
        FROM contract c
        WHERE c.status IN ('ACTIVE', 'IN_ARREARS')
    LOOP
        -- حساب أقصى عدد أيام تأخر
        -- Calculate maximum days overdue across all installments
        SELECT COALESCE(MAX(GREATEST(CURRENT_DATE - i.due_on, 0)), 0)
        INTO v_max_days_overdue
        FROM installment i
        WHERE i.contract_id = v_contract.id
          AND i.status IN ('DUE', 'LATE', 'PARTIAL')
          AND i.due_on < CURRENT_DATE;

        -- تحديد التصنيف العمري
        -- Determine aging bucket
        v_aging_bucket := CASE
            WHEN v_max_days_overdue = 0                     THEN NULL
            WHEN v_max_days_overdue BETWEEN 1   AND 30      THEN '30'
            WHEN v_max_days_overdue BETWEEN 31  AND 60      THEN '60'
            WHEN v_max_days_overdue BETWEEN 61  AND 90      THEN '90'
            WHEN v_max_days_overdue BETWEEN 91  AND 180     THEN '180'
            WHEN v_max_days_overdue > 180                   THEN '180+'
            ELSE NULL
        END;

        -- تحديث حالة الأقساط المتأخرة
        -- Mark overdue installments as LATE
        UPDATE installment
        SET status = 'LATE'
        WHERE contract_id = v_contract.id
          AND status IN ('DUE', 'PARTIAL')
          AND due_on < CURRENT_DATE - v_grace_period;

        -- ============================================================
        -- BR-08: سياسة التصعيد العمري
        -- 30 يوم ← تنبيه، 60 ← تصعيد، 90 ← تعليق، 180+ ← شطب
        -- 30d → alert, 60d → escalate, 90d → suspend, 180+ → write-off
        -- ============================================================
        IF v_aging_bucket IS NOT NULL AND v_max_days_overdue > v_grace_period THEN

            -- إنشاء حدث غرامة إذا لم يوجد لهذا التصنيف اليوم
            -- Create penalty event if one doesn't exist for this bucket today
            IF NOT EXISTS (
                SELECT 1 FROM penalty_event pe
                WHERE pe.contract_id = v_contract.id
                  AND pe.aging_bucket = v_aging_bucket
                  AND pe.created_at::DATE = CURRENT_DATE
            ) THEN
                INSERT INTO penalty_event (contract_id, kind, amount, aging_bucket, created_at)
                VALUES (
                    v_contract.id,
                    'LATE_PENALTY',
                    CASE v_aging_bucket
                        WHEN '30'   THEN 50.00    -- غرامة أولى
                        WHEN '60'   THEN 100.00   -- غرامة تصعيد
                        WHEN '90'   THEN 200.00   -- غرامة تعليق
                        WHEN '180'  THEN 500.00   -- غرامة ما قبل الشطب
                        WHEN '180+' THEN 1000.00  -- غرامة شطب
                        ELSE 0
                    END,
                    v_aging_bucket,
                    NOW()
                );
            END IF;

            -- تحديث حالة العقد إلى IN_ARREARS إذا تجاوز فترة السماح
            -- Update contract status to IN_ARREARS if overdue beyond grace
            IF v_contract.status = 'ACTIVE' AND v_max_days_overdue > v_grace_period THEN
                UPDATE contract
                SET status = 'IN_ARREARS'
                WHERE id = v_contract.id;
            END IF;

            -- BR-08: شطب العقد إذا تجاوز 180 يوم
            -- Write off contract if overdue > 180 days
            IF v_max_days_overdue > 180 THEN
                UPDATE contract
                SET status = 'WRITTEN_OFF'
                WHERE id = v_contract.id
                  AND status != 'WRITTEN_OFF';
            END IF;

            v_contracts_updated := v_contracts_updated + 1;
        END IF;

    END LOOP;

    RETURN v_contracts_updated;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_update_aging_buckets IS
    'تحديث التصنيف العمري وتطبيق الغرامات (BR-08) — يُستدعى دورياً / Update aging buckets and apply penalties per BR-08 escalation policy';

-- -----------------------------------------------------------
-- fn_calculate_early_settlement: حساب مبلغ التسوية المبكرة
-- Calculate early settlement amount using Outstanding Balance method
-- Returns: outstanding_principal, accrued_interest, settlement_fee, total_settlement
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_calculate_early_settlement(
    p_contract_id    BIGINT,
    p_settlement_date DATE
)
RETURNS TABLE (
    outstanding_principal NUMERIC(18,2),
    accrued_interest      NUMERIC(18,2),
    settlement_fee        NUMERIC(18,2),
    total_settlement      NUMERIC(18,2)
) AS $$
DECLARE
    v_contract            RECORD;
    v_outstanding         NUMERIC(18,2);
    v_accrued             NUMERIC(18,2);
    v_fee                 NUMERIC(18,2) := 0;
    v_annual_rate         NUMERIC(18,8);
    v_last_payment_date   DATE;
    v_days_accrued        INTEGER;
    v_daily_rate          NUMERIC(18,8);
BEGIN
    -- التحقق من العقد
    -- Validate contract
    SELECT c.id, c.status, c.principal, c.interest_type, c.meta, c.currency, c.product_id, c.day_count
    INTO v_contract
    FROM contract c
    WHERE c.id = p_contract_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Contract id=% not found', p_contract_id;
    END IF;

    IF v_contract.status NOT IN ('ACTIVE', 'IN_ARREARS') THEN
        RAISE EXCEPTION 'Cannot calculate settlement for contract id=% with status=%', p_contract_id, v_contract.status;
    END IF;

    IF p_settlement_date < CURRENT_DATE THEN
        RAISE EXCEPTION 'Settlement date cannot be in the past';
    END IF;

    -- ============================================================
    -- حساب الأصل المستحق المتبقي
    -- Calculate outstanding principal: sum of remaining principal across unpaid installments
    -- ============================================================
    SELECT COALESCE(SUM(i.principal_due - i.paid_principal), 0)
    INTO v_outstanding
    FROM installment i
    WHERE i.contract_id = p_contract_id
      AND i.status NOT IN ('PAID', 'WAIVED');

    -- ============================================================
    -- حساب الفائدة المستحقة من آخر دفعة حتى تاريخ التسوية
    -- Calculate accrued interest from last payment date to settlement date
    -- ============================================================
    v_annual_rate := COALESCE((v_contract.meta ->> 'annual_rate')::NUMERIC(18,8), 0);

    -- تحديد تاريخ آخر دفعة أو تاريخ فتح العقد
    -- Determine last payment date or contract open date
    SELECT COALESCE(MAX(pe.paid_on::DATE), v_contract.meta->>'opened_at')
    INTO v_last_payment_date
    FROM payment_event pe
    WHERE pe.contract_id = p_contract_id;

    IF v_last_payment_date IS NULL THEN
        -- إذا لم يكن هناك دفعات، نبدأ من أول قسط
        -- If no payments, start from first installment due date
        SELECT MIN(i.due_on)
        INTO v_last_payment_date
        FROM installment i
        WHERE i.contract_id = p_contract_id;
    END IF;

    v_days_accrued := GREATEST(p_settlement_date - v_last_payment_date, 0);

    -- حساب المعدل اليومي حسب نظام حساب الأيام
    -- Calculate daily rate based on day count convention
    v_daily_rate := CASE v_contract.day_count
        WHEN 'ACT/365' THEN v_annual_rate / 365.0
        WHEN 'ACT/360' THEN v_annual_rate / 360.0
        ELSE v_annual_rate / 360.0   -- 30E/360 default
    END;

    v_accrued := ROUND(v_outstanding * v_daily_rate * v_days_accrued, 2);

    -- ============================================================
    -- البحث عن رسم التسوية المبكرة من رسوم المنتج
    -- Lookup early settlement fee from product charges
    -- ============================================================
    SELECT COALESCE(
        (SELECT ch.value
         FROM product_charge_link pcl
         JOIN charge ch ON ch.id = pcl.charge_id
         WHERE pcl.product_id = v_contract.product_id
           AND ch.code = 'EARLY_SETTLEMENT_FEE'
         LIMIT 1),
        0
    ) INTO v_fee;

    -- إرجاع النتائج
    -- Return settlement breakdown
    outstanding_principal := v_outstanding;
    accrued_interest      := v_accrued;
    settlement_fee        := v_fee;
    total_settlement      := v_outstanding + v_accrued + v_fee;
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fn_calculate_early_settlement IS
    'حساب مبلغ التسوية المبكرة — الأصل المتبقي + الفائدة المستحقة + رسم التسوية / Calculate early settlement using outstanding balance method';

-- ============================================================
-- 25. ADDITIONAL INDEXES (Query Optimization)
-- فهارس إضافية لتحسين أداء الاستعلامات الشائعة
-- Composite, partial, and GIN indexes for common query patterns
-- ============================================================

-- فهرس جزئي: المنتجات النشطة فقط (الاستعلام الأكثر شيوعاً)
-- Partial index: Active products only (most common query pattern)
CREATE INDEX idx_product_active
    ON product(tenant_id, type, category_id)
    WHERE status = 'ACTIVE';

-- فهرس جزئي: العقود النشطة فقط
-- Partial index: Active contracts only
CREATE INDEX idx_contract_active
    ON contract(tenant_id, product_id, customer_id)
    WHERE status = 'ACTIVE';

-- فهرس جزئي: الحجوزات المعلقة مع TTL — لانتهاء الصلاحية التلقائي (BR-10)
-- Partial index: HOLD reservations with TTL for automatic expiry processing
CREATE INDEX idx_reservation_hold_ttl
    ON reservation(hold_until)
    WHERE status = 'HOLD' AND hold_until IS NOT NULL;

-- فهرس مركب: الأقساط حسب العقد والحالة وتاريخ الاستحقاق — لمعالجة الدفعات
-- Composite index: Installments by contract, status, due date for payment processing
CREATE INDEX idx_installment_contract_status_due
    ON installment(contract_id, status, due_on);

-- فهرس مركب: أحداث الدفع حسب العقد وتاريخ الدفع — لكشوف الحساب
-- Composite index: Payment events by contract and payment date for statement generation
CREATE INDEX idx_payment_event_contract_paid
    ON payment_event(contract_id, paid_on);

-- فهرس مركب: أحداث الغرامات حسب العقد وتاريخ الإنشاء — لاستعلامات الشيخوخة
-- Composite index: Penalty events by contract and creation date for aging queries
CREATE INDEX idx_penalty_event_contract_created
    ON penalty_event(contract_id, created_at);

-- فهرس GIN: البحث في بيانات JSONB للمنتج
-- GIN index: JSONB queries on product payload
CREATE INDEX idx_product_payload_gin
    ON product USING GIN(payload);

-- فهرس GIN: البحث في بيانات JSONB للعقد
-- GIN index: JSONB queries on contract meta
CREATE INDEX idx_contract_meta_gin
    ON contract USING GIN(meta);

-- فهرس مركب: قيود الدفتر الفرعي حسب نوع الحدث وتاريخ الترحيل — للتقارير المحاسبية
-- Composite index: Subledger entries by event type and posting date for accounting reports
CREATE INDEX idx_subledger_event_posted
    ON subledger_entry(event_type, posted_at);
