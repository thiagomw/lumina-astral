import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

const PLANO_POR_PRICE: Record<string, "ESSENCIAL" | "MISTICO"> = {};
if (process.env.NEXT_PUBLIC_STRIPE_PRICE_ESSENCIAL) {
  PLANO_POR_PRICE[process.env.NEXT_PUBLIC_STRIPE_PRICE_ESSENCIAL] = "ESSENCIAL";
}
if (process.env.NEXT_PUBLIC_STRIPE_PRICE_MISTICO) {
  PLANO_POR_PRICE[process.env.NEXT_PUBLIC_STRIPE_PRICE_MISTICO] = "MISTICO";
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const segredoWebhook = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !segredoWebhook) {
    return NextResponse.json(
      { error: "Stripe ainda não configurado." },
      { status: 501 }
    );
  }

  const assinatura = request.headers.get("stripe-signature");
  const corpoBruto = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(corpoBruto, assinatura ?? "", segredoWebhook);
  } catch {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : undefined;

      if (userId && subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;
        const plano = priceId ? PLANO_POR_PRICE[priceId] : undefined;

        if (plano) {
          await prisma.user.update({ where: { id: userId }, data: { plan: plano } });
        }

        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            stripeCustomerId:
              typeof session.customer === "string" ? session.customer : undefined,
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            status: subscription.status,
          },
          update: {
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            status: subscription.status,
          },
        });
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const registro = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });

      if (registro) {
        const ativa = subscription.status === "active" || subscription.status === "trialing";
        const priceId = subscription.items.data[0]?.price.id;
        const plano = ativa && priceId ? PLANO_POR_PRICE[priceId] ?? "FREE" : "FREE";

        await prisma.user.update({
          where: { id: registro.userId },
          data: { plan: plano },
        });

        await prisma.subscription.update({
          where: { userId: registro.userId },
          data: { status: subscription.status, stripePriceId: priceId },
        });
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ recebido: true });
}
