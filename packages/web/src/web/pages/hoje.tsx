import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { authClient, clearToken } from "../lib/auth";
import { useLocation } from "wouter";
import { BottomNav } from "../components/nav";

function getGreeting(name: string): { title: string; sub: string } {
  const hour = new Date().getHours();
  const firstName = name?.split(" ")[0] || "Campeão";
  if (hour < 12) return { title: `Bom dia, ${firstName}.`, sub: "Melhor do que ontem." };
  if (hour < 18) return { title: `Boa tarde, ${firstName}.`, sub: "Ainda há tempo para treinar." };
  return { title: `Boa noite, ${firstName}.`, sub: "O treino de hoje ainda conta." };
}

const SLEEP_OPTIONS = [
  { value: 1, label: "Péssimo" },
  { value: 2, label: "Mau" },
  { value: 3, label: "Normal" },
  { value: 4, label: "Bom" },
  { value: 5, label: "Ótimo" },
];

const STRESS_OPTIONS = [
  { value: 1, label: "Zen", desc: "Sem stress" },
  { value: 2, label: "Normal", desc: "Dia a dia" },
  { value: 3, label: "Stressado", desc: "Dia pesado" },
];

const TIME_OPTIONS = [
  { value: "pouco", label: "Pouco tempo", desc: "< 20 min" },
  { value: "normal", label: "Normal", desc: "30–45 min" },
  { value: "muito", label: "Tempo de sobra", desc: "> 45 min" },
];

// ── Prescrição inteligente ────────────────────────────────────────────────────
function getPrescricao(sleep: number, stress: number, time: string): { titulo: string; msg: string; mode: string; cor: string } {
  // Modo leve forçado: pouco tempo OU (muito stress E sono mau)
  const forcarLeve = time === "pouco" || (stress === 3 && sleep <= 2);
  // Aviso mas treino normal: stress alto mas resto ok
  const avisoStress = stress === 3 && !forcarLeve;
  // Excelente condição
  const optimo = sleep >= 4 && stress === 1 && time === "muito";

  if (forcarLeve) {
    if (time === "pouco") {
      return {
        titulo: "Modo 7 minutos",
        msg: "Pouco tempo não é desculpa. 7 minutos de movimento são sempre melhor que zero.",
        mode: "leve",
        cor: "var(--accent)",
      };
    }
    return {
      titulo: "Modo recuperação",
      msg: "Corpo e mente no limite. Hoje o treino é leve — movimento suave, sem intensidade alta. Recuperar também é treinar.",
      mode: "leve",
      cor: "#B87040",
    };
  }
  if (optimo) {
    return {
      titulo: "Dia de dar tudo",
      msg: "Descansado, sem stress, com tempo. Não deixes passar este dia — vai além do previsto.",
      mode: "normal",
      cor: "var(--success)",
    };
  }
  if (avisoStress) {
    return {
      titulo: "Treino com cabeça",
      msg: "Stress alto, mas consegues. Foca nos movimentos, respira fundo nos descansos. O treino vai ajudar, não piorar.",
      mode: "normal",
      cor: "#60A0B8",
    };
  }
  return {
    titulo: "Treino do dia",
    msg: "Condições normais. Faz o treino, segue o plano.",
    mode: "normal",
    cor: "var(--text-2)",
  };
}

// ── Check-in multi-step ────────────────────────────────────────────────────────
function CheckInForm({ onSave, isPending }: {
  onSave: (data: any) => void;
  isPending: boolean;
}) {
  const [step, setStep] = useState<"sleep" | "stress" | "time" | "prescricao">("sleep");
  const [sleep, setSleep] = useState<number | null>(null);
  const [stress, setStress] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);

  const prescricao = sleep && stress && time ? getPrescricao(sleep, stress, time) : null;

  function handleSave() {
    if (!sleep || !stress || !time || !prescricao) return;
    onSave({
      sleepQuality: sleep,
      stressLevel: stress,
      timeAvailable: time,
      mode: prescricao.mode,
    });
  }

  return (
    <div className="animate-fade-up delay-2" style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "16px",
      padding: "20px",
      marginBottom: "20px",
    }}>
      {/* Progresso */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px" }}>
        {(["sleep","stress","time","prescricao"] as const).map((s, i) => (
          <div key={s} style={{
            flex: 1, height: "3px", borderRadius: "2px",
            background: (["sleep","stress","time","prescricao"].indexOf(step) >= i) ? "var(--accent)" : "var(--border)",
            transition: "background 0.3s",
          }} />
        ))}
      </div>

      {/* Step: Sono */}
      {step === "sleep" && (
        <div>
          <p className="label" style={{ color: "var(--text-3)", fontSize: "10px", letterSpacing: "0.08em", marginBottom: "6px" }}>PASSO 1 / 3</p>
          <p style={{ color: "var(--text)", fontSize: "16px", fontWeight: 600, marginBottom: "16px" }}>Como dormiste?</p>
          <div style={{ display: "flex", gap: "6px" }}>
            {SLEEP_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => { setSleep(opt.value); setStep("stress"); }}
                style={{
                  flex: 1, padding: "12px 4px",
                  background: sleep === opt.value ? "var(--accent-glow)" : "var(--surface2)",
                  border: `1px solid ${sleep === opt.value ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: "10px",
                  color: sleep === opt.value ? "var(--accent)" : "var(--text-2)",
                  fontSize: "10px", fontFamily: "'Inter', sans-serif", cursor: "pointer",
                  transition: "all 0.15s", textAlign: "center",
                }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step: Stress */}
      {step === "stress" && (
        <div>
          <p className="label" style={{ color: "var(--text-3)", fontSize: "10px", letterSpacing: "0.08em", marginBottom: "6px" }}>PASSO 2 / 3</p>
          <p style={{ color: "var(--text)", fontSize: "16px", fontWeight: 600, marginBottom: "16px" }}>Como está o dia?</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {STRESS_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => { setStress(opt.value); setStep("time"); }}
                style={{
                  padding: "14px 16px", textAlign: "left",
                  background: stress === opt.value ? "var(--accent-glow)" : "var(--bg)",
                  border: `1px solid ${stress === opt.value ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: "10px", cursor: "pointer",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "16px", color: stress === opt.value ? "var(--accent)" : "var(--text)" }}>{opt.label}</span>
                <span style={{ fontSize: "12px", color: "var(--text-3)" }}>{opt.desc}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setStep("sleep")} style={{ marginTop: "12px", background: "none", border: "none", color: "var(--text-3)", fontSize: "12px", cursor: "pointer" }}>← Voltar</button>
        </div>
      )}

      {/* Step: Tempo */}
      {step === "time" && (
        <div>
          <p className="label" style={{ color: "var(--text-3)", fontSize: "10px", letterSpacing: "0.08em", marginBottom: "6px" }}>PASSO 3 / 3</p>
          <p style={{ color: "var(--text)", fontSize: "16px", fontWeight: 600, marginBottom: "16px" }}>Quanto tempo tens hoje?</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {TIME_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => { setTime(opt.value); setStep("prescricao"); }}
                style={{
                  padding: "14px 16px", textAlign: "left",
                  background: time === opt.value ? "var(--accent-glow)" : "var(--bg)",
                  border: `1px solid ${time === opt.value ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: "10px", cursor: "pointer",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "16px", color: time === opt.value ? "var(--accent)" : "var(--text)" }}>{opt.label}</span>
                <span style={{ fontSize: "12px", color: "var(--text-3)" }}>{opt.desc}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setStep("stress")} style={{ marginTop: "12px", background: "none", border: "none", color: "var(--text-3)", fontSize: "12px", cursor: "pointer" }}>← Voltar</button>
        </div>
      )}

      {/* Step: Prescrição */}
      {step === "prescricao" && prescricao && (
        <div className="animate-fade-up">
          <p className="label" style={{ color: "var(--text-3)", fontSize: "10px", letterSpacing: "0.08em", marginBottom: "6px" }}>PRESCRIÇÃO DE HOJE</p>
          <div style={{
            background: "var(--bg)", border: `1px solid ${prescricao.cor}30`,
            borderLeft: `3px solid ${prescricao.cor}`,
            borderRadius: "10px", padding: "16px", marginBottom: "16px",
          }}>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "20px", color: prescricao.cor, marginBottom: "6px", lineHeight: 1 }}>
              {prescricao.titulo}
            </p>
            <p style={{ color: "var(--text-2)", fontSize: "13px", lineHeight: 1.6 }}>{prescricao.msg}</p>
          </div>

          {/* Resumo */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
            {[
              { label: SLEEP_OPTIONS.find(s => s.value === sleep)?.label || "", prefix: "Sono" },
              { label: STRESS_OPTIONS.find(s => s.value === stress)?.label || "", prefix: "Stress" },
              { label: TIME_OPTIONS.find(t => t.value === time)?.label || "", prefix: "Tempo" },
            ].map(tag => (
              <span key={tag.prefix} style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "10px", background: "var(--surface2)", color: "var(--text-3)" }}>
                {tag.prefix}: <strong style={{ color: "var(--text-2)" }}>{tag.label}</strong>
              </span>
            ))}
          </div>

          <button onClick={handleSave} disabled={isPending} style={{
            width: "100%", padding: "16px",
            background: "var(--accent)", color: "#000", border: "none", borderRadius: "12px",
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "18px",
            letterSpacing: "0.06em", cursor: isPending ? "not-allowed" : "pointer",
          }}>
            {isPending ? "A guardar..." : "CONFIRMAR CHECK-IN"}
          </button>
          <button onClick={() => setStep("time")} style={{ marginTop: "10px", width: "100%", background: "none", border: "none", color: "var(--text-3)", fontSize: "12px", cursor: "pointer" }}>← Rever respostas</button>
        </div>
      )}
    </div>
  );
}

export default function HojePage() {
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const { data: sessionData } = authClient.useSession();
  const user = sessionData?.user;

  const [lightMode, setLightMode] = useState(false);

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await api.profile.$get()).json(),
  });

  const { data: checkInData, isLoading: checkInLoading } = useQuery({
    queryKey: ["checkin-today"],
    queryFn: async () => (await api.checkins.today.$get()).json(),
  });

  const { data: workoutData, isLoading: workoutLoading } = useQuery({
    queryKey: ["workouts-today"],
    queryFn: async () => (await api.workouts.$get()).json(),
  });

  const { data: statsData } = useQuery({
    queryKey: ["session-stats"],
    queryFn: async () => (await api.sessions.stats.$get()).json(),
  });

  const saveCheckIn = useMutation({
    mutationFn: async (data: any) => (await api.checkins.$post({ json: data })).json(),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["checkin-today"] });
      // aplica modo baseado na prescrição
      if ((data as any)?.checkIn?.mode === "leve") setLightMode(true);
      else setLightMode(false);
    },
  });

  const revertCheckIn = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/checkins/today", { method: "DELETE", headers: { Authorization: `Bearer ${(await import("../lib/auth")).getToken()}` } });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["checkin-today"] });
      setLightMode(false);
    },
  });

  const profile = (profileData as any)?.profile;
  const checkIn = (checkInData as any)?.checkIn;
  const workout = lightMode ? (workoutData as any)?.saveday : (workoutData as any)?.daily;
  const stats = statsData as any;
  const greeting = getGreeting(user?.name || "");

  async function handleSignOut() {
    await authClient.signOut();
    clearToken();
    navigate("/auth");
  }

  const phase = profile?.currentPhase || "fundacao";
  const phaseLabels: Record<string, string> = {
    fundacao: "Fase 1 — Fundação",
    construcao: "Fase 2 — Construção",
    forca: "Fase 3 — Força",
  };

  const thisWeek = stats?.thisWeekSessions || 0;
  const weekGoal = 3;

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      paddingBottom: "100px",
    }}>
      {/* Header */}
      <div style={{
        padding: "48px 24px 24px",
        background: "var(--bg)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div className="animate-fade-up">
            <h1 className="display" style={{
              fontSize: "clamp(32px, 6vw, 48px)",
              color: "var(--text)",
              lineHeight: 1,
              marginBottom: "4px",
            }}>
              {greeting.title}
            </h1>
            <p style={{ color: "var(--accent)", fontSize: "14px", fontWeight: 500 }}>
              {greeting.sub}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="label"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "8px 12px",
              color: "var(--text-3)",
              cursor: "pointer",
              fontSize: "11px",
            }}
          >
            Sair
          </button>
        </div>

        {/* Phase badge */}
        <div className="animate-fade-up delay-1" style={{ marginTop: "20px" }}>
          <span className="label" style={{
            background: "var(--accent-glow)",
            border: "1px solid var(--accent)",
            borderRadius: "20px",
            padding: "4px 12px",
            color: "var(--accent)",
            fontSize: "11px",
          }}>
            {phaseLabels[phase]}
          </span>
        </div>
      </div>

      <div style={{ padding: "0 24px" }}>
        {/* Check-in */}
        {!checkIn && (
          <CheckInForm onSave={(data) => saveCheckIn.mutate(data)} isPending={saveCheckIn.isPending} />
        )}

        {checkIn && (
          <div className="animate-fade-up delay-2" style={{ marginBottom: "20px" }}>
            {/* Prescrição guardada */}
            {(() => {
              const p = checkIn.sleepQuality && checkIn.stressLevel && checkIn.timeAvailable
                ? getPrescricao(checkIn.sleepQuality, checkIn.stressLevel, checkIn.timeAvailable)
                : null;
              return p ? (
                <div style={{
                  background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "16px",
                  padding: "16px 18px", marginBottom: "8px",
                  borderLeft: `3px solid ${p.cor}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                    <div>
                      <span style={{ color: "var(--success)", fontSize: "12px", marginRight: "8px" }}>✓</span>
                      <span className="label" style={{ color: "var(--text-3)", fontSize: "10px", letterSpacing: "0.06em" }}>CHECK-IN FEITO</span>
                    </div>
                    <button onClick={() => revertCheckIn.mutate()} disabled={revertCheckIn.isPending}
                      style={{ background: "none", border: "1px solid var(--border)", borderRadius: "6px", padding: "4px 10px", color: "var(--text-3)", fontSize: "11px", cursor: "pointer" }}>
                      {revertCheckIn.isPending ? "..." : "Reverter"}
                    </button>
                  </div>
                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "17px", color: p.cor, lineHeight: 1, marginBottom: "4px" }}>{p.titulo}</p>
                  <p style={{ color: "var(--text-2)", fontSize: "12px", lineHeight: 1.5 }}>{p.msg}</p>
                  <div style={{ display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" }}>
                    {[
                      { prefix: "Sono", label: SLEEP_OPTIONS.find(s => s.value === checkIn.sleepQuality)?.label },
                      { prefix: "Stress", label: STRESS_OPTIONS.find(s => s.value === checkIn.stressLevel)?.label },
                      { prefix: "Tempo", label: TIME_OPTIONS.find(t => t.value === checkIn.timeAvailable)?.label },
                    ].filter(t => t.label).map(tag => (
                      <span key={tag.prefix} style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "8px", background: "var(--surface2)", color: "var(--text-3)" }}>
                        {tag.prefix}: <strong style={{ color: "var(--text-2)" }}>{tag.label}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{
                  background: "rgba(76,175,130,0.08)", border: "1px solid rgba(76,175,130,0.2)",
                  borderRadius: "12px", padding: "12px 16px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: "var(--success)", fontSize: "16px" }}>✓</span>
                    <span style={{ color: "var(--text-2)", fontSize: "14px" }}>Check-in feito</span>
                  </div>
                  <button onClick={() => revertCheckIn.mutate()} disabled={revertCheckIn.isPending}
                    style={{ background: "none", border: "1px solid var(--border)", borderRadius: "6px", padding: "4px 10px", color: "var(--text-3)", fontSize: "11px", cursor: "pointer" }}>
                    {revertCheckIn.isPending ? "..." : "Reverter"}
                  </button>
                </div>
              );
            })()}
          </div>
        )}

        {/* Weekly progress */}
        <div className="animate-fade-up delay-2" style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "20px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <p className="label" style={{ color: "var(--text-3)" }}>Esta semana</p>
            <p className="headline" style={{ color: "var(--text)", fontSize: "20px" }}>
              {thisWeek}<span style={{ color: "var(--text-3)", fontSize: "14px" }}>/{weekGoal}</span>
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {Array.from({ length: weekGoal }, (_, i) => (
              <div key={i} style={{
                flex: 1,
                height: "6px",
                borderRadius: "3px",
                background: i < thisWeek ? "var(--accent)" : "var(--border)",
                transition: "background 0.3s",
              }} />
            ))}
          </div>
          <p style={{ color: "var(--text-3)", fontSize: "12px", marginTop: "8px" }}>
            {thisWeek >= weekGoal
              ? "Meta da semana atingida. Impressionante."
              : `${weekGoal - thisWeek} treino${weekGoal - thisWeek > 1 ? "s" : ""} para a meta desta semana`}
          </p>
        </div>

        {/* Treino do dia */}
        <div className="animate-fade-up delay-3">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <p className="label" style={{ color: "var(--text-3)" }}>
              {lightMode ? "Modo leve — 7 minutos" : "Treino de hoje"}
            </p>
            <button
              onClick={() => setLightMode(m => !m)}
              style={{
                background: "transparent",
                border: "none",
                color: lightMode ? "var(--accent)" : "var(--text-3)",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {lightMode ? "← Voltar ao treino" : "Dia difícil? Modo leve"}
            </button>
          </div>

          {workoutLoading ? (
            <div className="skeleton" style={{ height: "200px", marginBottom: "16px" }} />
          ) : workout ? (
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "20px",
              overflow: "hidden",
              marginBottom: "16px",
            }}>
              {/* Workout header */}
              <div style={{
                padding: "28px",
                background: "linear-gradient(135deg, var(--surface) 0%, rgba(193,127,62,0.05) 100%)",
                borderBottom: "1px solid var(--border)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div className="label" style={{ color: "var(--accent)", marginBottom: "6px" }}>
                      {workout.type === "forca" ? "FORÇA" :
                       workout.type === "recuperacao" ? "RECUPERAÇÃO" :
                       workout.type === "cardio" ? "CARDIO" : "RESET MENTAL"}
                    </div>
                    <h2 className="headline" style={{ fontSize: "28px", color: "var(--text)", marginBottom: "8px" }}>
                      {workout.name}
                    </h2>
                    <p style={{ color: "var(--text-2)", fontSize: "14px", lineHeight: 1.5 }}>
                      {workout.description}
                    </p>
                  </div>
                  <div style={{
                    background: "var(--accent-glow)",
                    border: "1px solid var(--accent)",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    textAlign: "center",
                    minWidth: "64px",
                  }}>
                    <div className="display" style={{ fontSize: "32px", color: "var(--accent)", lineHeight: 1 }}>
                      {workout.durationMinutes}
                    </div>
                    <div className="label" style={{ color: "var(--accent)", fontSize: "9px" }}>MIN</div>
                  </div>
                </div>
              </div>

              {/* Exercises preview */}
              <div style={{ padding: "16px 28px" }}>
                {workout.exercises?.slice(0, 3).map((ex: any, i: number) => (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 0",
                    borderBottom: i < 2 ? "1px solid var(--border)" : "none",
                  }}>
                    <div style={{
                      width: "28px",
                      height: "28px",
                      background: "var(--surface2)",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <span className="label" style={{ color: "var(--text-3)", fontSize: "11px" }}>{i + 1}</span>
                    </div>
                    <span style={{ color: "var(--text)", fontSize: "14px" }}>{ex.name}</span>
                    <span style={{ marginLeft: "auto", color: "var(--text-3)", fontSize: "12px" }}>
                      {ex.sets ? `${ex.sets}×${ex.reps}` : ex.duration}
                    </span>
                  </div>
                ))}
                {workout.exercises?.length > 3 && (
                  <p style={{ color: "var(--text-3)", fontSize: "12px", paddingTop: "8px" }}>
                    + {workout.exercises.length - 3} mais exercícios
                  </p>
                )}
              </div>

              {/* CTA */}
              <div style={{ padding: "0 28px 28px" }}>
                <button
                  onClick={() => navigate(`/treino?id=${workout.id}`)}
                  style={{
                    width: "100%",
                    padding: "18px",
                    background: "var(--accent)",
                    color: "#000",
                    border: "none",
                    borderRadius: "12px",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 800,
                    fontSize: "20px",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.01)"}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"}
                >
                  Começar
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "32px",
              textAlign: "center",
            }}>
              <p style={{ color: "var(--text-2)" }}>Sem treino para hoje. Descanso programado.</p>
              <p style={{ color: "var(--text-3)", fontSize: "13px", marginTop: "8px" }}>O descanso é parte do treino.</p>
            </div>
          )}
        </div>

        {/* Stats strip */}
        <div className="animate-fade-up delay-4" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "24px",
        }}>
          {[
            { label: "Treinos totais", value: stats?.totalSessions || 0, unit: "" },
            { label: "Minutos totais", value: stats?.totalMinutes || 0, unit: "min" },
          ].map(item => (
            <div key={item.label} style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "20px",
            }}>
              <div className="headline" style={{ fontSize: "32px", color: "var(--text)" }}>
                {item.value}<span style={{ fontSize: "14px", color: "var(--text-3)" }}>{item.unit}</span>
              </div>
              <p className="label" style={{ color: "var(--text-3)", marginTop: "4px" }}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
