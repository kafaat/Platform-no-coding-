# ============================================================
# Dynamic Product System — Development Makefile
#
# Usage:
#   make help       Show all available targets
#   make up         Start all services
#   make down       Stop all services
#   make reset      Destroy and recreate everything
#   make logs       Follow service logs
#   make status     Show service status
#
# Prerequisites:
#   - Docker and Docker Compose installed
#   - .env file configured (copy from .env.example)
# ============================================================

COMPOSE := docker compose
COMPOSE_FILE := docker-compose.yml
POSTGRES_CONTAINER := dps-postgres
REDIS_CONTAINER := dps-redis

# Load .env if it exists
ifneq (,$(wildcard ./.env))
	include .env
	export
endif

.PHONY: help up down reset logs status db-shell db-init db-migrate db-migrate-status db-migrate-create redis-cli clean

# ----------------------------------------------------------
# Default target
# ----------------------------------------------------------
help: ## Show all available targets
	@echo ""
	@echo "Dynamic Product System — Development Commands"
	@echo "=============================================="
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Getting started:"
	@echo "  1. cp .env.example .env"
	@echo "  2. Edit .env with your passwords"
	@echo "  3. make up"
	@echo ""

# ----------------------------------------------------------
# Docker Compose lifecycle
# ----------------------------------------------------------
up: ## Start all services in the background
	@echo "Starting DPS development environment..."
	@if [ ! -f .env ]; then \
		echo "Error: .env file not found. Run 'cp .env.example .env' first."; \
		exit 1; \
	fi
	$(COMPOSE) -f $(COMPOSE_FILE) up -d
	@echo ""
	@echo "Services starting. Run 'make status' to check health."
	@echo "  PostgreSQL : localhost:$${DB_PORT:-5432}"
	@echo "  Redis      : localhost:$${REDIS_PORT:-6379}"
	@echo "  Kafka      : localhost:9092"
	@echo "  pgAdmin    : http://localhost:5050"

down: ## Stop all services
	@echo "Stopping DPS development environment..."
	$(COMPOSE) -f $(COMPOSE_FILE) down

reset: ## Destroy everything (volumes included) and recreate
	@echo "Resetting DPS development environment..."
	@echo "WARNING: This will delete all data (databases, caches, topics)."
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 1
	$(COMPOSE) -f $(COMPOSE_FILE) down -v --remove-orphans
	$(COMPOSE) -f $(COMPOSE_FILE) up -d
	@echo "Environment reset complete."

logs: ## Follow logs from all services
	$(COMPOSE) -f $(COMPOSE_FILE) logs -f

status: ## Show status of all services
	$(COMPOSE) -f $(COMPOSE_FILE) ps

# ----------------------------------------------------------
# Database operations
# ----------------------------------------------------------
db-shell: ## Open psql shell in the postgres container
	@docker exec -it $(POSTGRES_CONTAINER) \
		psql -U $${DB_USER:-dps_admin} -d $${DB_NAME:-dps_dev}

db-init: ## Manually run schema.sql and seed.sql against the database
	@echo "Initializing database schema..."
	@docker exec -i $(POSTGRES_CONTAINER) \
		psql -U $${DB_USER:-dps_admin} -d $${DB_NAME:-dps_dev} < db/schema.sql
	@echo "Loading seed data..."
	@docker exec -i $(POSTGRES_CONTAINER) \
		psql -U $${DB_USER:-dps_admin} -d $${DB_NAME:-dps_dev} < db/seed.sql
	@echo "Database initialization complete."

DB_USER_FLAG := -U $${DB_USER:-dps_admin}
DB_NAME_FLAG := -d $${DB_NAME:-dps_dev}
MIGRATIONS_DIR := db/migrations

db-migrate: ## Run all pending migrations in order / تشغيل الترحيلات المعلقة
	@echo "Running database migrations..."
	@echo "تشغيل ترحيلات قاعدة البيانات..."
	@echo ""
	@# Ensure schema_migrations table exists (bootstrap migration 000)
	@docker exec -i $(POSTGRES_CONTAINER) \
		psql $(DB_USER_FLAG) $(DB_NAME_FLAG) -v ON_ERROR_STOP=1 < $(MIGRATIONS_DIR)/000_schema_migrations.sql > /dev/null 2>&1
	@APPLIED=0; SKIPPED=0; FAILED=0; \
	for migration in $$(ls $(MIGRATIONS_DIR)/*.sql | sort); do \
		VERSION=$$(basename $$migration | cut -d'_' -f1); \
		NAME=$$(basename $$migration .sql | sed 's/^[0-9]*_//'); \
		if [ "$$VERSION" = "000" ]; then continue; fi; \
		EXISTS=$$(docker exec -i $(POSTGRES_CONTAINER) \
			psql $(DB_USER_FLAG) $(DB_NAME_FLAG) -tAc \
			"SELECT COUNT(*) FROM schema_migrations WHERE version = '$$VERSION';" 2>/dev/null); \
		if [ "$$EXISTS" = "1" ]; then \
			SKIPPED=$$((SKIPPED + 1)); \
			echo "  SKIP  $$VERSION — $$NAME (already applied / مُطبّق مسبقاً)"; \
		else \
			echo "  APPLY $$VERSION — $$NAME ..."; \
			if docker exec -i $(POSTGRES_CONTAINER) \
				psql $(DB_USER_FLAG) $(DB_NAME_FLAG) -v ON_ERROR_STOP=1 < $$migration > /dev/null 2>&1; then \
				APPLIED=$$((APPLIED + 1)); \
				echo "    OK (applied successfully / تم التطبيق بنجاح)"; \
			else \
				FAILED=$$((FAILED + 1)); \
				echo "    FAIL (error applying migration / خطأ في التطبيق)"; \
				echo ""; \
				echo "Migration failed. Stopping. / فشل الترحيل. توقف."; \
				exit 1; \
			fi; \
		fi; \
	done; \
	echo ""; \
	echo "Migration summary / ملخص الترحيلات:"; \
	echo "  Applied / مُطبّق:  $$APPLIED"; \
	echo "  Skipped / مُتجاوز: $$SKIPPED"; \
	echo "  Failed / فاشل:    $$FAILED"; \
	echo "Done. / تم."

db-migrate-status: ## Show migration status / عرض حالة الترحيلات
	@echo "Migration Status / حالة الترحيلات"
	@echo "========================================"
	@echo ""
	@# Check if schema_migrations table exists
	@TABLE_EXISTS=$$(docker exec -i $(POSTGRES_CONTAINER) \
		psql $(DB_USER_FLAG) $(DB_NAME_FLAG) -tAc \
		"SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='schema_migrations');" 2>/dev/null); \
	if [ "$$TABLE_EXISTS" != "t" ]; then \
		echo "  schema_migrations table does not exist."; \
		echo "  جدول تتبع الترحيلات غير موجود."; \
		echo "  Run 'make db-migrate' to initialize."; \
		echo ""; \
	else \
		echo "Applied migrations / الترحيلات المُطبّقة:"; \
		docker exec -i $(POSTGRES_CONTAINER) \
			psql $(DB_USER_FLAG) $(DB_NAME_FLAG) -c \
			"SELECT version, name, applied_at FROM schema_migrations ORDER BY version;" 2>/dev/null; \
		echo ""; \
	fi
	@echo "Available migration files / ملفات الترحيل المتاحة:"
	@for migration in $$(ls $(MIGRATIONS_DIR)/*.sql 2>/dev/null | sort); do \
		VERSION=$$(basename $$migration | cut -d'_' -f1); \
		NAME=$$(basename $$migration .sql | sed 's/^[0-9]*_//'); \
		echo "  $$VERSION — $$NAME"; \
	done
	@echo ""

db-migrate-create: ## Create a new migration file / إنشاء ملف ترحيل جديد
	@if [ -z "$(NAME)" ]; then \
		echo "Usage: make db-migrate-create NAME=description"; \
		echo "Example: make db-migrate-create NAME=add_audit_columns"; \
		echo ""; \
		echo "الاستخدام: make db-migrate-create NAME=وصف_الترحيل"; \
		exit 1; \
	fi
	@LAST=$$(ls $(MIGRATIONS_DIR)/*.sql 2>/dev/null | sort | tail -1 | xargs basename | cut -d'_' -f1); \
	NEXT=$$(printf "%03d" $$(( $${LAST:-0} + 1 )) ); \
	FILE="$(MIGRATIONS_DIR)/$${NEXT}_$(NAME).sql"; \
	echo "-- ============================================================" > $$FILE; \
	echo "-- Migration $${NEXT}: $(NAME)" >> $$FILE; \
	echo "-- ترحيل $${NEXT}: $(NAME)" >> $$FILE; \
	echo "--" >> $$FILE; \
	echo "-- Purpose / الغرض:" >> $$FILE; \
	echo "--   TODO: Describe what this migration does" >> $$FILE; \
	echo "--   TODO: صف ما يفعله هذا الترحيل" >> $$FILE; \
	echo "-- ============================================================" >> $$FILE; \
	echo "" >> $$FILE; \
	echo "-- UP:" >> $$FILE; \
	echo "" >> $$FILE; \
	echo "-- TODO: Add your migration SQL here" >> $$FILE; \
	echo "-- TODO: أضف أوامر SQL الخاصة بالترحيل هنا" >> $$FILE; \
	echo "" >> $$FILE; \
	echo "INSERT INTO schema_migrations (version, name)" >> $$FILE; \
	echo "VALUES ('$${NEXT}', '$(NAME)')" >> $$FILE; \
	echo "ON CONFLICT (version) DO NOTHING;" >> $$FILE; \
	echo "" >> $$FILE; \
	echo "-- DOWN:" >> $$FILE; \
	echo "-- TODO: Add rollback SQL here (commented out)" >> $$FILE; \
	echo "-- TODO: أضف أوامر العكس هنا (كتعليق)" >> $$FILE; \
	echo "-- DELETE FROM schema_migrations WHERE version = '$${NEXT}';" >> $$FILE; \
	echo ""; \
	echo "Created migration file / تم إنشاء ملف الترحيل:"; \
	echo "  $$FILE"

# ----------------------------------------------------------
# Redis operations
# ----------------------------------------------------------
redis-cli: ## Open redis-cli in the redis container
	@docker exec -it $(REDIS_CONTAINER) redis-cli

# ----------------------------------------------------------
# Cleanup
# ----------------------------------------------------------
clean: ## Remove all containers, volumes, and networks
	@echo "Cleaning up all DPS Docker resources..."
	$(COMPOSE) -f $(COMPOSE_FILE) down -v --remove-orphans --rmi local
	@echo "Cleanup complete."
