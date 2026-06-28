import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { authClient } from "../lib/auth";
import { useLocation, useSearch } from "wouter";
import { BottomNav } from "../components/nav";

const ADMIN_EMAIL = "thebodylaab@gmail.com";

// Phase unlock order
const PHASE_ORDER: Record<string, number> = { fundacao: 1, construcao: 2, forca: 3, all: 0, todas: 0 };
function isPhaseUnlocked(userPhase: string, workoutPhase: string): boolean {
  if (workoutPhase === "all" || workoutPhase === "todas") return true;
  return (PHASE_ORDER[userPhase] || 1) >= (PHASE_ORDER[workoutPhase] || 1);
}

type EffortRating = "facil" | "ok" | "demais";

export default function TreinoPage() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const workoutId = params.get("id");
  const qc = useQueryClient();

  const [phase, setPhase] = useState<"browse" | "active" | "done">("browse");
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(workoutId);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [painStop, setPainStop] = useState(false);
  const [effort, setEffort] = useState<EffortRating | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: sessionData } = authClient.useSession();
  const isAdmin = (sessionData as any)?.user?.email === ADMIN_EMAIL;

  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await api.profile.$get()).json(),
  });
  const userPhase: string = (profileData as any)?.profile?.currentPhase || "fundacao";

  const { data: workoutsData, isLoading: workoutsLoading } = useQuery({
    queryKey: ["workouts-all"],
    queryFn: async () => (await api.workouts.all.$get()).json(),
  });

  const { data: activeWData, isLoading: activeLoading } = useQuery({
    queryKey: ["workout", activeWorkoutId],
    queryFn: async () => {
      if (!activeWorkoutId) return null;
      const res = await (api.workouts as any)[":id"].$get({ param: { id: activeWorkoutId } });
      return res.json();
    },
    enabled: !!activeWorkoutId,
  });

  const startSession = useMutation({
    mutationFn: async (data: any) => (await api.sessions.$post({ json: data })).json(),
    onSuccess: (data: any) => setSessionId(data?.session?.id || null),
  });

  const finishSession = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await (api.sessions as any)[":id"].$patch({ param: { id }, json: data });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["session-stats"] }),
  });

  const activeWorkout = (activeWData as any)?.workout;
  const allWorkoutsRaw = (workoutsData as any)?.workouts || [];
  // Sort: unlocked first (by phase order), then locked
  const allWorkouts = [...allWorkoutsRaw].sort((a: any, b: any) => {
    const aOrder = PHASE_ORDER[a.phase] ?? 99;
    const bOrder = PHASE_ORDER[b.phase] ?? 99;
    return aOrder - bOrder;
  });

  // Timer
  useEffect(() => {
    if (phase === "active") {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  // Auto-start if workoutId in URL
  useEffect(() => {
    if (workoutId && activeWorkout && phase === "browse") {
      handleStartWorkout(workoutId, activeWorkout);
    }
  }, [workoutId, activeWorkout]);

  async function handleStartWorkout(id: string, workout: any) {
    setActiveWorkoutId(id);
    setExerciseIndex(0);
    setElapsed(0);
    setPainStop(false);
    setEffort(null);
    setPhase("active");
    await startSession.mutateAsync({
      workoutId: id,
      workoutName: workout.name,
      workoutType: workout.type,
      durationMinutes: workout.durationMinutes,
      completed: false,
    });
  }

  async function handleFinishWorkout() {
    if (!sessionId || !effort) return;
    await finishSession.mutateAsync({
      id: sessionId,
      data: { completed: true, effortRating: effort, painReported: painStop },
    });
    setPhase("done");
  }

  function formatTime(s: number): string {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  const typeColors: Record<string, string> = {
    forca: "var(--accent)",
    recuperacao: "var(--success)",
    cardio: "#4CC9F0",
    reset: "#9B8EA6",
  };

  const typeLabels: Record<string, string> = {
    forca: "FORÇA",
    recuperacao: "RECUPERAÇÃO",
    cardio: "CARDIO FUNCIONAL",
    reset: "RESET MENTAL",
  };

  // ── BROWSE VIEW ────────────────────────────────────────────────────────────
  if (phase === "browse") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: "100px" }}>
        <div style={{ padding: "48px 24px 24px" }}>
          <h1 className="display" style={{ fontSize: "clamp(40px, 8vw, 56px)", color: "var(--text)", lineHeight: 1, marginBottom: "8px" }}>
            BIBLIOTECA
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: "14px" }}>Escolhe o teu treino de hoje.</p>
        </div>

        {workoutsLoading ? (
          <div style={{ padding: "0 24px" }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: "120px", marginBottom: "12px" }} />)}
          </div>
        ) : (
          <div style={{ padding: "0 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {(() => {
              const phases = ["fundacao", "construcao", "forca"];
              const phaseNames: Record<string,string> = { fundacao: "FASE 1 — FUNDAÇÃO", construcao: "FASE 2 — CONSTRUÇÃO", forca: "FASE 3 — FORÇA" };
              const grouped = phases.map(ph => ({
                phase: ph,
                workouts: allWorkouts.filter((w: any) => w.phase === ph || (ph === "fundacao" && (w.phase === "all" || w.phase === "todas"))),
              })).filter(g => g.workouts.length > 0);
              return grouped.map(group => (
                <div key={group.phase}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "8px 0 10px" }}>
                    <span className="label" style={{
                      fontSize: "11px",
                      color: (isAdmin || isPhaseUnlocked(userPhase, group.phase)) ? "var(--accent)" : "var(--text-3)",
                      letterSpacing: "0.1em",
                      fontWeight: 700,
                    }}>
                      {phaseNames[group.phase] || group.phase.toUpperCase()}
                    </span>
                    {!isAdmin && !isPhaseUnlocked(userPhase, group.phase) && (
                      <span style={{ fontSize: "12px" }}>🔒</span>
                    )}
                    <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {group.workouts.map((w: any) => {
              const unlocked = isAdmin || isPhaseUnlocked(userPhase, w.phase);
              const phaseLabel = w.phase === "fundacao" ? "FUNDAÇÃO" : w.phase === "construcao" ? "CONSTRUÇÃO" : w.phase === "forca" ? "FORÇA" : "";
              return (
              <div
                key={w.id}
                onClick={() => unlocked && handleStartWorkout(w.id, w)}
                style={{
                  background: unlocked ? "var(--surface)" : "var(--bg)",
                  border: `1px solid ${unlocked ? "var(--border)" : "var(--border)"}`,
                  borderRadius: "16px",
                  padding: "20px",
                  cursor: unlocked ? "pointer" : "default",
                  transition: "all 0.2s",
                  opacity: unlocked ? 1 : 0.5,
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={e => {
                  if (!unlocked) return;
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  if (!unlocked) return;
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                }}
              >
                {/* Locked overlay badge */}
                {!unlocked && (
                  <div style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "4px 10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "11px",
                    color: "var(--text-3)",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                  }}>
                    🔒 Bloqueado
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, paddingRight: unlocked ? "0" : "80px" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" }}>
                      <span className="label" style={{
                        color: unlocked ? (typeColors[w.type] || "var(--accent)") : "var(--text-3)",
                        fontSize: "10px",
                      }}>
                        {typeLabels[w.type] || w.type}
                      </span>
                      {phaseLabel && (
                        <span className="label" style={{ color: "var(--text-3)", fontSize: "10px" }}>
                          · {phaseLabel}
                        </span>
                      )}
                    </div>
                    <h3 className="headline" style={{ fontSize: "22px", color: unlocked ? "var(--text)" : "var(--text-3)", marginBottom: "6px" }}>
                      {w.name}
                    </h3>
                    {unlocked ? (
                      <p style={{ color: "var(--text-2)", fontSize: "13px", lineHeight: 1.4 }}>{w.description}</p>
                    ) : (
                      <p style={{ color: "var(--text-3)", fontSize: "12px", fontStyle: "italic" }}>
                        Disponível quando chegares à fase {phaseLabel}.
                      </p>
                    )}
                  </div>
                  {unlocked && (
                  <div style={{
                    background: "var(--accent-glow)",
                    border: "1px solid var(--accent)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    marginLeft: "16px",
                    textAlign: "center",
                    flexShrink: 0,
                  }}>
                    <div className="display" style={{ fontSize: "26px", color: "var(--accent)", lineHeight: 1 }}>{w.durationMinutes}</div>
                    <div className="label" style={{ color: "var(--accent)", fontSize: "8px" }}>MIN</div>
                  </div>
                  )}
                </div>
              </div>
              );
            })}
                  </div>
                </div>
              ));
            })()}
          </div>
        )}
        <BottomNav />
      </div>
    );
  }

  // ── ACTIVE VIEW ────────────────────────────────────────────────────────────
  if (phase === "active" && activeWorkout) {
    const exercises = activeWorkout.exercises || [];
    const ex = exercises[exerciseIndex];
    const progress = ((exerciseIndex + 1) / exercises.length) * 100;

    return (
      <div style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        padding: "24px",
        maxWidth: "540px",
        margin: "0 auto",
      }}>
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingTop: "16px" }}>
          <button
            onClick={() => { setPhase("browse"); navigate("/treino"); }}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "8px 14px",
              color: "var(--text-2)",
              cursor: "pointer",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            ← Sair
          </button>
          <div style={{ color: "var(--accent)", fontSize: "20px", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>
            {formatTime(elapsed)}
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ height: "4px", background: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${progress}%`,
              background: "var(--accent)",
              borderRadius: "2px",
              transition: "width 0.4s ease-out",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
            <p className="label" style={{ color: "var(--text-3)" }}>{exerciseIndex + 1} / {exercises.length}</p>
            <p className="label" style={{ color: "var(--text-3)" }}>{activeWorkout.name}</p>
          </div>
        </div>

        {/* Exercise card */}
        <div style={{ flex: 1 }}>
          <div className="animate-fade-up" key={exerciseIndex} style={{
            background: "var(--surface)",
            border: "1px solid var(--accent)",
            borderRadius: "20px",
            padding: "28px",
            marginBottom: "20px",
          }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
              {ex?.sets && (
                <span className="label" style={{ background: "var(--accent-glow)", border: "1px solid var(--accent)", borderRadius: "6px", padding: "3px 10px", color: "var(--accent)", fontSize: "11px" }}>
                  {ex.sets} SÉRIES
                </span>
              )}
              {ex?.reps && (
                <span className="label" style={{ background: "var(--accent-glow)", border: "1px solid var(--accent)", borderRadius: "6px", padding: "3px 10px", color: "var(--accent)", fontSize: "11px" }}>
                  {ex.reps} REPS
                </span>
              )}
              {ex?.duration && (
                <span className="label" style={{ background: "var(--accent-glow)", border: "1px solid var(--accent)", borderRadius: "6px", padding: "3px 10px", color: "var(--accent)", fontSize: "11px" }}>
                  {ex.duration}
                </span>
              )}
              {ex?.tempo && (
                <span className="label" style={{ background: "rgba(156,120,80,0.12)", border: "1px solid rgba(156,120,80,0.3)", borderRadius: "6px", padding: "3px 10px", color: "var(--text-2)", fontSize: "11px" }}>
                  TEMPO {ex.tempo}
                </span>
              )}
              {ex?.rest && (
                <span className="label" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "6px", padding: "3px 10px", color: "var(--text-3)", fontSize: "11px" }}>
                  ⏱ {ex.rest} DESCANSO
                </span>
              )}
            </div>
            <h2 className="display" style={{ fontSize: "36px", color: "var(--text)", marginBottom: "16px", lineHeight: 1.1 }}>
              {ex?.name}
            </h2>
            <p style={{ color: "var(--text)", fontSize: "15px", lineHeight: 1.7, marginBottom: "20px" }}>
              {ex?.instruction}
            </p>
            {ex?.cue && (
              <div style={{
                background: "var(--accent-glow)",
                borderLeft: "3px solid var(--accent)",
                padding: "12px 16px",
                borderRadius: "0 8px 8px 0",
                marginBottom: "16px",
              }}>
                <p style={{ color: "var(--accent)", fontSize: "14px", fontStyle: "italic" }}>
                  "{ex.cue}"
                </p>
              </div>
            )}

          </div>

          {/* Pain check */}
          {ex?.safetyNote && (
            <div style={{
              background: "rgba(224,82,82,0.06)",
              border: "1px solid rgba(224,82,82,0.2)",
              borderRadius: "12px",
              padding: "14px 16px",
              marginBottom: "20px",
            }}>
              <p style={{ color: "var(--danger)", fontSize: "13px", marginBottom: "10px", fontWeight: 500 }}>
                ⚠ {ex.safetyNote}
              </p>
              <button
                onClick={() => { setPainStop(true); setPhase("browse"); }}
                style={{
                  background: "transparent",
                  border: "1px solid var(--danger)",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  color: "var(--danger)",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Sinto dor — parar aqui
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ paddingBottom: "24px" }}>
          {exerciseIndex < exercises.length - 1 ? (
            <button
              onClick={() => setExerciseIndex(i => i + 1)}
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
              }}
            >
              Feito — Próximo
            </button>
          ) : (
            <div>
              {/* Effort rating */}
              <p className="label" style={{ color: "var(--text-3)", marginBottom: "12px", textAlign: "center" }}>
                Como foi o treino?
              </p>
              <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                {([
                  { value: "facil" as EffortRating, label: "Fácil", color: "var(--success)" },
                  { value: "ok" as EffortRating, label: "No ponto", color: "var(--accent)" },
                  { value: "demais" as EffortRating, label: "Demais", color: "var(--danger)" },
                ]).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setEffort(opt.value)}
                    style={{
                      flex: 1,
                      padding: "14px",
                      background: effort === opt.value ? `${opt.color}20` : "var(--surface)",
                      border: `1px solid ${effort === opt.value ? opt.color : "var(--border)"}`,
                      borderRadius: "10px",
                      color: effort === opt.value ? opt.color : "var(--text-2)",
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700,
                      fontSize: "15px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <button
                onClick={handleFinishWorkout}
                disabled={!effort || finishSession.isPending}
                style={{
                  width: "100%",
                  padding: "18px",
                  background: effort ? "var(--accent)" : "var(--border)",
                  color: effort ? "#000" : "var(--text-3)",
                  border: "none",
                  borderRadius: "12px",
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: "20px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: effort ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                }}
              >
                {finishSession.isPending ? "A guardar..." : "Treino concluído"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── DONE VIEW ──────────────────────────────────────────────────────────────
  if (phase === "done") {
    const messages: Record<EffortRating, string> = {
      facil: "Boa. Próxima vez, sobe um nível.",
      ok: "Perfeito. Esse é o ponto certo.",
      demais: "Mais leve da próxima. O corpo também fala.",
    };

    return (
      <div style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
      }}>
        <div className="animate-fade-up" style={{
          width: "100px",
          height: "100px",
          background: "var(--accent-glow)",
          border: "2px solid var(--accent)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "32px",
          fontSize: "48px",
        }}>
          ✓
        </div>
        <h1 className="animate-fade-up delay-1 display" style={{ fontSize: "52px", color: "var(--text)", marginBottom: "12px" }}>
          FEITO.
        </h1>
        <p className="animate-fade-up delay-2" style={{ color: "var(--accent)", fontSize: "18px", marginBottom: "8px" }}>
          {activeWorkout?.finishMessage}
        </p>
        {effort && (
          <p className="animate-fade-up delay-3" style={{ color: "var(--text-2)", fontSize: "15px", marginBottom: "48px" }}>
            {messages[effort]}
          </p>
        )}
        <div className="animate-fade-up delay-3" style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "20px 32px",
          marginBottom: "32px",
          display: "flex",
          gap: "32px",
        }}>
          <div>
            <div className="headline" style={{ fontSize: "28px", color: "var(--text)" }}>{formatTime(elapsed)}</div>
            <div className="label" style={{ color: "var(--text-3)" }}>Tempo</div>
          </div>
          <div style={{ width: "1px", background: "var(--border)" }} />
          <div>
            <div className="headline" style={{ fontSize: "28px", color: "var(--text)" }}>{activeWorkout?.exercises?.length || 0}</div>
            <div className="label" style={{ color: "var(--text-3)" }}>Exercícios</div>
          </div>
        </div>
        <button
          onClick={() => { setPhase("browse"); navigate("/"); }}
          style={{
            padding: "16px 40px",
            background: "var(--accent)",
            color: "#000",
            border: "none",
            borderRadius: "12px",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: "18px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Voltar ao início
        </button>
      </div>
    );
  }

  return null;
}
