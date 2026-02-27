import Stripe from "stripe";

// Allow build/CI to run without real Stripe key (module only needs to load; runtime calls will fail if key missing).
const isBuildOrCI =
  process.env.CI === "true" ||
  process.env.NEXT_PHASE === "phase-production-build";

const stripeKey =
  process.env.STRIPE_SECRET_KEY ||
  (isBuildOrCI ? "sk_test_placeholder_for_build" : undefined);

if (!stripeKey) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(stripeKey, {
  apiVersion: "2025-12-15.clover",
  typescript: true,
});

export async function createStripeCustomer(email: string, name?: string) {
  return await stripe.customers.create({
    email,
    name,
  });
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  organizationId: string
) {
  return await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${(
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    ).replace(/\/$/, "")}/billing?success=true`,
    cancel_url: `${(
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    ).replace(/\/$/, "")}/billing?canceled=true`,
    metadata: {
      organizationId,
    },
    subscription_data: {
      metadata: {
        organizationId,
      },
    },
  });
}

export async function createPortalSession(customerId: string) {
  const baseUrl = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${baseUrl}/billing`,
  });
}

export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId);
}
