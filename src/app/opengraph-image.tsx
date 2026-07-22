import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Lumina Astral — descubra o que os astros contam sobre você";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 25% 15%, #2b1f42 0%, #0b0710 55%, #0b0710 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 88,
            fontWeight: 700,
            color: "#f4ede9",
          }}
        >
          Lumina Astral
        </div>
        <div
          style={{
            marginTop: 30,
            fontSize: 34,
            color: "#c9cedb",
            maxWidth: 840,
            textAlign: "center",
          }}
        >
          Descubra o que os astros contam sobre você
        </div>
        <div
          style={{
            marginTop: 44,
            fontSize: 22,
            color: "#8b90a0",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Cálculo astronômico real · Sol · Lua · Ascendente
        </div>
      </div>
    ),
    { ...size }
  );
}
