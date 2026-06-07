"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body
        style={{
          margin: 0,
          background: "#f8fafc",
          color: "#0f172a",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "24px",
          }}
        >
          <div style={{ maxWidth: "520px", textAlign: "center" }}>
            <p
              style={{
                margin: 0,
                color: "#db2777",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              PRIMEPC
            </p>
            <h1 style={{ margin: "18px 0 0", fontSize: "30px" }}>
              Le site rencontre une interruption temporaire.
            </h1>
            <p
              style={{
                margin: "16px auto 0",
                color: "#475569",
                fontSize: "15px",
                lineHeight: 1.7,
              }}
            >
              Veuillez reessayer dans quelques instants ou revenir un peu plus
              tard.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: "28px",
                border: 0,
                borderRadius: "999px",
                background: "#db2777",
                color: "white",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 700,
                padding: "12px 22px",
              }}
            >
              Reessayer
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
