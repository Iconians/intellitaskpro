# ADR 0001: Multi-Tenant Architecture

## Status
Accepted

## Context

IntelliTaskPro is designed as a SaaS platform where multiple organizations share the same infrastructure while maintaining strict data isolation.

Each organization requires:

- isolated project boards
- isolated members
- isolated usage limits
- independent billing

The system must support thousands of organizations without requiring separate databases per tenant.

## Decision

The system uses a **shared PostgreSQL database with tenant scoping**.

Every domain entity is scoped by `organizationId`.

Example:

- Boards
- Tasks
- Members
- Sprints

Authorization checks ensure that users can only access resources belonging to organizations where they are members.

## Consequences

**Advantages:**

- simpler infrastructure
- easier analytics and reporting
- lower operational cost
- scalable with PostgreSQL indexing

**Trade-offs:**

- strict access control enforcement required
- careful query design to avoid cross-tenant data leaks
