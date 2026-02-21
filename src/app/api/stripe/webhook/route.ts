import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { PRICING_PLANS } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Resolve a Stripe Price ID to the corresponding SubscriptionTier.
 * Falls back to "PRO" if the price ID is not found in PRICING_PLANS.
 */
function tierFromPriceId(priceId: string): "FREE" | "PRO" | "TEAM" | "ENTERPRISE" {
  const plan = PRICING_PLANS.find((p) => p.stripePriceId === priceId);
  if (plan) return plan.tier as "PRO" | "TEAM" | "ENTERPRISE";
  return "PRO";
}

/**
 * Map Stripe subscription status to our internal SubscriptionStatus enum.
 */
function mapStripeStatus(
  stripeStatus: Stripe.Subscription.Status
): "ACTIVE" | "CANCELED" | "PAST_DUE" | "TRIALING" {
  switch (stripeStatus) {
    case "active":
      return "ACTIVE";
    case "trialing":
      return "TRIALING";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return "CANCELED";
    default:
      return "ACTIVE";
  }
}

// ---------------------------------------------------------------------------
// Webhook handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  let event: Stripe.Event;

  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      // -------------------------------------------------------------------
      // checkout.session.completed
      // -------------------------------------------------------------------
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId =
          session.client_reference_id ??
          (session.metadata?.userId as string | undefined);

        if (!userId) {
          console.error("checkout.session.completed: no userId found");
          break;
        }

        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        // Retrieve the subscription from Stripe to get price details
        const stripeSubscription =
          await stripe.subscriptions.retrieve(subscriptionId);

        const priceId = stripeSubscription.items.data[0]?.price?.id ?? "";
        const tier = tierFromPriceId(priceId);

        // Upsert the subscription record in the database
        await prisma.subscription.upsert({
          where: { userId },
          update: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            stripePriceId: priceId,
            tier,
            status: mapStripeStatus(stripeSubscription.status),
            currentPeriodStart: new Date(
              stripeSubscription.items.data[0]?.current_period_start
                ? stripeSubscription.items.data[0].current_period_start * 1000
                : Date.now()
            ),
            currentPeriodEnd: new Date(
              stripeSubscription.items.data[0]?.current_period_end
                ? stripeSubscription.items.data[0].current_period_end * 1000
                : Date.now()
            ),
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          },
          create: {
            userId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            stripePriceId: priceId,
            tier,
            status: mapStripeStatus(stripeSubscription.status),
            currentPeriodStart: new Date(
              stripeSubscription.items.data[0]?.current_period_start
                ? stripeSubscription.items.data[0].current_period_start * 1000
                : Date.now()
            ),
            currentPeriodEnd: new Date(
              stripeSubscription.items.data[0]?.current_period_end
                ? stripeSubscription.items.data[0].current_period_end * 1000
                : Date.now()
            ),
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          },
        });

        break;
      }

      // -------------------------------------------------------------------
      // customer.subscription.updated
      // -------------------------------------------------------------------
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const priceId = subscription.items.data[0]?.price?.id ?? "";
        const tier = tierFromPriceId(priceId);

        // Find the subscription by Stripe customer ID
        const existingSub = await prisma.subscription.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (!existingSub) {
          console.error(
            `customer.subscription.updated: no subscription found for customer ${customerId}`
          );
          break;
        }

        await prisma.subscription.update({
          where: { id: existingSub.id },
          data: {
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            tier,
            status: mapStripeStatus(subscription.status),
            currentPeriodStart: new Date(
              subscription.items.data[0]?.current_period_start
                ? subscription.items.data[0].current_period_start * 1000
                : Date.now()
            ),
            currentPeriodEnd: new Date(
              subscription.items.data[0]?.current_period_end
                ? subscription.items.data[0].current_period_end * 1000
                : Date.now()
            ),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
        });

        break;
      }

      // -------------------------------------------------------------------
      // customer.subscription.deleted
      // -------------------------------------------------------------------
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const existingSub = await prisma.subscription.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (!existingSub) {
          console.error(
            `customer.subscription.deleted: no subscription found for customer ${customerId}`
          );
          break;
        }

        await prisma.subscription.update({
          where: { id: existingSub.id },
          data: {
            tier: "FREE",
            status: "CANCELED",
            cancelAtPeriodEnd: false,
          },
        });

        break;
      }

      // -------------------------------------------------------------------
      // invoice.payment_failed
      // -------------------------------------------------------------------
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const existingSub = await prisma.subscription.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (!existingSub) {
          console.error(
            `invoice.payment_failed: no subscription found for customer ${customerId}`
          );
          break;
        }

        await prisma.subscription.update({
          where: { id: existingSub.id },
          data: {
            status: "PAST_DUE",
          },
        });

        break;
      }

      default:
        // Unhandled event type - log and acknowledge
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
