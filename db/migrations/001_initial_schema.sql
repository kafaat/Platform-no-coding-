-- ============================================================
-- Migration 001: Initial Schema
-- ترحيل 001: المخطط الأولي
--
-- Note / ملاحظة:
--   The full initial schema is defined in db/schema.sql.
--   This migration serves as the baseline marker, indicating
--   that the initial schema has been applied.
--
--   المخطط الأولي الكامل موجود في db/schema.sql.
--   هذا الترحيل يعمل كعلامة أساس تشير إلى أن المخطط الأولي
--   قد تم تطبيقه.
-- ============================================================

-- UP:
INSERT INTO schema_migrations (version, name)
VALUES ('001', 'initial_schema')
ON CONFLICT (version) DO NOTHING;

-- DOWN:
-- WARNING: Rolling back the initial schema drops ALL tables.
-- This is an extremely destructive operation.
-- تحذير: عكس المخطط الأولي يحذف جميع الجداول.
-- هذه عملية تدميرية بالغة الخطورة.
-- DELETE FROM schema_migrations WHERE version = '001';
