"use client";
// Shown in the rare case the whole site fails to start (even the page frame): a plain page with its own colours, since the site's styles are not loaded here.
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="ro">
      <body style={{ margin: 0, minHeight: "100vh", background: "#f6efe4", color: "#1a2a4c", fontFamily: "system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "24px" }}>
        <title>FindMyUni</title>
        <main role="alert">
          <p style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, margin: 0 }}>
            FindMy<span style={{ color: "#61122d" }}>Uni</span>
          </p>
          <h1 style={{ fontSize: 26, margin: "24px 0 8px" }}>Site-ul are o problemă momentan</h1>
          <p style={{ color: "#4a5674", margin: "0 0 20px" }}>Lucrăm la ea. Încearcă din nou peste câteva minute.</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{ background: "#61122d", color: "#fff", border: 0, borderRadius: 16, padding: "12px 24px", fontSize: 16, fontWeight: 800, cursor: "pointer", minHeight: 48 }}
          >
            Încearcă din nou
          </button>
        </main>
      </body>
    </html>
  );
}
