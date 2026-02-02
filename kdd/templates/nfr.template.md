---
# @type: nfr
# @description: Non-functional requirement
# @file-pattern: ^NFR-.+\.md$
# @path-pattern: quality/

id: NFR-Name                  # @optional @pattern: ^NFR-.+
kind: nfr                     # @literal: nfr
status: proposed              # @enum: draft|proposed|approved|deprecated @default: proposed
category: performance         # @optional @enum: performance|availability|security|scalability|usability|maintainability
---

# NFR: Requirement Name <!-- required -->

## Category <!-- optional -->

Performance | Availability | Security | Scalability | Usability | Maintainability | Observability

## Goal <!-- required alias: Objective|Target -->

Clear description of the quality goal:
- What is to be achieved
- Why it is important
- Impact if not met

## SLI (Service Level Indicator) <!-- optional -->

Specific metric to be measured:

```
metric_name{labels}
```

Examples:
- `http_request_duration_seconds{route="/api/endpoint", quantile="0.95"}`
- `error_rate{service="api"}`
- `availability_percentage{service="web"}`

## SLO (Service Level Objective) <!-- optional -->

Concrete objective:

| Metric | Target | Window |
|--------|--------|--------|
| P95 latency | < 500ms | 30 days |
| Error rate | < 0.1% | 7 days |
| Uptime | 99.9% | Monthly |

## Strategies <!-- optional alias: Implementation -->

How the objective will be achieved:

- **Caching**: Caching strategy
- **CDN**: CDN usage for assets
- **Database**: Indexes, optimized queries
- **Architecture**: Architectural patterns
- **Monitoring**: Alerts and dashboards

## Measurement <!-- optional -->

How it is measured and monitored:

- **Tool**: Prometheus, Datadog, etc.
- **Dashboard**: Link to dashboard
- **Alerts**: Alert conditions

## Affected Use Cases <!-- optional -->

- [[UC-NNN-Name]] - How it affects
- [[UC-MMM-Name]] - How it affects

## Trade-offs <!-- optional -->

Accepted trade-offs:
- Trade-off 1: Description
- Trade-off 2: Description
