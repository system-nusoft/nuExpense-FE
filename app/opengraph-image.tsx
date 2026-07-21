import { ImageResponse } from "next/og";

export const alt = "Zingg — AI-Powered Expense Tracking";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          background: "#0d1f28",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 96 }}>🧾</div>
          <div
            style={{
              display: "flex",
              fontSize: 104,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: -3,
            }}
          >
            Zingg
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 34, color: "#81a8c0", marginTop: 28 }}>
          Scan, categorize, done.
        </div>
      </div>
    ),
    { ...size }
  );
}
