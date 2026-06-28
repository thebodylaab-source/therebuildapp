import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import { authClient } from "../lib/auth";

const QUESTIONS = [
  {
    id: "change",
    step: 1,
    title: "O que mudou?",
    subtitle: "Sem julgamentos. Só precisamos de entender.",
    type: "multi",
    options: [
      { value: "trabalho", label: "O trabalho tomou conta de tudo" },
      { value: "familia", label: "Família e filhos em primeiro lugar" },
      { value: "lesao", label: "Uma lesão que me travou" },
      { value: "energia", label: "Perdi a energia e a motivação" },
      { value: "vida", label: "A vida foi acontecendo" },
    ],
  },
  {
    id: "best",
    step: 2,
    title: "Como te sentias no teu melhor?",
    subtitle: "Não vamos buscar esse homem. Mas queremos saber o que procuras.",
    type: "multi",
    options: [
      { value: "energia", label: "Com energia para tudo" },
      { value: "forca", label: "Forte e capaz" },
      { value: "confianca", label: "Confiante no meu corpo" },
      { value: "clareza", label: "Com clareza mental" },
      { value: "sono", label: "A dormir bem" },
    ],
  },
  {
    id: "functional",
    step: 3,
    title: "Avaliação honesta",
    subtitle: "Sem balança. Sem fotos. Só perguntas funcionais.",
    type: "functional",
    questions: [
      { id: "stairs", text: "Sobas 2 lanços de escadas sem ofegar?" },
      { id: "floor", text: "Levantas-te do chão sem usar as mãos?" },
      { id: "lift", text: "Consegues carregar as compras sem dor?" },
    ],
  },
  {
    id: "time",
    step: 4,
    title: "7 minutos. Hoje.",
    subtitle: "Esse é o compromisso mínimo. Só isso.",
    type: "commitment",
  },
  {
    id: "firstworkout",
    step: 5,
    title: "O teu primeiro treino",
    subtitle: "7 minutos. Agora. Terminas isto com streak = 1.",
    type: "workout",
  },
];

type Answers = Record<string, any>;

export default function OnboardingPage() {
  const [, navigate] = useLocation();
  const { data: sessionData } = authClient.useSession();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [workoutStep, setWorkoutStep] = useState(0);
  const [workoutDone, setWorkoutDone] = useState(false);

  const saveProfile = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.profile.$post({ json: data });
      return res.json();
    },
  });

  const saveSession = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.sessions.$post({ json: data });
      return res.json();
    },
  });

  const q = QUESTIONS[step];

  function determineSegment(): "ocupado" | "regressado" | "sedentario" {
    const changes = answers.change || [];
    if (changes.includes("trabalho") || changes.includes("familia")) return "ocupado";
    if (changes.includes("lesao")) return "regressado";
    return "sedentario";
  }

  async function finishOnboarding() {
    const segment = determineSegment();
    await saveProfile.mutateAsync({
      segment,
      onboardingDone: true,
      currentPhase: "fundacao",
      phaseWeek: 1,
    });
    await saveSession.mutateAsync({
      workoutId: "f-7-reset-basico",
      workoutName: "Reset Básico",
      workoutType: "reset",
      durationMinutes: 7,
      effortRating: "ok",
      completed: true,
    });
    navigate("/");
  }

  function toggleMulti(field: string, value: string) {
    setAnswers(prev => {
      const current = prev[field] || [];
      const next = current.includes(value) ? current.filter((v: string) => v !== value) : [...current, value];
      return { ...prev, [field]: next };
    });
  }

  function setFunctional(field: string, value: boolean) {
    setAnswers(prev => ({
      ...prev,
      functional: { ...(prev.functional || {}), [field]: value },
    }));
  }

  const firstWorkoutExercises = [
    { name: "Respiração Profunda", duration: "1 min", instruction: "Mão na barriga. Inspira 4s, expira 6s. Deixa o ar vir até à barriga." },
    { name: "Cat-Cow", reps: "8 repetições", instruction: "Gatas. Arqueia a coluna para baixo (inspira), curva para cima (expira). Lento." },
    { name: "Agachamento Assistido", reps: "5 repetições", instruction: "Segura numa cadeira. Desce devagar. Sem pressa. Sobe controlado." },
    { name: "Respiração Final", duration: "1 min", instruction: "Fecha os olhos. Inspira fundo, expira devagar. Feito." },
  ];

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
      {/* Progress bar */}
      <div style={{ marginBottom: "40px", paddingTop: "16px" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {QUESTIONS.map((_, i) => (
            <div key={i} style={{
              flex: 1,
              height: "3px",
              borderRadius: "2px",
              background: i <= step ? "var(--accent)" : "var(--border)",
              transition: "background 0.3s",
            }} />
          ))}
        </div>
        <p className="label" style={{ color: "var(--text-3)", marginTop: "8px" }}>
          Passo {step + 1} de {QUESTIONS.length}
        </p>
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        {/* STEP 1 & 2 — multi select */}
        {(q.type === "multi") && (
          <div className="animate-fade-up" key={step}>
            <h1 className="display" style={{ fontSize: "42px", color: "var(--text)", marginBottom: "8px", lineHeight: 1.1 }}>
              {q.title}
            </h1>
            <p style={{ color: "var(--text-2)", marginBottom: "32px", fontSize: "15px" }}>{q.subtitle}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {q.options?.map(opt => {
                const selected = (answers[q.id] || []).includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleMulti(q.id, opt.value)}
                    style={{
                      padding: "18px 20px",
                      background: selected ? "var(--accent-glow)" : "var(--surface)",
                      border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                      borderRadius: "12px",
                      color: selected ? "var(--accent)" : "var(--text)",
                      fontSize: "15px",
                      fontFamily: "'Inter', sans-serif",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3 — functional */}
        {q.type === "functional" && (
          <div className="animate-fade-up" key={step}>
            <h1 className="display" style={{ fontSize: "42px", color: "var(--text)", marginBottom: "8px", lineHeight: 1.1 }}>
              {q.title}
            </h1>
            <p style={{ color: "var(--text-2)", marginBottom: "32px", fontSize: "15px" }}>{q.subtitle}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {q.questions?.map(fq => {
                const val = (answers.functional || {})[fq.id];
                return (
                  <div key={fq.id} style={{
                    padding: "20px",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                  }}>
                    <p style={{ color: "var(--text)", marginBottom: "14px", fontSize: "15px" }}>{fq.text}</p>
                    <div style={{ display: "flex", gap: "10px" }}>
                      {[{ label: "Sim", value: true }, { label: "Não (ainda)", value: false }].map(opt => (
                        <button
                          key={String(opt.value)}
                          onClick={() => setFunctional(fq.id, opt.value)}
                          style={{
                            flex: 1,
                            padding: "12px",
                            background: val === opt.value ? (opt.value ? "rgba(76,175,130,0.15)" : "rgba(224,82,82,0.1)") : "var(--surface2)",
                            border: `1px solid ${val === opt.value ? (opt.value ? "var(--success)" : "var(--danger)") : "var(--border)"}`,
                            borderRadius: "8px",
                            color: val === opt.value ? (opt.value ? "var(--success)" : "var(--danger)") : "var(--text-2)",
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
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4 — commitment */}
        {q.type === "commitment" && (
          <div className="animate-fade-up" key={step}>
            <h1 className="display" style={{ fontSize: "52px", color: "var(--text)", marginBottom: "8px", lineHeight: 1 }}>
              {q.title}
            </h1>
            <p style={{ color: "var(--text-2)", marginBottom: "40px", fontSize: "15px" }}>{q.subtitle}</p>
            <div style={{
              padding: "32px",
              background: "var(--accent-glow)",
              border: "1px solid var(--accent)",
              borderRadius: "16px",
              textAlign: "center",
              marginBottom: "32px",
            }}>
              <div className="display" style={{ fontSize: "80px", color: "var(--accent)", lineHeight: 1 }}>7</div>
              <div className="label" style={{ color: "var(--accent)", marginTop: "8px" }}>Minutos por dia</div>
              <p style={{ color: "var(--text-2)", marginTop: "16px", fontSize: "14px", lineHeight: 1.6 }}>
                Não precisas de uma hora. Não precisas de uma ginásio.<br />
                Precisas de aparecer. Só isso.
              </p>
            </div>
            <div style={{
              padding: "20px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
            }}>
              <p style={{ color: "var(--text-3)", fontSize: "13px", lineHeight: 1.7 }}>
                "Feito é melhor que perfeito. Aparecer é melhor que não aparecer. 
                7 minutos de movimento é melhor que zero. Sempre."
              </p>
            </div>
          </div>
        )}

        {/* STEP 5 — first workout */}
        {q.type === "workout" && (
          <div className="animate-fade-up" key={step}>
            {!workoutDone ? (
              <>
                <h1 className="display" style={{ fontSize: "42px", color: "var(--text)", marginBottom: "8px", lineHeight: 1.1 }}>
                  {q.title}
                </h1>
                <p style={{ color: "var(--text-2)", marginBottom: "32px", fontSize: "15px" }}>{q.subtitle}</p>
                
                {/* Progress */}
                <div style={{ marginBottom: "24px" }}>
                  <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
                    {firstWorkoutExercises.map((_, i) => (
                      <div key={i} style={{
                        flex: 1,
                        height: "3px",
                        borderRadius: "2px",
                        background: i <= workoutStep ? "var(--accent)" : "var(--border)",
                        transition: "background 0.3s",
                      }} />
                    ))}
                  </div>
                  <p className="label" style={{ color: "var(--text-3)" }}>
                    {workoutStep + 1}/{firstWorkoutExercises.length} — {firstWorkoutExercises[workoutStep].name}
                  </p>
                </div>

                {/* Current exercise */}
                <div style={{
                  padding: "28px",
                  background: "var(--surface)",
                  border: "1px solid var(--accent)",
                  borderRadius: "16px",
                  marginBottom: "24px",
                }}>
                  <div className="headline" style={{ fontSize: "28px", color: "var(--accent)", marginBottom: "6px" }}>
                    {firstWorkoutExercises[workoutStep].name}
                  </div>
                  <p className="label" style={{ color: "var(--text-3)", marginBottom: "16px" }}>
                    {firstWorkoutExercises[workoutStep].duration || firstWorkoutExercises[workoutStep].reps}
                  </p>
                  <p style={{ color: "var(--text)", fontSize: "15px", lineHeight: 1.7 }}>
                    {firstWorkoutExercises[workoutStep].instruction}
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (workoutStep < firstWorkoutExercises.length - 1) {
                      setWorkoutStep(s => s + 1);
                    } else {
                      setWorkoutDone(true);
                    }
                  }}
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
                  {workoutStep < firstWorkoutExercises.length - 1 ? "Feito — Próximo" : "Terminar Treino"}
                </button>
              </>
            ) : (
              <div className="animate-fade-up" style={{ textAlign: "center", paddingTop: "40px" }}>
                <div style={{
                  width: "80px",
                  height: "80px",
                  background: "var(--accent-glow)",
                  border: "2px solid var(--accent)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                  fontSize: "36px",
                }}>
                  ✓
                </div>
                <h2 className="display" style={{ fontSize: "48px", color: "var(--text)", marginBottom: "12px" }}>
                  STREAK: <span style={{ color: "var(--accent)" }}>1</span>
                </h2>
                <p style={{ color: "var(--text-2)", marginBottom: "8px", fontSize: "15px" }}>
                  Apareceste. Isso já é metade da batalha.
                </p>
                <p style={{ color: "var(--text-3)", marginBottom: "40px", fontSize: "14px" }}>
                  Não estás a começar — estás a recomeçar.
                </p>
                <button
                  onClick={finishOnboarding}
                  disabled={saveProfile.isPending}
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
                  {saveProfile.isPending ? "A guardar..." : "Entrar na App"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      {q.type !== "workout" && (
        <div style={{ paddingTop: "32px", display: "flex", gap: "12px" }}>
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              style={{
                padding: "16px 24px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                color: "var(--text-2)",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 600,
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              ←
            </button>
          )}
          <button
            onClick={() => setStep(s => s + 1)}
            style={{
              flex: 1,
              padding: "16px",
              background: "var(--accent)",
              color: "#000",
              border: "none",
              borderRadius: "10px",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: "18px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            {step === QUESTIONS.length - 2 ? "Fazer o primeiro treino" : "Continuar"}
          </button>
        </div>
      )}
    </div>
  );
}
