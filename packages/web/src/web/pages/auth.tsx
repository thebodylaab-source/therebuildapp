import { useState } from "react";
import { useLocation } from "wouter";
import { authClient, captureToken } from "../lib/auth";

export default function AuthPage() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const res = await authClient.signUp.email(
          { name, email, password },
          { onSuccess: captureToken }
        );
        if (res.error) throw new Error(res.error.message || "Erro ao criar conta");
        navigate("/onboarding");
      } else {
        const res = await authClient.signIn.email(
          { email, password },
          { onSuccess: captureToken }
        );
        if (res.error) throw new Error(res.error.message || "Email ou palavra-passe incorretos");
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message || "Algo correu mal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Logo */}
        <div className="animate-fade-up" style={{ marginBottom: "48px", textAlign: "center" }}>
          <h1 className="display" style={{ fontSize: "52px", color: "var(--text)", lineHeight: 1 }}>
            <span style={{ color: "var(--accent)" }}>REBUILD</span>
          </h1>
          <p style={{ color: "var(--text-2)", marginTop: "8px", fontSize: "14px" }}>
            {mode === "signin" ? "Bem-vindo de volta." : "Começa hoje. Agora."}
          </p>
        </div>

        {/* Toggle */}
        <div className="animate-fade-up delay-1" style={{
          display: "flex",
          background: "var(--surface)",
          borderRadius: "10px",
          padding: "4px",
          marginBottom: "32px",
          border: "1px solid var(--border)",
        }}>
          {(["signin", "signup"] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "7px",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "14px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                transition: "all 0.2s",
                background: mode === m ? "var(--accent)" : "transparent",
                color: mode === m ? "#000" : "var(--text-2)",
              }}
            >
              {m === "signin" ? "Entrar" : "Começar"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="animate-fade-up delay-2">
          {mode === "signup" && (
            <div style={{ marginBottom: "16px" }}>
              <label className="label" style={{ color: "var(--text-3)", display: "block", marginBottom: "8px" }}>
                O teu nome
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="João Silva"
                required
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  color: "var(--text)",
                  fontSize: "15px",
                  fontFamily: "'Inter', sans-serif",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "var(--accent)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
            </div>
          )}

          <div style={{ marginBottom: "16px" }}>
            <label className="label" style={{ color: "var(--text-3)", display: "block", marginBottom: "8px" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="joao@exemplo.com"
              required
              style={{
                width: "100%",
                padding: "14px 16px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                color: "var(--text)",
                fontSize: "15px",
                fontFamily: "'Inter', sans-serif",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label className="label" style={{ color: "var(--text-3)", display: "block", marginBottom: "8px" }}>Palavra-passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              style={{
                width: "100%",
                padding: "14px 16px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                color: "var(--text)",
                fontSize: "15px",
                fontFamily: "'Inter', sans-serif",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "var(--accent)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
          </div>

          {error && (
            <div style={{
              background: "rgba(224, 82, 82, 0.1)",
              border: "1px solid rgba(224, 82, 82, 0.3)",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "16px",
              color: "var(--danger)",
              fontSize: "14px",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              background: loading ? "var(--accent-dim)" : "var(--accent)",
              color: "#000",
              border: "none",
              borderRadius: "10px",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: "18px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              transform: loading ? "scale(0.98)" : "scale(1)",
            }}
            onMouseEnter={e => { if (!loading) (e.target as HTMLButtonElement).style.transform = "scale(1.01)"; }}
            onMouseLeave={e => { (e.target as HTMLButtonElement).style.transform = "scale(1)"; }}
          >
            {loading ? "A processar..." : mode === "signin" ? "Entrar" : "Começar agora"}
          </button>
        </form>

        <p className="animate-fade-up delay-3" style={{
          textAlign: "center",
          marginTop: "32px",
          color: "var(--text-3)",
          fontSize: "13px",
        }}>
          Não estás atrasado. Estás a recomeçar.
        </p>
      </div>
    </div>
  );
}
