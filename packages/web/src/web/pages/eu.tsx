import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { authClient, clearToken } from "../lib/auth";
import { useLocation } from "wouter";
import { BottomNav } from "../components/nav";

const PHASE_LABELS: Record<string, string> = {
  fundacao: "Fundação",
  construcao: "Construção",
  forca: "Força",
};

const PHASE_DESCRIPTIONS: Record<string, string> = {
  fundacao: "Semanas 1-3 · Mobilidade, padrões de movimento, tendões. Construir a base.",
  construcao: "Semanas 4-8 · Volume e carga aumentam. O corpo já conhece os movimentos.",
  forca: "Semanas 9+ · Intensidade máxima. Aqui és um homem que treina.",
};

const POTENTIAL_ACHIEVEMENTS = [
  { key: "first_session", title: "Primeiro passo", description: "Completaste o teu primeiro treino", icon: "◈" },
  { key: "week_1", title: "Uma semana", description: "7 dias consecutivos no programa", icon: "◎" },
  { key: "sessions_5", title: "5 treinos", description: "Cinco treinos completos", icon: "⚡" },
  { key: "sessions_10", title: "10 treinos", description: "Dez treinos — és consistente", icon: "★" },
  { key: "no_pain", title: "Sem dor", description: "Completaste um treino sem parar por dor", icon: "✓" },
  { key: "phase_2", title: "Fase de Construção", description: "Passaste à fase de construção", icon: "▲" },
];

// ── SVG Mini Line Chart ───────────────────────────────────────────────────────
function MiniLineChart({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const w = 200, h = 60, pad = 8;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });

  const polyline = pts.join(" ");
  const area = `M${pts[0]} L${pts.slice(1).join(" L")} L${w - pad},${h} L${pad},${h} Z`;

  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#grad-${color.replace("#", "")})`} />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((pt, i) => {
        const [x, y] = pt.split(",").map(Number);
        return (
          <circle key={i} cx={x} cy={y} r="3" fill={color} />
        );
      })}
    </svg>
  );
}

// ── Medições section ─────────────────────────────────────────────────────────
function MedicoesSec() {
  const qc = useQueryClient();
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({ date: today, peito: "", bracos: "", abdominal: "", peso: "" });
  const [showForm, setShowForm] = useState(false);
  const [activeMetric, setActiveMetric] = useState<"peito" | "bracos" | "abdominal">("abdominal");

  const { data } = useQuery({
    queryKey: ["measurements"],
    queryFn: async () => (await (api as any).measurements.$get()).json(),
  });

  const measurements: any[] = (data as any)?.measurements || [];

  const create = useMutation({
    mutationFn: async (body: any) => (await (api as any).measurements.$post({ json: body })).json(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["measurements"] });
      setShowForm(false);
      setForm({ date: today, peito: "", bracos: "", abdominal: "", peso: "" });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => (await (api as any).measurements[":id"].$delete({ param: { id } })).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["measurements"] }),
  });

  // chronological for chart
  const sorted = [...measurements].sort((a, b) => a.date.localeCompare(b.date));

  const chartData = {
    peito: sorted.filter(m => m.peito != null).map(m => m.peito),
    bracos: sorted.filter(m => m.bracos != null).map(m => m.bracos),
    abdominal: sorted.filter(m => m.abdominal != null).map(m => m.abdominal),
  };

  const latest = measurements[0];

  const metricConfig = {
    peito: { label: "Peito", color: "#E07040", unit: "cm" },
    bracos: { label: "Braços", color: "#60A9B0", unit: "cm" },
    abdominal: { label: "Abdominal", color: "#B8A060", unit: "cm" },
  };

  const inp: React.CSSProperties = {
    flex: 1, padding: "10px 12px",
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "8px", color: "var(--text)",
    fontFamily: "'Inter', sans-serif", fontSize: "14px",
    outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ marginBottom: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <p className="label" style={{ color: "var(--text-3)", margin: 0 }}>Medições corporais</p>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "6px 14px",
            background: "var(--accent-glow)",
            border: "1px solid var(--accent)",
            borderRadius: "8px",
            color: "var(--accent)",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700, fontSize: "13px",
            cursor: "pointer", letterSpacing: "0.04em",
          }}
        >
          + Registar
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          padding: "18px",
          marginBottom: "16px",
        }}>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-3)", marginBottom: "5px", letterSpacing: "0.05em", textTransform: "uppercase" }}>Data</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ ...inp, width: "100%", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            {(["peito", "bracos", "abdominal"] as const).map(field => (
              <div key={field}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-3)", marginBottom: "5px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {metricConfig[field].label} (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={(form as any)[field]}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  style={{ ...inp, width: "100%", boxSizing: "border-box" }}
                />
              </div>
            ))}
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-3)", marginBottom: "5px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="0.0"
                value={form.peso}
                onChange={e => setForm(f => ({ ...f, peso: e.target.value }))}
                style={{ ...inp, width: "100%", boxSizing: "border-box" }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setShowForm(false)} style={{ padding: "10px 16px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-2)", cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "14px" }}>Cancelar</button>
            <button
              onClick={() => create.mutate({
                date: form.date,
                peito: form.peito ? Number(form.peito) : undefined,
                bracos: form.bracos ? Number(form.bracos) : undefined,
                abdominal: form.abdominal ? Number(form.abdominal) : undefined,
                peso: form.peso ? Number(form.peso) : undefined,
              })}
              disabled={create.isPending}
              style={{ flex: 1, padding: "10px", background: "var(--accent)", border: "none", borderRadius: "8px", color: "#000", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "15px", cursor: "pointer" }}
            >
              {create.isPending ? "A guardar..." : "Guardar"}
            </button>
          </div>
        </div>
      )}

      {/* Valores atuais */}
      {latest && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "16px" }}>
          {(["peito", "bracos", "abdominal"] as const).map(field => {
            const cfg = metricConfig[field];
            const val = latest[field];
            return (
              <button
                key={field}
                onClick={() => setActiveMetric(field)}
                style={{
                  background: activeMetric === field ? "var(--accent-glow)" : "var(--surface)",
                  border: `1px solid ${activeMetric === field ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: "12px",
                  padding: "14px 8px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "22px",
                  fontWeight: 800,
                  color: activeMetric === field ? "var(--accent)" : "var(--text)",
                  lineHeight: 1,
                }}>
                  {val != null ? val : "—"}
                </div>
                <div style={{
                  fontSize: "9px",
                  color: "var(--text-3)",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginTop: "4px",
                }}>
                  {cfg.label} · cm
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Chart */}
      {chartData[activeMetric].length >= 2 ? (
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          padding: "16px",
          marginBottom: "16px",
          overflow: "hidden",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: "var(--text)", fontSize: "15px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              {metricConfig[activeMetric].label} — evolução
            </span>
            <span style={{
              fontSize: "11px",
              color: chartData[activeMetric][chartData[activeMetric].length - 1] <= chartData[activeMetric][0] ? "var(--success)" : "var(--text-2)",
              fontWeight: 700,
            }}>
              {(() => {
                const arr = chartData[activeMetric];
                const diff = (arr[arr.length - 1] - arr[0]).toFixed(1);
                return `${Number(diff) > 0 ? "+" : ""}${diff} cm`;
              })()}
            </span>
          </div>
          <div style={{ width: "100%", overflowX: "auto" }}>
            <MiniLineChart data={chartData[activeMetric]} color={metricConfig[activeMetric].color} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
            <span style={{ fontSize: "10px", color: "var(--text-3)" }}>
              {sorted.find(m => m[activeMetric] != null)?.date || ""}
            </span>
            <span style={{ fontSize: "10px", color: "var(--text-3)" }}>
              {[...sorted].reverse().find(m => m[activeMetric] != null)?.date || ""}
            </span>
          </div>
        </div>
      ) : chartData[activeMetric].length === 1 ? (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "14px", marginBottom: "16px", fontSize: "13px", color: "var(--text-3)" }}>
          Regista mais uma medição para ver a evolução.
        </div>
      ) : measurements.length === 0 ? (
        <div style={{ background: "var(--surface)", border: "1px dashed var(--border)", borderRadius: "12px", padding: "20px", marginBottom: "16px", textAlign: "center", fontSize: "13px", color: "var(--text-3)" }}>
          Sem medições ainda. Clica em "+ Registar" para começar.
        </div>
      ) : null}

      {/* Histórico */}
      {measurements.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {measurements.slice(0, 5).map((m: any) => (
            <div key={m.id} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "12px 14px",
            }}>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "15px", color: "var(--text)" }}>{m.date}</div>
                <div style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "2px" }}>
                  {[
                    m.peito != null && `Peito: ${m.peito}cm`,
                    m.bracos != null && `Braços: ${m.bracos}cm`,
                    m.abdominal != null && `Abd.: ${m.abdominal}cm`,
                    m.peso != null && `${m.peso}kg`,
                  ].filter(Boolean).join(" · ")}
                </div>
              </div>
              <button
                onClick={() => { if (confirm("Apagar esta medição?")) remove.mutate(m.id); }}
                style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", fontSize: "16px" }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function EuPage() {
  const [, navigate] = useLocation();
  const { data: sessionData } = authClient.useSession();
  const user = sessionData?.user;
  const isAdmin = user?.email === "thebodylaab@gmail.com";

  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await api.profile.$get()).json(),
  });

  const { data: statsData } = useQuery({
    queryKey: ["session-stats"],
    queryFn: async () => (await api.sessions.stats.$get()).json(),
  });

  const { data: sessionsData } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => (await api.sessions.$get()).json(),
  });

  const { data: achievementsData } = useQuery({
    queryKey: ["achievements"],
    queryFn: async () => (await api.achievements.$get()).json(),
  });

  const profile = (profileData as any)?.profile;
  const stats = statsData as any;
  const sessions = (sessionsData as any)?.sessions || [];
  const achievements = (achievementsData as any)?.achievements || [];

  const totalSessions = stats?.totalSessions || 0;
  const totalMinutes = stats?.totalMinutes || 0;
  const thisWeek = stats?.thisWeekSessions || 0;

  const vitalityScore = Math.min(100, Math.round(
    (totalSessions * 4) + (thisWeek * 10) + (achievements.length * 5)
  ));

  const unlockedKeys = new Set(achievements.map((a: any) => a.achievementKey));
  const autoUnlocked = POTENTIAL_ACHIEVEMENTS.filter(a => {
    if (a.key === "first_session" && totalSessions >= 1) return true;
    if (a.key === "sessions_5" && totalSessions >= 5) return true;
    if (a.key === "sessions_10" && totalSessions >= 10) return true;
    if (a.key === "phase_2" && profile?.currentPhase !== "fundacao") return true;
    return false;
  }).map(a => a.key);

  const phaseOrder = ["fundacao", "construcao", "forca"];
  const currentPhaseIndex = phaseOrder.indexOf(profile?.currentPhase || "fundacao");

  const firstSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
  const daysSinceStart = firstSession
    ? Math.floor((Date.now() - new Date(firstSession.createdAt).getTime()) / 86400000)
    : 0;

  async function handleSignOut() {
    await authClient.signOut();
    clearToken();
    navigate("/auth");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: "100px" }}>
      {/* Header */}
      <div style={{ padding: "48px 24px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div className="animate-fade-up">
            <h1 className="display" style={{ fontSize: "clamp(40px, 8vw, 56px)", color: "var(--text)", lineHeight: 1, marginBottom: "4px" }}>
              {user?.name?.split(" ")[0]?.toUpperCase() || "EU"}
            </h1>
            <p style={{ color: "var(--text-3)", fontSize: "13px" }}>{user?.email}</p>
          </div>
          <div style={{
            background: "var(--accent-glow)",
            border: "1px solid var(--accent)",
            borderRadius: "16px",
            padding: "16px 20px",
            textAlign: "center",
          }}>
            <div className="display" style={{ fontSize: "36px", color: "var(--accent)", lineHeight: 1 }}>
              {vitalityScore}
            </div>
            <div className="label" style={{ color: "var(--accent)", fontSize: "9px", marginTop: "4px" }}>
              VITALIDADE
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 24px" }}>
        {/* Stats grid */}
        <div className="animate-fade-up delay-1" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "10px",
          marginBottom: "24px",
        }}>
          {[
            { value: totalSessions, label: "Treinos" },
            { value: `${totalMinutes}m`, label: "Minutos" },
            { value: `${daysSinceStart}d`, label: "No programa" },
          ].map(item => (
            <div key={item.label} style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "16px",
              textAlign: "center",
            }}>
              <div className="headline" style={{ fontSize: "24px", color: "var(--text)" }}>{item.value}</div>
              <div className="label" style={{ color: "var(--text-3)", fontSize: "10px", marginTop: "4px" }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Phase progress */}
        <div className="animate-fade-up delay-2" style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "24px",
        }}>
          <p className="label" style={{ color: "var(--text-3)", marginBottom: "16px" }}>Jornada</p>
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            {phaseOrder.map((ph, i) => {
              const phaseActive = isAdmin || i <= currentPhaseIndex;
              return (
              <div key={ph} style={{
                flex: 1,
                padding: "12px 8px",
                background: phaseActive ? "var(--accent-glow)" : "var(--surface2)",
                border: `1px solid ${phaseActive ? "var(--accent)" : "var(--border)"}`,
                borderRadius: "10px",
                textAlign: "center",
              }}>
                <div className="label" style={{
                  color: phaseActive ? "var(--accent)" : "var(--text-3)",
                  fontSize: "9px", marginBottom: "4px",
                }}>
                  FASE {i + 1}
                </div>
                <div style={{
                  color: phaseActive ? "var(--accent)" : "var(--text-3)",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700, fontSize: "13px",
                }}>
                  {PHASE_LABELS[ph]}
                </div>
                {i === currentPhaseIndex && (
                  <div style={{
                    width: "6px", height: "6px",
                    background: "var(--accent)", borderRadius: "50%",
                    margin: "6px auto 0",
                    animation: "pulse-accent 2s infinite",
                  }} />
                )}
              </div>
              );
            })}
          </div>
          <p style={{ color: "var(--text-2)", fontSize: "13px", lineHeight: 1.5 }}>
            {PHASE_DESCRIPTIONS[profile?.currentPhase || "fundacao"]}
          </p>
        </div>

        {/* Medições corporais */}
        <div className="animate-fade-up delay-3">
          <MedicoesSec />
        </div>

        {/* Conquistas funcionais */}
        <div className="animate-fade-up delay-3">
          <p className="label" style={{ color: "var(--text-3)", marginBottom: "12px" }}>Conquistas funcionais</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
            {POTENTIAL_ACHIEVEMENTS.map(a => {
              const unlocked = isAdmin || unlockedKeys.has(a.key) || autoUnlocked.includes(a.key);
              return (
                <div key={a.key} style={{
                  display: "flex", alignItems: "center", gap: "16px",
                  padding: "16px",
                  background: unlocked ? "var(--accent-glow)" : "var(--surface)",
                  border: `1px solid ${unlocked ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: "12px",
                  opacity: unlocked ? 1 : 0.5,
                  transition: "all 0.3s",
                }}>
                  <div style={{
                    width: "40px", height: "40px",
                    background: unlocked ? "var(--accent)" : "var(--surface2)",
                    borderRadius: "10px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "18px", color: unlocked ? "#000" : "var(--text-3)", flexShrink: 0,
                  }}>
                    {a.icon}
                  </div>
                  <div>
                    <div style={{ color: unlocked ? "var(--text)" : "var(--text-2)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "17px" }}>
                      {a.title}
                    </div>
                    <div style={{ color: "var(--text-3)", fontSize: "13px" }}>{a.description}</div>
                  </div>
                  {unlocked && <span style={{ marginLeft: "auto", color: "var(--success)", fontSize: "16px" }}>✓</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Flashback */}
        {firstSession && daysSinceStart > 7 && (
          <div className="animate-fade-up delay-4" style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderLeft: "3px solid var(--accent)",
            borderRadius: "0 12px 12px 0",
            padding: "20px", marginBottom: "24px",
          }}>
            <p className="label" style={{ color: "var(--accent)", marginBottom: "8px" }}>Flashback</p>
            <p style={{ color: "var(--text-2)", fontSize: "14px", lineHeight: 1.6 }}>
              Há {daysSinceStart} dias iniciaste o teu recomeço.
              Já completaste {totalSessions} treino{totalSessions !== 1 ? "s" : ""} e investiste {totalMinutes} minutos em ti próprio.
              {totalSessions >= 5 ? " O corpo está a registar." : " Continua. O corpo está a acordar."}
            </p>
          </div>
        )}

        {/* Próximo objetivo */}
        <div className="animate-fade-up delay-4" style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "20px", marginBottom: "24px",
        }}>
          <p className="label" style={{ color: "var(--text-3)", marginBottom: "12px" }}>Próximo objetivo</p>
          {totalSessions < 5 ? (
            <>
              <div className="headline" style={{ fontSize: "20px", color: "var(--text)", marginBottom: "8px" }}>5 treinos completos</div>
              <div style={{ height: "4px", background: "var(--border)", borderRadius: "2px", marginBottom: "8px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(totalSessions / 5) * 100}%`, background: "var(--accent)", borderRadius: "2px", transition: "width 0.5s ease-out" }} />
              </div>
              <p style={{ color: "var(--text-3)", fontSize: "13px" }}>{totalSessions}/5 treinos</p>
            </>
          ) : totalSessions < 10 ? (
            <>
              <div className="headline" style={{ fontSize: "20px", color: "var(--text)", marginBottom: "8px" }}>Prova de Vitalidade — Semana 6</div>
              <p style={{ color: "var(--text-2)", fontSize: "13px" }}>Reteste funcional. Compara onde estás agora com o dia 1.</p>
            </>
          ) : (
            <>
              <div className="headline" style={{ fontSize: "20px", color: "var(--text)", marginBottom: "8px" }}>Fase de Construção</div>
              <p style={{ color: "var(--text-2)", fontSize: "13px" }}>Com {totalSessions} treinos, estás pronto para avançar.</p>
            </>
          )}
        </div>

        {/* Quote */}
        <div style={{ padding: "24px", textAlign: "center", marginBottom: "16px" }}>
          <p className="display" style={{ fontSize: "22px", color: "var(--text-3)", lineHeight: 1.4 }}>
            "Não vamos buscar o homem que foste.<br />
            <span style={{ color: "var(--text-2)" }}>Estamos a construir o homem mais forte que podes ser agora."</span>
          </p>
        </div>

        {/* Sair + Admin */}
        <div style={{ padding: "0 0 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {user?.email === "thebodylaab@gmail.com" && (
            <button
              onClick={() => navigate("/admin")}
              style={{
                width: "100%", padding: "14px",
                background: "var(--accent-glow)",
                border: "1px solid var(--accent)",
                borderRadius: "12px", color: "var(--accent)",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800, fontSize: "16px",
                letterSpacing: "0.08em", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
            >
              ⚙ PAINEL ADMIN
            </button>
          )}
          <button
            onClick={handleSignOut}
            style={{
              width: "100%", padding: "14px",
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: "12px", color: "var(--text-3)",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700, fontSize: "16px",
              letterSpacing: "0.06em", cursor: "pointer",
            }}
          >
            TERMINAR SESSÃO
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
