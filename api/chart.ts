export const config = { runtime: "nodejs" };
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const data = JSON.parse((req.query.data as string) || "[]") as number[];
  const labels = JSON.parse((req.query.labels as string) || "[]") as string[];
  const title = (req.query.title as string) || "";
  const color = (req.query.color as string) || "#4e8ef7";

  const W = 520;
  const H = 280;
  const chartH = 180;
  const max = Math.max(...data) || 100;

  // Paket ini tidak butuh native binary
  const { default: satori } = await import("satori");

  const el = (type: string, style: Record<string, any>, children?: any) => ({
    type,
    props: { style, children },
  });

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

      el(
        "div",
        {
          display: "flex",
          alignItems: "flex-end",
          gap: "16px",
          height: `${chartH}px`,
          borderBottom: "1.5px solid #9ca3af",
        },
        data.map((value) =>
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

      el(
        "div",
        { display: "flex", gap: "16px", marginTop: 8 },
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

  res.setHeader("Content-Type", "image/svg+xml");
  res.send(svg);
}
