import { NextResponse } from "next/server";

interface ResultadoNominatim {
  display_name: string;
  lat: string;
  lon: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ resultados: [] });
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "6");
  url.searchParams.set("addressdetails", "0");

  const resposta = await fetch(url, {
    headers: {
      "User-Agent": "LuminaAstral/1.0 (mapa astral SaaS; contato via app)",
      "Accept-Language": "pt-BR",
    },
    next: { revalidate: 3600 },
  });

  if (!resposta.ok) {
    return NextResponse.json({ resultados: [] }, { status: 200 });
  }

  const dados = (await resposta.json()) as ResultadoNominatim[];

  const resultados = dados.map((item) => ({
    nome: item.display_name,
    latitude: Number(item.lat),
    longitude: Number(item.lon),
  }));

  return NextResponse.json({ resultados });
}
