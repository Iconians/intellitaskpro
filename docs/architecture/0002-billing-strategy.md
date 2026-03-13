# ADR 0002: Stripe-Based Subscription Billing

## Status
Accepted

## Context

The platform requires recurring billing with plan-based limits and upgrade flows.

## Decision

Stripe is used for subscription billing.

- **Stripe Checkout** handles payment collection.
- **Stripe Webhooks** synchronize subscription status.

Subscription state is mirrored locally in the database to avoid API calls to Stripe on every request.

## Consequences

**Advantages:**

- PCI compliance handled by Stripe
- reliable billing infrastructure
- simple upgrade/downgrade flows

**Trade-offs:**

- webhook reliability must be monitored
- billing logic split between Stripe and application database
