-- ============================================================
-- Migration 002: Add Notification Preferences
-- ترحيل 002: إضافة تفضيلات الإشعارات
--
-- Purpose / الغرض:
--   Adds per-customer notification channel preferences,
--   supporting SMS, Email, Push, and In-App channels
--   with quiet hours and locale settings.
--
--   إضافة تفضيلات قنوات الإشعارات لكل عميل،
--   تدعم الرسائل القصيرة والبريد الإلكتروني والإشعارات الفورية
--   والإشعارات داخل التطبيق مع أوقات الهدوء وإعدادات اللغة.
--
-- Related / مرتبط بـ: docs/notification-templates.md
-- ============================================================

-- UP:

-- إنشاء جدول تفضيلات الإشعارات — Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preference (
    id                BIGSERIAL    PRIMARY KEY,
    tenant_id         BIGINT       NOT NULL REFERENCES tenant(id),
    customer_id       BIGINT       NOT NULL REFERENCES customer(id),
    channel           TEXT         NOT NULL CHECK (channel IN ('SMS','EMAIL','PUSH','IN_APP')),
    enabled           BOOLEAN      DEFAULT true,
    quiet_hours_start TIME,                          -- بداية وقت الهدوء — Start of quiet period
    quiet_hours_end   TIME,                          -- نهاية وقت الهدوء — End of quiet period
    locale            TEXT         DEFAULT 'ar',     -- اللغة المفضلة — Preferred language
    created_at        TIMESTAMPTZ  DEFAULT now(),
    updated_at        TIMESTAMPTZ  DEFAULT now(),
    UNIQUE(tenant_id, customer_id, channel)
);

COMMENT ON TABLE notification_preference
    IS 'تفضيلات إشعارات العميل لكل قناة — Per-customer notification channel preferences';

-- تفعيل أمان مستوى الصف — Enable Row Level Security
ALTER TABLE notification_preference ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON notification_preference
    USING (tenant_id = current_setting('app.current_tenant')::BIGINT);

-- الفهارس — Indexes
CREATE INDEX IF NOT EXISTS idx_notif_pref_customer
    ON notification_preference(customer_id);

CREATE INDEX IF NOT EXISTS idx_notif_pref_tenant
    ON notification_preference(tenant_id);

-- تسجيل الترحيل — Record migration
INSERT INTO schema_migrations (version, name)
VALUES ('002', 'add_notification_preferences')
ON CONFLICT (version) DO NOTHING;

-- DOWN:
-- عكس الترحيل — Rollback migration
-- DROP POLICY IF EXISTS tenant_isolation ON notification_preference;
-- DROP TABLE IF EXISTS notification_preference;
-- DELETE FROM schema_migrations WHERE version = '002';
