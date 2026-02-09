-- ============================================================
-- Migration 003: Add Notification Log
-- ترحيل 003: إضافة سجل الإشعارات
--
-- Purpose / الغرض:
--   Adds a notification delivery log table for tracking
--   the lifecycle of every notification sent to customers.
--   Supports idempotency to prevent duplicate sends.
--
--   إضافة جدول سجل تسليم الإشعارات لتتبع دورة حياة
--   كل إشعار يُرسل للعملاء. يدعم مفتاح عدم التكرار
--   لمنع الإرسال المزدوج.
--
-- Related / مرتبط بـ: docs/notification-templates.md
-- ============================================================

-- UP:

-- إنشاء جدول سجل الإشعارات — Create notification log table
CREATE TABLE IF NOT EXISTS notification_log (
    id              BIGSERIAL    PRIMARY KEY,
    tenant_id       BIGINT       NOT NULL REFERENCES tenant(id),
    customer_id     BIGINT       NOT NULL REFERENCES customer(id),
    template_code   TEXT         NOT NULL,               -- رمز القالب — Template identifier
    channel         TEXT         NOT NULL                 -- قناة الإرسال — Delivery channel
                    CHECK (channel IN ('SMS','EMAIL','PUSH','IN_APP')),
    status          TEXT         NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING','SENT','DELIVERED','FAILED')),
    sent_at         TIMESTAMPTZ,                         -- وقت الإرسال — When notification was sent
    delivered_at    TIMESTAMPTZ,                         -- وقت التسليم — When delivery was confirmed
    error_message   TEXT,                                -- رسالة الخطأ — Error details on failure
    payload         JSONB        DEFAULT '{}',           -- البيانات المرسلة — Notification payload/context
    idempotency_key TEXT         NOT NULL UNIQUE,        -- مفتاح عدم التكرار — Prevents duplicate sends
    created_at      TIMESTAMPTZ  DEFAULT now(),
    updated_at      TIMESTAMPTZ  DEFAULT now()
);

COMMENT ON TABLE notification_log
    IS 'سجل تسليم الإشعارات — Tracks notification delivery lifecycle';

COMMENT ON COLUMN notification_log.template_code
    IS 'رمز قالب الإشعار المستخدم — Notification template code used';

COMMENT ON COLUMN notification_log.status
    IS 'حالة التسليم: معلق/مرسل/مسلّم/فاشل — Delivery status: PENDING/SENT/DELIVERED/FAILED';

COMMENT ON COLUMN notification_log.idempotency_key
    IS 'مفتاح فريد لمنع الإرسال المزدوج — Unique key to prevent duplicate sends';

COMMENT ON COLUMN notification_log.payload
    IS 'بيانات السياق المرسلة مع الإشعار — Context data sent with the notification (JSONB)';

-- تفعيل أمان مستوى الصف — Enable Row Level Security
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON notification_log
    USING (tenant_id = current_setting('app.current_tenant')::BIGINT);

-- الفهارس — Indexes
-- فهرس العميل للاستعلام عن إشعارات عميل معين
-- Customer index for querying a specific customer's notifications
CREATE INDEX IF NOT EXISTS idx_notif_log_customer
    ON notification_log(customer_id);

-- فهرس الحالة لمعالجة الإشعارات المعلقة والفاشلة
-- Status index for processing pending and failed notifications
CREATE INDEX IF NOT EXISTS idx_notif_log_status
    ON notification_log(status);

-- فهرس وقت الإرسال للاستعلامات الزمنية والتقارير
-- Sent-at index for time-range queries and reporting
CREATE INDEX IF NOT EXISTS idx_notif_log_sent_at
    ON notification_log(sent_at);

-- فهرس المستأجر لعزل البيانات
-- Tenant index for data isolation queries
CREATE INDEX IF NOT EXISTS idx_notif_log_tenant
    ON notification_log(tenant_id);

-- تسجيل الترحيل — Record migration
INSERT INTO schema_migrations (version, name)
VALUES ('003', 'add_notification_log')
ON CONFLICT (version) DO NOTHING;

-- DOWN:
-- عكس الترحيل — Rollback migration
-- DROP POLICY IF EXISTS tenant_isolation ON notification_log;
-- DROP TABLE IF EXISTS notification_log;
-- DELETE FROM schema_migrations WHERE version = '003';
