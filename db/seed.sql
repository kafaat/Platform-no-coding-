-- ============================================================
-- Dynamic Product System — Seed Data
-- Reference data for initial system setup
-- ============================================================

-- ============================================================
-- 1. DEFAULT TENANT
-- ============================================================
INSERT INTO tenant (code, name, settings, is_active) VALUES
  ('DEFAULT', 'Default Tenant', '{"locale": "ar", "currency": "YER", "timezone": "Asia/Aden"}', true);

-- ============================================================
-- 2. CHANNELS (FR-050)
-- ============================================================
INSERT INTO channel (code, name_ar, name_en) VALUES
  ('WEB',    'الويب',              'Web'),
  ('MOBILE', 'الجوال',             'Mobile App'),
  ('POS',    'نقطة البيع',         'Point of Sale'),
  ('API',    'واجهة برمجية',       'API Integration'),
  ('USSD',   'خدمة USSD',         'USSD Service'),
  ('IVR',    'الرد الصوتي',        'Interactive Voice Response');

-- ============================================================
-- 3. UNITS OF MEASURE (FR-030)
-- ============================================================
INSERT INTO uom (code, name_ar, name_en) VALUES
  ('PCS',  'قطعة',    'Piece'),
  ('KG',   'كيلوغرام', 'Kilogram'),
  ('G',    'غرام',     'Gram'),
  ('L',    'لتر',      'Liter'),
  ('ML',   'مليلتر',   'Milliliter'),
  ('M',    'متر',      'Meter'),
  ('CM',   'سنتيمتر',  'Centimeter'),
  ('BOX',  'صندوق',    'Box'),
  ('PKG',  'حزمة',     'Package'),
  ('SET',  'طقم',      'Set'),
  ('HR',   'ساعة',     'Hour'),
  ('DAY',  'يوم',      'Day'),
  ('MON',  'شهر',      'Month'),
  ('YR',   'سنة',      'Year'),
  ('SQM',  'متر مربع', 'Square Meter'),
  ('UNIT', 'وحدة',     'Unit');

-- ============================================================
-- 4. UNIT CONVERSIONS
-- ============================================================
INSERT INTO uom_conversion (from_code, to_code, factor) VALUES
  ('KG',  'G',   1000),
  ('G',   'KG',  0.001),
  ('L',   'ML',  1000),
  ('ML',  'L',   0.001),
  ('M',   'CM',  100),
  ('CM',  'M',   0.01),
  ('YR',  'MON', 12),
  ('MON', 'DAY', 30),
  ('DAY', 'HR',  24);

-- ============================================================
-- 5. DEFAULT NUMBERING SCHEMES (FR-070)
-- ============================================================
-- Note: tenant_id=1 assumes the DEFAULT tenant created above
INSERT INTO numbering_scheme (tenant_id, code, pattern, context, gap_policy) VALUES
  (1, 'PRODUCT_CODE',  'PRD-{TYPE}-{SEQ:6}',
   '{"description": "Product identifier"}', 'ALLOW'),
  (1, 'CONTRACT_NUM',  'FIN-{TYPE}-{YEAR}-{BRANCH}-{SEQ:6}',
   '{"description": "Financial contract number"}', 'DENY'),
  (1, 'INVOICE_NUM',   'INV-{YEAR}-{SEQ:8}',
   '{"description": "Invoice number"}', 'DENY'),
  (1, 'RESERVATION_NUM', 'RSV-{YEAR}-{SEQ:6}',
   '{"description": "Reservation number"}', 'ALLOW');

-- ============================================================
-- 6. DEFAULT NUMBERING SEQUENCES
-- ============================================================
INSERT INTO numbering_sequence (scheme_id, branch_code, channel_code, current_value) VALUES
  (1, 'HQ', NULL, 0),
  (2, 'HQ', NULL, 0),
  (3, 'HQ', NULL, 0),
  (4, 'HQ', NULL, 0);

-- ============================================================
-- 7. DEFAULT ACCOUNTING TEMPLATES (FR-080)
-- ============================================================
INSERT INTO accounting_template (tenant_id, name, event, entries) VALUES
  (1, 'قالب البيع',        'SALE',
   '[{"dr": "1201-ACCOUNTS_RECEIVABLE", "cr": "4001-SALES_REVENUE", "description": "Sale revenue recognition"}]'),
  (1, 'قالب المرتجع',      'RETURN',
   '[{"dr": "4001-SALES_REVENUE", "cr": "1201-ACCOUNTS_RECEIVABLE", "description": "Sales return reversal"}]'),
  (1, 'قالب صرف القرض',    'DISBURSEMENT',
   '[{"dr": "1301-LOAN_RECEIVABLE", "cr": "1001-CASH", "description": "Loan disbursement"}]'),
  (1, 'قالب تحصيل أصل',    'PRINCIPAL_PAYMENT',
   '[{"dr": "1001-CASH", "cr": "1301-LOAN_RECEIVABLE", "description": "Principal repayment"}]'),
  (1, 'قالب تحصيل فائدة',  'INTEREST_PAYMENT',
   '[{"dr": "1001-CASH", "cr": "4101-INTEREST_INCOME", "description": "Interest income collection"}]'),
  (1, 'قالب رسوم',         'FEE_COLLECTION',
   '[{"dr": "1001-CASH", "cr": "4201-FEE_INCOME", "description": "Fee collection"}]'),
  (1, 'قالب غرامة تأخير',  'LATE_PENALTY',
   '[{"dr": "1302-PENALTY_RECEIVABLE", "cr": "4301-PENALTY_INCOME", "description": "Late penalty accrual"}]'),
  (1, 'قالب شطب',          'WRITE_OFF',
   '[{"dr": "5001-BAD_DEBT_EXPENSE", "cr": "1301-LOAN_RECEIVABLE", "description": "Loan write-off"}]');

-- ============================================================
-- 8. DEFAULT CANCELLATION POLICIES (FR-120)
-- ============================================================
INSERT INTO cancellation_policy (tenant_id, name, rules) VALUES
  (1, 'سياسة إلغاء مرنة',
   '[{"hours_before": 48, "penalty_percent": 0}, {"hours_before": 24, "penalty_percent": 25}, {"hours_before": 0, "penalty_percent": 50}]'),
  (1, 'سياسة إلغاء صارمة',
   '[{"hours_before": 72, "penalty_percent": 0}, {"hours_before": 48, "penalty_percent": 50}, {"hours_before": 24, "penalty_percent": 75}, {"hours_before": 0, "penalty_percent": 100}]'),
  (1, 'بدون إلغاء',
   '[{"hours_before": 0, "penalty_percent": 100}]');
