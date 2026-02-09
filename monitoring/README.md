# Monitoring & Observability - Dynamic Product System

## Architecture Overview

The DPS monitoring stack follows the **OpenTelemetry** standard for collecting telemetry data and uses the **Prometheus + Grafana** stack for metrics storage, alerting, and visualization.

```
  +-----------------+     +-----------------+     +-----------------+
  |  DPS Services   |     |  PostgreSQL     |     |  Redis / Kafka  |
  |  (OTel SDK)     |     |  (pg_exporter)  |     |  (exporters)    |
  +--------+--------+     +--------+--------+     +--------+--------+
           |                        |                        |
           v                        v                        v
  +---------------------------------------------------------------------+
  |                    OpenTelemetry Collector                           |
  |  (receives, processes, exports metrics/traces/logs)                 |
  +--------+-------------------+-------------------+--------------------+
           |                   |                   |
           v                   v                   v
  +-----------------+  +-----------------+  +-----------------+
  |  Prometheus     |  |  Jaeger/Tempo   |  |  Loki           |
  |  (metrics)      |  |  (traces)       |  |  (logs)         |
  +--------+--------+  +--------+--------+  +--------+--------+
           |                   |                   |
           v                   v                   v
  +---------------------------------------------------------------------+
  |                         Grafana                                     |
  |  (dashboards, alerting, unified observability)                      |
  +---------------------------------------------------------------------+
           |
           v
  +-----------------+
  |  Alertmanager   |
  |  (routing,      |
  |   dedup,        |
  |   notifications)|
  +-----------------+
           |
     +-----+-----+-----+
     |           |       |
     v           v       v
   Slack      Email   PagerDuty
```

### Data Flow

1. **DPS application services** are instrumented with the OpenTelemetry SDK, which emits metrics, traces, and logs.
2. **Infrastructure exporters** (postgres_exporter, redis_exporter, kafka_exporter, node_exporter) expose Prometheus-format metrics from each component.
3. The **OpenTelemetry Collector** receives telemetry from all sources, applies processing (batching, filtering, enrichment), and exports to the appropriate backends.
4. **Prometheus** scrapes and stores time-series metrics, evaluates alerting rules defined in `prometheus/alerts.yml`.
5. **Alertmanager** handles alert routing, deduplication, grouping, and notification delivery.
6. **Grafana** provides dashboards (see `grafana/dashboards/`) and a unified query interface across all backends.

## Local Setup

### Prerequisites

- Docker and Docker Compose installed
- The base `docker-compose.yml` services (PostgreSQL, Redis, Kafka) running

### Adding Monitoring Services

Add the following services to your `docker-compose.yml` or create a `docker-compose.monitoring.yml` override file:

```yaml
# docker-compose.monitoring.yml
services:
  # OpenTelemetry Collector
  otel-collector:
    image: otel/opentelemetry-collector-contrib:latest
    container_name: dps-otel-collector
    restart: unless-stopped
    ports:
      - "4317:4317"   # OTLP gRPC
      - "4318:4318"   # OTLP HTTP
      - "8889:8889"   # Prometheus exporter
    volumes:
      - ./monitoring/otel/otel-collector-config.yaml:/etc/otelcol-contrib/config.yaml:ro
    networks:
      - dps-network

  # Prometheus
  prometheus:
    image: prom/prometheus:latest
    container_name: dps-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ./monitoring/prometheus/alerts.yml:/etc/prometheus/alerts.yml:ro
      - prometheus_data:/prometheus
    command:
      - "--config.file=/etc/prometheus/prometheus.yml"
      - "--storage.tsdb.retention.time=30d"
      - "--web.enable-lifecycle"
    networks:
      - dps-network

  # Alertmanager
  alertmanager:
    image: prom/alertmanager:latest
    container_name: dps-alertmanager
    restart: unless-stopped
    ports:
      - "9093:9093"
    volumes:
      - ./monitoring/prometheus/alertmanager.yml:/etc/alertmanager/alertmanager.yml:ro
    networks:
      - dps-network

  # Grafana
  grafana:
    image: grafana/grafana:latest
    container_name: dps-grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_USER: admin
      GF_SECURITY_ADMIN_PASSWORD: "${GRAFANA_ADMIN_PASSWORD:-admin}"
      GF_USERS_ALLOW_SIGN_UP: "false"
    volumes:
      - ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards:ro
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning:ro
      - grafana_data:/var/lib/grafana
    networks:
      - dps-network

  # PostgreSQL Exporter
  postgres-exporter:
    image: prometheuscommunity/postgres-exporter:latest
    container_name: dps-postgres-exporter
    restart: unless-stopped
    ports:
      - "9187:9187"
    environment:
      DATA_SOURCE_NAME: "postgresql://${DB_USER:-dps_admin}:${DB_PASSWORD}@postgres:5432/${DB_NAME:-dps_dev}?sslmode=disable"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - dps-network

  # Redis Exporter
  redis-exporter:
    image: oliver006/redis_exporter:latest
    container_name: dps-redis-exporter
    restart: unless-stopped
    ports:
      - "9121:9121"
    environment:
      REDIS_ADDR: "redis://redis:6379"
    depends_on:
      redis:
        condition: service_healthy
    networks:
      - dps-network

  # Kafka Exporter
  kafka-exporter:
    image: danielqsj/kafka-exporter:latest
    container_name: dps-kafka-exporter
    restart: unless-stopped
    ports:
      - "9308:9308"
    command:
      - "--kafka.server=kafka:9092"
    depends_on:
      kafka:
        condition: service_healthy
    networks:
      - dps-network

  # Node Exporter (host metrics)
  node-exporter:
    image: prom/node-exporter:latest
    container_name: dps-node-exporter
    restart: unless-stopped
    ports:
      - "9100:9100"
    networks:
      - dps-network

volumes:
  prometheus_data:
    driver: local
    name: dps-prometheus-data
  grafana_data:
    driver: local
    name: dps-grafana-data
```

### Starting the Monitoring Stack

```bash
# Start base services + monitoring
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d

# Verify all services are running
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml ps

# Access the UIs
#   Grafana:      http://localhost:3000  (admin / admin)
#   Prometheus:   http://localhost:9090
#   Alertmanager: http://localhost:9093
```

### Importing Dashboards

Dashboards are auto-provisioned from `monitoring/grafana/dashboards/` when using the provisioning volume mount. To set up provisioning, create `monitoring/grafana/provisioning/dashboards/default.yaml`:

```yaml
apiVersion: 1
providers:
  - name: "DPS Dashboards"
    orgId: 1
    folder: "DPS"
    type: file
    disableDeletion: false
    editable: true
    updateIntervalSeconds: 30
    options:
      path: /var/lib/grafana/dashboards
      foldersFromFilesStructure: false
```

## Alert Escalation Policy

Alerts are classified into three severity levels with distinct escalation paths:

### Severity: Critical

| Attribute | Value |
|---|---|
| Response Time | Immediate (within 15 minutes) |
| Notification | PagerDuty + Slack #dps-incidents + Email |
| Escalation | If unacknowledged after 15min, escalate to engineering lead |
| Examples | HighErrorRate, PostgresConnectionPool, DiskSpaceHigh, NumberingSequenceNearLimit, PaymentProcessingFailure |

### Severity: Warning

| Attribute | Value |
|---|---|
| Response Time | Within 1 hour during business hours |
| Notification | Slack #dps-alerts + Email |
| Escalation | If unresolved after 4 hours, escalate to team lead |
| Examples | HighLatency, TooManyRequests, HighOverdueRate, RedisMemoryHigh, KafkaConsumerLag |

### Severity: Info

| Attribute | Value |
|---|---|
| Response Time | Next business day |
| Notification | Slack #dps-monitoring |
| Escalation | Review in weekly operations meeting |
| Examples | Capacity trend warnings, non-urgent threshold approaches |

### On-Call Rotation

- **Primary on-call**: Platform engineering team (weekly rotation)
- **Secondary on-call**: Service-specific team leads
- **Escalation chain**: On-call engineer -> Team Lead -> Engineering Manager -> CTO

## Key Metrics to Watch

### API Health (SLO Targets)

| Metric | Target | Alert Threshold | Description |
|---|---|---|---|
| Request rate | Baseline dependent | Anomaly detection | Requests per second by endpoint |
| Error rate (5xx) | < 0.1% | > 1% for 5min | Server-side error percentage |
| P95 latency | < 200ms (pricing) | > 500ms for 5min | 95th percentile response time |
| P95 latency | < 400ms (numbering) | > 500ms for 5min | 95th percentile response time |
| Availability | 99.9% read / 99.5% write | < 99% in 1h window | Uptime percentage |

### Business Metrics

| Metric | Healthy Range | Alert Threshold | Description |
|---|---|---|---|
| Active contracts | Growing | Sudden drop | Total contracts in ACTIVE status |
| Overdue rate | < 10% | > 20% for 15min | IN_ARREARS / ACTIVE ratio |
| Collection rate | > 95% | < 85% | Collected / Due amount ratio |
| Write-off rate | < 2% | > 5% | WRITTEN_OFF / Total ratio |
| Hold-to-confirm rate | > 80% | < 50% | Reservation conversion rate |
| Payment failures | 0 | > 5 in 10min | Failed payment transactions |
| Reservation expiries | Low | > 50 in 1h | HOLD -> EXPIRED transitions |
| Numbering capacity | < 80% | > 90% | Sequence utilization |

### Infrastructure

| Metric | Healthy Range | Alert Threshold | Description |
|---|---|---|---|
| PG connections | < 50% of max | > 80% of max | Active database connections |
| PG cache hit ratio | > 99% | < 95% | Buffer cache effectiveness |
| PG queries/sec | Baseline dependent | Anomaly detection | Transaction throughput |
| Redis memory | < 60% | > 80% | Memory utilization |
| Redis hit rate | > 95% | < 80% | Cache effectiveness |
| Kafka consumer lag | < 100 | > 1000 for 10min | Message processing delay |
| Disk usage | < 70% | > 85% | Storage utilization |

## Runbook Index

Each alert includes a `runbook_url` annotation linking to detailed remediation steps. Below is the index of available runbooks:

| Runbook | Alert | Description |
|---|---|---|
| [api/high-error-rate](https://wiki.dps.local/runbooks/api/high-error-rate) | HighErrorRate | Diagnose and resolve elevated 5xx errors |
| [api/high-latency](https://wiki.dps.local/runbooks/api/high-latency) | HighLatency | Investigate slow API responses |
| [api/rate-limiting](https://wiki.dps.local/runbooks/api/rate-limiting) | TooManyRequests | Handle rate limit violations |
| [business/high-overdue-rate](https://wiki.dps.local/runbooks/business/high-overdue-rate) | HighOverdueRate | Portfolio quality deterioration |
| [business/payment-failure](https://wiki.dps.local/runbooks/business/payment-failure) | PaymentProcessingFailure | Payment processing issues |
| [business/reservation-expiry-spike](https://wiki.dps.local/runbooks/business/reservation-expiry-spike) | ReservationExpirySpike | Excessive reservation timeouts |
| [business/numbering-sequence-limit](https://wiki.dps.local/runbooks/business/numbering-sequence-limit) | NumberingSequenceNearLimit | Sequence capacity exhaustion |
| [infra/postgres-connection-pool](https://wiki.dps.local/runbooks/infra/postgres-connection-pool) | PostgresConnectionPool | Database connection saturation |
| [infra/postgres-cache-hit](https://wiki.dps.local/runbooks/infra/postgres-cache-hit) | PostgresCacheHitRatio | Buffer cache performance |
| [infra/redis-memory](https://wiki.dps.local/runbooks/infra/redis-memory) | RedisMemoryHigh | Redis memory pressure |
| [infra/kafka-consumer-lag](https://wiki.dps.local/runbooks/infra/kafka-consumer-lag) | KafkaConsumerLag | Event processing delays |
| [infra/disk-space](https://wiki.dps.local/runbooks/infra/disk-space) | DiskSpaceHigh | Storage capacity issues |

## File Structure

```
monitoring/
├── README.md                                  # This file
├── grafana/
│   ├── dashboards/
│   │   └── dps-overview.json                  # Main overview dashboard
│   └── provisioning/                          # (to be created)
│       └── dashboards/
│           └── default.yaml                   # Dashboard provisioning config
└── prometheus/
    ├── alerts.yml                             # Alerting rules
    ├── prometheus.yml                         # (to be created) Scrape config
    └── alertmanager.yml                       # (to be created) Notification routing
```

## Custom Metrics Reference

The DPS application exposes the following custom Prometheus metrics:

### API Metrics

| Metric | Type | Labels | Description |
|---|---|---|---|
| `dps_api_requests_total` | Counter | `tenant_id`, `endpoint`, `method`, `status_code` | Total API requests |
| `dps_api_request_duration_seconds` | Histogram | `tenant_id`, `endpoint`, `method` | Request latency distribution |

### Business Metrics

| Metric | Type | Labels | Description |
|---|---|---|---|
| `dps_contracts_active_total` | Gauge | `tenant_id` | Active contracts count |
| `dps_contracts_by_status` | Gauge | `tenant_id`, `status` | Contracts grouped by status |
| `dps_disbursements_total_amount` | Counter | `tenant_id`, `currency` | Cumulative disbursement amount |
| `dps_collections_total_amount` | Counter | `tenant_id`, `currency` | Cumulative collection amount |
| `dps_installments_due_amount` | Gauge | `tenant_id`, `currency` | Total due installment amount |
| `dps_payment_failures_total` | Counter | `tenant_id`, `reason` | Payment processing failures |
| `dps_portfolio_aging_bucket` | Gauge | `tenant_id`, `bucket` | Contracts per aging bucket |
| `dps_portfolio_overdue_amount` | Gauge | `tenant_id`, `currency` | Total overdue amount |
| `dps_numbering_sequence_current` | Gauge | `scheme_name` | Current sequence value |
| `dps_numbering_sequence_max` | Gauge | `scheme_name` | Maximum sequence value |

### Reservation Metrics

| Metric | Type | Labels | Description |
|---|---|---|---|
| `dps_reservations_active` | Gauge | `tenant_id`, `status` | Active reservations (HOLD + CONFIRMED) |
| `dps_reservations_created_total` | Counter | `tenant_id` | Total reservations created |
| `dps_reservations_confirmed_total` | Counter | `tenant_id` | Total reservations confirmed |
| `dps_reservations_cancelled_total` | Counter | `tenant_id` | Total reservations cancelled |
| `dps_reservations_expired_total` | Counter | `tenant_id` | Total reservations expired |
| `dps_reservation_hold_duration_seconds` | Summary | `tenant_id` | Time spent in HOLD status |

## Multi-Tenancy in Monitoring

All DPS custom metrics include a `tenant_id` label, enabling per-tenant monitoring and alerting. The Grafana dashboard includes a `tenant_id` template variable that filters all panels.

For tenant-specific alerting, add tenant label matchers to alert expressions:

```yaml
# Example: Alert only for tenant "tenant-001"
expr: |
  sum(dps_contracts_by_status{tenant_id="tenant-001", status="IN_ARREARS"})
  / sum(dps_contracts_by_status{tenant_id="tenant-001", status="ACTIVE"})
  > 0.20
```
