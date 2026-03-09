// api/chart.ts
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);

  const data   = JSON.parse(searchParams.get("data")   || "[]") as number[];
  const labels = JSON.parse(searchParams.get("labels") || "[]") as string[];
  const title  =            searchParams.get("title")  || "";
  const color  =            searchParams.get("color")  || "#4e8ef7";

  const W      = 520;
  const H      = 280;
  const chartH = 180;
  const max    = Math.max(...data) || 100;

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          display:       "flex",
          flexDirection: "column",
          alignItems:    "center",
          width:         `${W}px`,
          height:        `${H}px`,
          background:    "white",
          padding:       "16px 20px 0",
          fontFamily:    "sans-serif",
          boxSizing:     "border-box",
        },
        children: [

          // Title
          title && {
            type: "div",
            props: {
              style: { fontSize: 13, fontWeight: "bold", color: "#374151", marginBottom: 16 },
              children: title,
            },
          },

          // Chart area
          {
            type: "div",
            props: {
              style: {
                display:    "flex",
                alignItems: "flex-end",
                gap:        "16px",
                height:     `${chartH}px`,
                borderBottom: "1.5px solid #9ca3af",
                paddingBottom: "0px",
              },
              children: data.map((value, i) => ({
                type: "div",
                props: {
                  style: { display: "flex", flexDirection: "column", alignItems: "center" },
                  children: [
                    // Value label
                    {
                      type: "div",
                      props: {
                        style: { fontSize: 11, fontWeight: "bold", color, marginBottom: 4 },
                        children: String(value),
                      },
                    },
                    // Bar
                    {
                      type: "div",
                      props: {
                        style: {
                          width:      "48px",
                          height:     `${(value / max) * chartH * 0.85}px`,
                          background: color,
                        },
                      },
                    },
                  ],
                },
              })),
            },
          },

          // X Labels
          {
            type: "div",
            props: {
              style: { display: "flex", gap: "16px", marginTop: 8 },
              children: labels.map((label) => ({
                type: "div",
                props: {
                  style: { width: "48px", fontSize: 11, color: "#374151", textAlign: "center" },
                  children: label,
                },
              })),
            },
          },

        ].filter(Boolean),
      },
    },
    { width: W, height: H, fonts: [] }
  );

  // SVG → PNG
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: W } });
  const png   = resvg.render().asPng();

  return new Response(png, {
    headers: {
      "Content-Type":  "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
