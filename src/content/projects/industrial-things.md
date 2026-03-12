---
title: "Industrial Things"
description: "An Industrial IoT platform for manufacturing monitoring, OEE analytics, and event-driven alerting. Built with Go, TimescaleDB, and Apache Kafka to ingest and process real-time machine telemetry from CNC machines and industrial equipment."
pubDate: "2025-01-15"
heroImage: "../../assets/projects/industrial-things-hero.png"
tags: ["Favorite", "Go", "IoT", "Platform", "Event-Driven"]
stack: ["Go", "TimescaleDB", "Apache Kafka", "Gin", "Docker", "Kubernetes", "Helm", "Prometheus", "sqlc"]
repoUrl: ""
featured: true
role: "Sole Architect & Developer"
timeline: "2024 — Present"
category: "Industrial IoT Platform"
highlights:
  - { label: "Microservices", value: "7" }
  - { label: "Kafka Consumers", value: "5" }
  - { label: "API Endpoints", value: "20+" }
  - { label: "Domain Packages", value: "16" }
  - { label: "Notification Channels", value: "5" }
  - { label: "Language", value: "Go" }
sections:
  - { id: "architecture", title: "Architecture", icon: "tree-structure" }
  - { id: "features", title: "Features", icon: "lightning" }
  - { id: "tech-stack", title: "Tech Stack", icon: "code" }
  - { id: "event-system", title: "Event System", icon: "broadcast" }
  - { id: "oee", title: "OEE Analytics", icon: "chart-line" }
---

Industrial Things is a high-performance, event-driven Industrial IoT platform designed to ingest, process, and analyze real-time telemetry from manufacturing environments. Built primarily to monitor CNC machines and industrial equipment using the MTConnect standard, the platform transforms raw shop-floor data into actionable insights, automated workflows, and precise OEE (Overall Equipment Effectiveness) metrics.

### The Problem

Modern manufacturing facilities generate a massive amount of telemetry data, but it is often siloed, difficult to query historically, and disconnected from maintenance and operational workflows. Tracking the true efficiency of a machine requires correlating its real-time operating state with ongoing labor activities, active production jobs, and rigid maintenance schedules.

### The Solution

I designed Industrial Things as a distributed, 7-service microservice architecture built with Go, Apache Kafka, and TimescaleDB. It acts as the central nervous system for the shop floor:

- **High-Volume Ingestion**: Real-time IoT observations (events, samples, conditions) are streamed directly from edge devices into Kafka topics.
- **Precision Analytics**: It calculates OEE (Availability × Performance × Quality) with strict downtime categorization and short-stop detection.
- **Event-Driven Workflows**: A robust plugin-based event system evaluates thousands of rules per second, dispatching alerts via Webhooks, Slack, Teams, Email, and SMS.
- **Automated Maintenance**: By integrating with Limble CMMS, the platform translates real-time machine runtime thresholds directly into automated maintenance work orders.
- **Hierarchical Modeling**: A flexible organizational model tracks sites, facilities, value streams, devices, and individual components.

The platform is designed for uncompromising reliability, utilizing transactional outbox patterns, exponential backoff retries, and comprehensive Prometheus observability across all services to ensure no critical event is ever missed.
