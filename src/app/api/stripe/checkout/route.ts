import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

const PRICE_ENV_POR_PLANO: Record<string, string | undefined> = {
  ESSENCIAL: process.env.NEXT_PUBLIC_STRIPE_PRICE_ESSENCIAL,
  MISTICO: process.env.NEXT_PUBLIC_STRIPE_PRICE_MISTICO,
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      {
        error:
          "Pagamentos ainda não configurados. Defina STRIPE_SECRET_KEY no .env para ativar o checkout.",
      },
      { status: 501 }
    );
  }

  const body = await request.json().catch(() => null);
  const planoId = body?.planoId as string | undefined;
  const priceId = planoId ? PRICE_ENV_POR_PLANO[planoId] : undefined;

  if (!planoId || !priceId) {
    return NextResponse.json(
      { error: "Plano inválido ou preço não configurado (NEXT_PUBLIC_STRIPE_PRICE_*)." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { subscription: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  let stripeCustomerId = user.subscription?.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    });
    stripeCustomerId = customer.id;

    await prisma.subscription.upsert({
      where: { userId: user.id },
      create: { userId: user.id, stripeCustomerId },
      update: { stripeCustomerId },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/assinatura?sucesso=1`,
    cancel_url: `${appUrl}/dashboard/assinatura?cancelado=1`,
    metadata: { userId: user.id, planoId },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
