-- ============================================================
-- Migration 000: Schema Migrations Tracking Table
-- ترحيل 000: جدول تتبع الترحيلات
--
-- Purpose / الغرض:
--   Creates the schema_migrations table that tracks which
--   migrations have been applied to the database.
--   إنشاء جدول تتبع الترحيلات المطبقة على قاعدة البيانات.
--
-- This migration is special: it bootstraps the tracking
-- mechanism itself and must be applied first.
-- هذا الترحيل خاص: يُنشئ آلية التتبع نفسها ويجب تطبيقه أولاً.
-- ============================================================

-- UP:
CREATE TABLE IF NOT EXISTS schema_migrations (
    version    TEXT PRIMARY KEY,            -- رقم الترحيل — Migration version number (e.g., '001')
    name       TEXT NOT NULL,               -- اسم الترحيل — Migration name (e.g., 'initial_schema')
    applied_at TIMESTAMPTZ DEFAULT now()    -- وقت التطبيق — When the migration was applied
);

COMMENT ON TABLE schema_migrations
    IS 'جدول تتبع ترحيلات قاعدة البيانات — Tracks applied database migrations';

COMMENT ON COLUMN schema_migrations.version
    IS 'رقم النسخة التسلسلي — Sequential version number';

COMMENT ON COLUMN schema_migrations.name
    IS 'اسم وصفي للترحيل — Descriptive migration name';

COMMENT ON COLUMN schema_migrations.applied_at
    IS 'الطابع الزمني للتطبيق — Timestamp when migration was applied';

-- Record this bootstrap migration
INSERT INTO schema_migrations (version, name)
VALUES ('000', 'schema_migrations')
ON CONFLICT (version) DO NOTHING;

-- DOWN:
-- WARNING: Dropping this table removes all migration history.
-- تحذير: حذف هذا الجدول يزيل كل سجل الترحيلات.
-- DROP TABLE IF EXISTS schema_migrations;
