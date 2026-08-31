"use client";

export default function OfflinePage() {
  return (
    <html lang="id">
      <body
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#0f0f11",
          color: "#e0e0e0",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "2rem",
          margin: 0,
        }}
      >
        <img
          src="/assets/images/secondry-logo.png"
          alt="NeLK"
          style={{ width: 72, height: 72, marginBottom: "1.5rem", objectFit: "contain" }}
        />
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Kamu sedang offline
        </h1>
        <p style={{ color: "#999", fontSize: "0.95rem", maxWidth: 320 }}>
          Sepertinya koneksi internet kamu terputus. Periksa jaringanmu dan coba lagi.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: "2rem",
            background: "#7c5cfc",
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "0.75rem 2rem",
            fontWeight: 600,
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          Coba Lagi
        </button>
      </body>
    </html>
  );
}
