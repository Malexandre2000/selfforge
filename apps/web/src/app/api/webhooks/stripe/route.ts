import type Stripe from "stripe";
import { db } from "@/server/db/client";
import { subscriptions } from "@/server/db/schema";
import { stripe, planFromPriceId } from "@/server/stripe/client";

async function upsertFromSubscription(subscription: Stripe.Subscription, userId?: string) {
  const resolvedUserId = userId ?? subscription.metadata.userId;
  if (!resolvedUserId) {
    console.error("Stripe subscription has no userId metadata", subscription.id);
    return;
  }

  const item = subscription.items.data[0];
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

  await db
    .insert(subscriptions)
    .values({
      userId: resolvedUserId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      plan: planFromPriceId(item?.price.id),
      currentPeriodEnd: item ? new Date(item.current_period_end * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        plan: planFromPriceId(item?.price.id),
        currentPeriodEnd: item ? new Date(item.current_period_end * 1000) : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date(),
      },
    });
}

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Stripe webhook signature verification failed", err);
    return new Response("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.mode === "subscription" && session.subscription) {
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription.id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await upsertFromSubscription(subscription, session.client_reference_id ?? undefined);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await upsertFromSubscription(event.data.object);
      break;
    }
    default:
      break;
  }

  return new Response(null, { status: 200 });
}
