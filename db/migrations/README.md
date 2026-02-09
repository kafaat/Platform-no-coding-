# Database Migrations / ترحيلات قاعدة البيانات

## Overview / نظرة عامة

This directory contains sequential database migrations for the Dynamic Product System.
Each migration modifies the database schema in a controlled, versioned, and reversible manner.

يحتوي هذا المجلد على ترحيلات قاعدة البيانات المتسلسلة لنظام المنتجات الديناميكي.
كل ترحيل يعدّل مخطط قاعدة البيانات بطريقة مُحكمة ومُرقّمة وقابلة للعكس.

## Migration Strategy / استراتيجية الترحيل

### Naming Convention / اصطلاح التسمية

Migrations follow the pattern: `NNN_description.sql`

- `NNN` — Three-digit sequential number (001, 002, 003, ...)
- `description` — Short snake_case description of the change

Examples:
```
000_schema_migrations.sql
001_initial_schema.sql
002_add_notification_preferences.sql
003_add_notification_log.sql
```

### Structure / الهيكل

Each migration file contains two clearly marked sections:

```sql
-- Migration NNN: Description
-- Description of what this migration does

-- UP:
-- SQL statements to apply the migration forward

-- DOWN:
-- SQL statements to reverse the migration (commented out for safety)
```

- **UP** section: Executed when migrating forward. Contains the actual DDL/DML.
- **DOWN** section: Provided as commented-out SQL for manual rollback if needed.

### Tracking / التتبع

All applied migrations are recorded in the `schema_migrations` table:

```sql
CREATE TABLE schema_migrations (
    version TEXT PRIMARY KEY,       -- e.g., '001', '002'
    name    TEXT NOT NULL,          -- e.g., 'initial_schema'
    applied_at TIMESTAMPTZ DEFAULT now()
);
```

Before applying a migration, the runner checks whether its version already exists
in `schema_migrations`. If it does, the migration is skipped.

### Execution Order / ترتيب التنفيذ

Migrations are applied in **strict sequential order** based on the numeric prefix.
The migration runner (`make db-migrate`) processes files sorted by filename,
skipping any version already present in `schema_migrations`.

### Rules / القواعد

| Rule | Description |
|------|-------------|
| **Never modify existing migrations** | Once a migration has been applied (even locally), create a new migration instead of editing an old one. لا تعدّل ترحيلاً موجوداً أبداً. |
| **Idempotency** | Use `IF NOT EXISTS` / `IF EXISTS` where possible so re-running is safe. استخدم عبارات الوجود المشروط. |
| **One concern per migration** | Each migration should address a single logical change. كل ترحيل يعالج تغييراً منطقياً واحداً. |
| **Always include DOWN** | Even if commented out, provide rollback SQL for documentation. وفّر دائماً أوامر العكس. |
| **Multi-tenancy** | Every new tenant-scoped table must include `tenant_id` and RLS policy. كل جدول جديد يجب أن يتضمن عزل المستأجر. |
| **Test before committing** | Run migrations against a fresh database before pushing. اختبر قبل الدفع. |

### Makefile Targets / أهداف Makefile

```bash
make db-migrate          # Run all pending migrations / تشغيل الترحيلات المعلقة
make db-migrate-status   # Show applied vs pending / عرض حالة الترحيلات
make db-migrate-create   # Create a new migration file / إنشاء ملف ترحيل جديد
```

### Creating a New Migration / إنشاء ترحيل جديد

```bash
make db-migrate-create NAME=add_audit_columns
# Creates: db/migrations/004_add_audit_columns.sql (next available number)
```

### Manual Rollback / العكس اليدوي

Rollbacks are intentionally manual. To rollback a migration:

1. Open the migration file
2. Find the `-- DOWN:` section
3. Uncomment and review the SQL statements
4. Execute them manually via `make db-shell`
5. Remove the corresponding row from `schema_migrations`

This deliberate approach prevents accidental data loss in production.
هذا النهج المتعمّد يمنع فقدان البيانات غير المقصود في بيئة الإنتاج.

## File Inventory / فهرس الملفات

| File | Description |
|------|-------------|
| `000_schema_migrations.sql` | Creates the migration tracking table / جدول تتبع الترحيلات |
| `001_initial_schema.sql` | Baseline marker for `db/schema.sql` / علامة الأساس للمخطط الأولي |
| `002_add_notification_preferences.sql` | Customer notification preferences / تفضيلات إشعارات العملاء |
| `003_add_notification_log.sql` | Notification delivery log / سجل تسليم الإشعارات |
