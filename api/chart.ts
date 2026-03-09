// api/chart.ts
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

export const config = { runtime: "edge" };

// Helper biar lebih clean
const el = (type: string, style: Record<string, any>, children?: any) => ({
  type,
  props: { style, children },
});

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);

  const data = JSON.parse(searchParams.get("data") || "[]") as number[];
  const labels = JSON.parse(searchParams.get("labels") || "[]") as string[];
  const title = searchParams.get("title") || "";
  const color = searchParams.get("color") || "#4e8ef7";

  const W = 520;
  const H = 280;
  const chartH = 180;
  const max = Math.max(...data) || 100;

  const node = el(
    "div",
    {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: `${W}px`,
      height: `${H}px`,
      background: "white",
      padding: "16px 20px 0",
      fontFamily: "sans-serif",
    },
    [
      // Title
      title
        ? el(
            "div",
            {
              fontSize: 13,
              fontWeight: "bold",
              color: "#374151",
              marginBottom: 16,
              display: "flex",
            },
            title,
          )
        : null,

      // Bars
      el(
        "div",
        {
          display: "flex",
          alignItems: "flex-end",
          gap: "16px",
          height: `${chartH}px`,
          borderBottom: "1.5px solid #9ca3af",
        },
        data.map((value, i) =>
          el(
            "div",
            {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            },
            [
              el(
                "div",
                {
                  fontSize: 11,
                  fontWeight: "bold",
                  color,
                  marginBottom: 4,
                  display: "flex",
                },
                String(value),
              ),

              el("div", {
                width: "48px",
                height: `${(value / max) * chartH * 0.85}px`,
                background: color,
                display: "flex",
              }),
            ],
          ),
        ),
      ),

      // X Labels
      el(
        "div",
        {
          display: "flex",
          gap: "16px",
          marginTop: 8,
        },
        labels.map((label) =>
          el(
            "div",
            {
              width: "48px",
              fontSize: 11,
              color: "#374151",
              textAlign: "center",
              display: "flex",
            },
            label,
          ),
        ),
      ),
    ].filter(Boolean),
  );

  const svg = await satori(node as any, {
    width: W,
    height: H,
    fonts: [],
  });

  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: W } });
  const png = resvg.render().asPng();
  const buffer = new Uint8Array(png);

  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
