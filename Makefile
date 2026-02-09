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

.PHONY: help up down reset logs status db-shell db-init db-migrate redis-cli clean

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

db-migrate: ## Run database migrations (placeholder for future use)
	@echo "Database migration support is not yet implemented."
	@echo "Future migrations will be placed in db/migrations/ and run here."

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
