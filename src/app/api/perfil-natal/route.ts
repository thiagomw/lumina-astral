import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const perfilSchema = z.object({
  nome: z.string().trim().min(1).max(100),
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  horaNascimento: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
  fusoMinutos: z.number().int().min(-720).max(840),
  cidade: z.string().trim().min(1).max(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = perfilSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  const { nome, dataNascimento, horaNascimento, fusoMinutos, cidade, latitude, longitude } =
    parsed.data;

  const localMillis = Date.parse(`${dataNascimento}T${horaNascimento}:00.000Z`);
  if (Number.isNaN(localMillis)) {
    return NextResponse.json({ error: "Data ou hora inválida" }, { status: 400 });
  }

  const dataHoraUtc = new Date(localMillis - fusoMinutos * 60_000);

  const perfil = await prisma.birthProfile.create({
    data: {
      userId: session.user.id,
      nome,
      dataHoraUtc,
      timezone: `UTC${fusoMinutos >= 0 ? "+" : "-"}${Math.abs(fusoMinutos / 60)
        .toString()
        .padStart(2, "0")}:${Math.abs(fusoMinutos % 60)
        .toString()
        .padStart(2, "0")}`,
      cidade,
      latitude,
      longitude,
    },
    select: { id: true },
  });

  return NextResponse.json({ perfil }, { status: 201 });
}
