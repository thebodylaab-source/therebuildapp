import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { BottomNav } from "../components/nav";

const QUICK_INPUTS = [
  "Dor no joelho ao agachar",
  "Tensão lombar",
  "Ombro com limitação",
  "Entorse tornozelo recente",
  "Hérnia discal",
  "Dor no quadril",
];

export default function AvaliacoesPage() {
  const qc = useQueryClient();
  const [input, setInput] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await api.profile.$get()).json(),
  });
  const userPhase: string = (profileData as any)?.profile?.currentPhase || "fundacao";

  const { data: histData, isLoading: histLoading } = useQuery({
    queryKey: ["assessments"],
    queryFn: async () => {
      const res = await (api as any).assessments.$get();
      return res.json();
    },
  });
  const history = (histData as any)?.assessments || [];

  const assess = useMutation({
    mutationFn: async (message: string) => {
      const res = await (api as any).assessments.$post({ json: { message, userPhase } });
      return res.json();
    },
    onSuccess: (data: any) => {
      setActiveId(data.id);
      setInput("");
      qc.invalidateQueries({ queryKey: ["assessments"] });
    },
  });

  const activeAssessment = history.find((a: any) => a.id === activeId) || (assess.data as any);
  const aiResponse = activeAssessment?.aiResponse || (assess.data as any)?.aiResponse;

  const phaseLabel: Record<string, string> = { fundacao: "Fundação", construcao: "Construção", forca: "Força" };

  // Strip markdown for cleaner display
  function stripMarkdown(text: string) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/^#{1,3}\s/gm, '')
      .replace(/^- /gm, '• ')
      .replace(/\n\n/g, '\n')
      .trim();
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: "100px" }}>
      {/* Header */}
      <div style={{ padding: "48px 24px 20px" }}>
        <h1 className="display" style={{ fontSize: "clamp(36px, 8vw, 52px)", color: "var(--text)", lineHeight: 1, marginBottom: "6px" }}>
          LIMITAÇÕES
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: "14px" }}>
          Diz o que tens. O programa adapta-se.
        </p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "10px", background: "var(--accent-glow)", border: "1px solid var(--accent)", borderRadius: "20px", padding: "4px 12px" }}>
          <span style={{ fontSize: "10px", color: "var(--accent)", fontWeight: 700, letterSpacing: "0.06em" }}>FASE: {phaseLabel[userPhase] || userPhase}</span>
        </div>
      </div>

      <div style={{ padding: "0 24px" }}>

        {/* Input */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "16px", padding: "16px", marginBottom: "16px",
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Descreve: o que dói, onde, quando acontece..."
            rows={3}
            style={{
              width: "100%", background: "transparent", border: "none",
              outline: "none", resize: "none", color: "var(--text)",
              fontFamily: "'Inter', sans-serif", fontSize: "14px",
              lineHeight: 1.6, boxSizing: "border-box",
            }}
          />

          {/* Quick inputs */}
          {!input && (
            <div style={{ marginTop: "10px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {QUICK_INPUTS.map(s => (
                  <button key={s} onClick={() => setInput(s)}
                    style={{
                      background: "var(--bg)", border: "1px solid var(--border)",
                      borderRadius: "20px", padding: "4px 12px",
                      fontSize: "12px", color: "var(--text-2)", cursor: "pointer",
                      fontFamily: "'Inter', sans-serif",
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
            <button
              onClick={() => input.trim() && assess.mutate(input.trim())}
              disabled={assess.isPending || !input.trim()}
              style={{
                background: assess.isPending || !input.trim() ? "var(--border)" : "var(--accent)",
                color: assess.isPending || !input.trim() ? "var(--text-3)" : "#000",
                border: "none", borderRadius: "10px", padding: "12px 24px",
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
                fontSize: "16px", letterSpacing: "0.06em",
                cursor: assess.isPending || !input.trim() ? "default" : "pointer",
              }}
            >
              {assess.isPending ? "..." : "ANALISAR →"}
            </button>
          </div>
        </div>

        {/* Loading */}
        {assess.isPending && (
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderLeft: "3px solid var(--accent)", borderRadius: "0 12px 12px 0",
            padding: "16px 20px", marginBottom: "16px",
            display: "flex", alignItems: "center", gap: "10px",
          }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent)", animation: "pulse 1s infinite" }} />
            <span style={{ color: "var(--text-2)", fontSize: "14px" }}>A analisar...</span>
          </div>
        )}

        {/* Result — compact, action-oriented */}
        {aiResponse && !assess.isPending && (
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderLeft: "3px solid var(--accent)", borderRadius: "0 16px 16px 0",
            padding: "20px", marginBottom: "20px",
          }}>
            <span className="label" style={{ fontSize: "10px", color: "var(--accent)", letterSpacing: "0.08em", display: "block", marginBottom: "12px" }}>
              RECOMENDAÇÃO
            </span>
            <p style={{ color: "var(--text)", fontSize: "14px", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
              {stripMarkdown(aiResponse)}
            </p>
          </div>
        )}

        {/* History — compact */}
        {history.length > 0 && (
          <div>
            <p className="label" style={{ fontSize: "11px", color: "var(--text-3)", letterSpacing: "0.08em", marginBottom: "10px" }}>
              HISTÓRICO
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {history.map((a: any) => (
                <div key={a.id}
                  onClick={() => setActiveId(activeId === a.id ? null : a.id)}
                  style={{
                    background: "var(--surface)", border: `1px solid ${activeId === a.id ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: "12px", padding: "14px 16px", cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                    <p style={{ color: "var(--text)", fontSize: "13px", lineHeight: 1.4, flex: 1, margin: 0 }}>
                      {a.userMessage.length > 70 ? a.userMessage.slice(0, 70) + "..." : a.userMessage}
                    </p>
                    <span style={{ color: "var(--text-3)", fontSize: "11px", flexShrink: 0 }}>
                      {new Date(a.createdAt).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}
                    </span>
                  </div>
                  {activeId === a.id && (
                    <p style={{
                      marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border)",
                      color: "var(--text-2)", fontSize: "13px", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap",
                    }}>
                      {stripMarkdown(a.aiResponse)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {histLoading && <div style={{ color: "var(--text-3)", fontSize: "13px", textAlign: "center", padding: "16px" }}>...</div>}

        {/* Minimal disclaimer */}
        <p style={{ color: "var(--text-3)", fontSize: "11px", lineHeight: 1.5, marginTop: "20px" }}>
          Dor aguda ou lesão grave → consulta um médico. Esta análise é orientativa.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
