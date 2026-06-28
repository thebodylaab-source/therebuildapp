import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { authClient } from "../lib/auth";
import { useLocation } from "wouter";

const PHASES = ["fundacao", "construcao", "forca"] as const;
const TYPES = ["forca", "recuperacao", "cardio", "reset"] as const;
const DURATIONS = [7, 10, 15, 20, 25, 30, 45, 60] as const;
const DOC_PHASES = ["todas", "fundacao", "construcao", "forca"] as const;
const VIDEO_CATS = ["tecnica", "nutricao", "motivacao", "outro"] as const;

const TAG_OPTIONS = [
  { key: "sono",      label: "Sono" },
  { key: "hormonas",  label: "Hormonas" },
  { key: "pesquisa",  label: "Pesquisa" },
  { key: "filhos",    label: "Família" },
  { key: "nutricao",  label: "Nutrição" },
  { key: "treino",    label: "Treino" },
  { key: "mindset",   label: "Mindset" },
  { key: "outro",     label: "Outro" },
];

const phaseLabel: Record<string, string> = {
  fundacao: "Fundação",
  construcao: "Construção",
  forca: "Força",
  todas: "Todas",
};
const typeLabel: Record<string, string> = {
  forca: "Força",
  recuperacao: "Recuperação",
  cardio: "Cardio",
  reset: "Reset",
};
const catLabel: Record<string, string> = {
  tecnica: "Técnica",
  nutricao: "Nutrição",
  motivacao: "Motivação",
  outro: "Outro",
};

type Tab = "treinos" | "documentos" | "videos";

const EMPTY_WORKOUT = {
  name: "",
  phase: "fundacao" as (typeof PHASES)[number],
  type: "forca" as (typeof TYPES)[number],
  durationMinutes: 15 as (typeof DURATIONS)[number],
  description: "",
  finishMessage: "",
  exercises: [{ name: "", sets: "", reps: "", duration: "", tempo: "", rest: "", instruction: "", cue: "", safetyNote: "" }],
};

export default function AdminPage() {
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("treinos");

  // ── Auth check ────────────────────────────────────────────────────────────
  const { data: sessionData, isPending: sessionLoading } = authClient.useSession();

  const user = sessionData?.user;
  const isAdmin = user?.email === "thebodylaab@gmail.com";

  if (sessionLoading) return <div style={{ padding: "40px", color: "var(--text-2)", fontFamily: "'Inter', sans-serif" }}>A verificar...</div>;
  if (!isAdmin) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
          <h2 style={{ color: "var(--text)", marginBottom: "8px" }}>Acesso restrito</h2>
          <p style={{ color: "var(--text-2)", marginBottom: "24px" }}>Só o admin pode aceder a esta área.</p>
          <button onClick={() => navigate("/")} style={btnStyle("var(--accent)")}>Voltar</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "20px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "var(--text-2)", cursor: "pointer", fontSize: "20px" }}>←</button>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "28px", fontWeight: 800, color: "var(--text)", margin: 0 }}>PAINEL ADMIN</h1>
          <p style={{ color: "var(--accent)", fontSize: "12px", margin: 0 }}>THEREBUILD · {user?.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
        {(["treinos", "documentos", "videos"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "14px", background: "none", border: "none",
            borderBottom: tab === t ? "2px solid var(--accent)" : "2px solid transparent",
            color: tab === t ? "var(--accent)" : "var(--text-2)",
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
            fontSize: "16px", letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer",
            transition: "all 0.2s",
          }}>
            {t === "treinos" ? "Treinos" : t === "documentos" ? "Documentos" : "Vídeos"}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
        {tab === "treinos" && <AdminWorkouts qc={qc} />}
        {tab === "documentos" && <AdminDocuments qc={qc} />}
        {tab === "videos" && <AdminVideos qc={qc} />}
      </div>
    </div>
  );
}

// ── TREINOS ───────────────────────────────────────────────────────────────────

function AdminWorkouts({ qc }: { qc: any }) {
  const [form, setForm] = useState({ ...EMPTY_WORKOUT });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-workouts"],
    queryFn: async () => (await (api as any).admin.workouts.$get()).json(),
  });

  const create = useMutation({
    mutationFn: async (body: any) => (await (api as any).admin.workouts.$post({ json: body })).json(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-workouts"] }); resetForm(); },
  });

  const update = useMutation({
    mutationFn: async ({ id, body }: any) => (await (api as any).admin.workouts[":id"].$put({ param: { id }, json: body })).json(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-workouts"] }); resetForm(); },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => (await (api as any).admin.workouts[":id"].$delete({ param: { id } })).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-workouts"] }),
  });

  const workouts = (data as any)?.workouts || [];

  function resetForm() { setForm({ ...EMPTY_WORKOUT }); setEditingId(null); setOpen(false); }

  function startEdit(w: any) {
    const exs = typeof w.exercises === "string" ? JSON.parse(w.exercises) : w.exercises;
    setForm({ ...w, exercises: exs.map((e: any) => ({ name: e.name || "", sets: e.sets?.toString() || "", reps: e.reps || "", duration: e.duration || "", tempo: e.tempo || "", rest: e.rest || "", instruction: e.instruction || "", cue: e.cue || "", safetyNote: e.safetyNote || "" })) });
    setEditingId(w.id);
    setOpen(true);
  }

  function handleSubmit() {
    const body = {
      ...form,
      exercises: JSON.stringify(form.exercises.map(e => ({
        name: e.name, instruction: e.instruction, cue: e.cue,
        ...(e.sets ? { sets: Number(e.sets) } : {}),
        ...(e.reps ? { reps: e.reps } : {}),
        ...(e.duration ? { duration: e.duration } : {}),
        ...(e.tempo ? { tempo: e.tempo } : {}),
        ...(e.rest ? { rest: e.rest } : {}),
        ...(e.safetyNote ? { safetyNote: e.safetyNote } : {}),
      }))),
    };
    if (editingId) update.mutate({ id: editingId, body });
    else create.mutate(body);
  }

  function addExercise() {
    setForm(f => ({ ...f, exercises: [...f.exercises, { name: "", sets: "", reps: "", duration: "", tempo: "", rest: "", instruction: "", cue: "", safetyNote: "" }] }));
  }

  function removeExercise(i: number) {
    setForm(f => ({ ...f, exercises: f.exercises.filter((_, idx) => idx !== i) }));
  }

  function updateExercise(i: number, field: string, val: string) {
    setForm(f => ({ ...f, exercises: f.exercises.map((e, idx) => idx === i ? { ...e, [field]: val } : e) }));
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "24px", color: "var(--text)", margin: 0 }}>
            TREINOS DA BASE DE DADOS
          </h2>
          <p style={{ color: "var(--text-2)", fontSize: "13px", marginTop: "4px" }}>
            {workouts.length} treino{workouts.length !== 1 ? "s" : ""} adicionados
          </p>
        </div>
        <button onClick={() => { resetForm(); setOpen(true); }} style={btnStyle("var(--accent)")}>+ Novo Treino</button>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div style={{ color: "var(--text-2)", fontSize: "14px" }}>A carregar...</div>
      ) : workouts.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-3)", border: "1px dashed var(--border)", borderRadius: "12px" }}>
          Ainda sem treinos adicionados. Clica em "Novo Treino" para começar.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {workouts.map((w: any) => (
            <div key={w.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
                  <Tag color="var(--accent)">{phaseLabel[w.phase]}</Tag>
                  <Tag color="var(--text-3)">{typeLabel[w.type]}</Tag>
                  <Tag color="var(--text-3)">{w.durationMinutes}min</Tag>
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "18px", fontWeight: 700, color: "var(--text)" }}>{w.name}</div>
                <div style={{ color: "var(--text-2)", fontSize: "12px", marginTop: "2px" }}>{w.description?.substring(0, 80)}...</div>
              </div>
              <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                <button onClick={() => startEdit(w)} style={btnSmall("var(--text-2)", "var(--border)")}>Editar</button>
                <button onClick={() => { if (confirm("Apagar este treino?")) remove.mutate(w.id); }} style={btnSmall("var(--danger)", "rgba(224,82,82,0.2)")}>Apagar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal / Form */}
      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, overflowY: "auto", padding: "24px" }}>
          <div style={{ background: "var(--bg)", borderRadius: "16px", maxWidth: "700px", margin: "0 auto", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "22px", color: "var(--text)", margin: 0 }}>
                {editingId ? "EDITAR TREINO" : "NOVO TREINO"}
              </h3>
              <button onClick={resetForm} style={{ background: "none", border: "none", color: "var(--text-2)", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
              <FormField label="Nome do treino">
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ex: Força para Iniciantes" style={inputStyle} />
              </FormField>
              <FormField label="Fase">
                <select value={form.phase} onChange={e => setForm(f => ({ ...f, phase: e.target.value as any }))} style={inputStyle}>
                  {PHASES.map(p => <option key={p} value={p}>{phaseLabel[p]}</option>)}
                </select>
              </FormField>
              <FormField label="Tipo">
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))} style={inputStyle}>
                  {TYPES.map(t => <option key={t} value={t}>{typeLabel[t]}</option>)}
                </select>
              </FormField>
              <FormField label="Duração (min)">
                <select value={form.durationMinutes} onChange={e => setForm(f => ({ ...f, durationMinutes: Number(e.target.value) as any }))} style={inputStyle}>
                  {DURATIONS.map(d => <option key={d} value={d}>{d} min</option>)}
                </select>
              </FormField>
            </div>

            <FormField label="Descrição curta">
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
            </FormField>

            <FormField label="Mensagem de conclusão">
              <input value={form.finishMessage} onChange={e => setForm(f => ({ ...f, finishMessage: e.target.value }))} placeholder="ex: Feito. O corpo registou." style={inputStyle} />
            </FormField>

            {/* Exercícios */}
            <div style={{ marginTop: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <label style={labelStyle}>Exercícios ({form.exercises.length})</label>
                <button onClick={addExercise} style={btnSmall("var(--accent)", "var(--accent-glow)")}>+ Exercício</button>
              </div>

              {form.exercises.map((ex, i) => (
                <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "14px", marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "14px", fontWeight: 700, color: "var(--accent)" }}>#{i + 1}</span>
                    {form.exercises.length > 1 && (
                      <button onClick={() => removeExercise(i)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "12px" }}>Remover</button>
                    )}
                  </div>
                  <FormField label="Nome do exercício">
                    <input value={ex.name} onChange={e => updateExercise(i, "name", e.target.value)} placeholder="ex: Hip Thrust com Barra" style={{ ...inputStyle, fontSize: "13px" }} />
                  </FormField>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px", marginTop: "8px", marginBottom: "8px" }}>
                    <FormField label="Séries">
                      <input value={ex.sets} onChange={e => updateExercise(i, "sets", e.target.value)} placeholder="3" style={{ ...inputStyle, fontSize: "13px" }} />
                    </FormField>
                    <FormField label="Reps">
                      <input value={ex.reps} onChange={e => updateExercise(i, "reps", e.target.value)} placeholder="10-12" style={{ ...inputStyle, fontSize: "13px" }} />
                    </FormField>
                    <FormField label="Duração">
                      <input value={ex.duration} onChange={e => updateExercise(i, "duration", e.target.value)} placeholder="30s" style={{ ...inputStyle, fontSize: "13px" }} />
                    </FormField>
                    <FormField label="Descanso">
                      <input value={ex.rest} onChange={e => updateExercise(i, "rest", e.target.value)} placeholder="60s" style={{ ...inputStyle, fontSize: "13px" }} />
                    </FormField>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <FormField label="Velocidade/Tempo (ex: 3-1-2-0)">
                      <input value={ex.tempo} onChange={e => updateExercise(i, "tempo", e.target.value)} placeholder="ex: 2-0-2-0 (exc-pausa-conc-topo)" style={{ ...inputStyle, fontSize: "13px" }} />
                    </FormField>
                    <FormField label="Nota de segurança (opcional)">
                      <input value={ex.safetyNote} onChange={e => updateExercise(i, "safetyNote", e.target.value)} placeholder="ex: Dor no joelho = para" style={{ ...inputStyle, fontSize: "13px" }} />
                    </FormField>
                  </div>
                  <FormField label="Instrução">
                    <textarea value={ex.instruction} onChange={e => updateExercise(i, "instruction", e.target.value)} rows={2} style={{ ...inputStyle, fontSize: "13px", resize: "vertical" }} />
                  </FormField>
                  <FormField label="Cue de coaching">
                    <input value={ex.cue} onChange={e => updateExercise(i, "cue", e.target.value)} placeholder='ex: "Aperta como se fosse laranja."' style={{ ...inputStyle, fontSize: "13px" }} />
                  </FormField>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button onClick={resetForm} style={{ ...btnStyle("var(--border)"), color: "var(--text-2)", flex: "0 0 auto" }}>Cancelar</button>
              <button
                onClick={handleSubmit}
                disabled={create.isPending || update.isPending}
                style={{ ...btnStyle("var(--accent)"), flex: 1 }}
              >
                {create.isPending || update.isPending ? "A guardar..." : editingId ? "Guardar alterações" : "Criar treino"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── DOCUMENTOS ────────────────────────────────────────────────────────────────

function AdminDocuments({ qc }: { qc: any }) {
  const [form, setForm] = useState({ title: "", description: "", fileUrl: "", fileType: "pdf", phase: "todas", tags: [] as string[] });
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-documents"],
    queryFn: async () => (await (api as any).admin.documents.$get()).json(),
  });

  const create = useMutation({
    mutationFn: async (body: any) => (await (api as any).admin.documents.$post({ json: body })).json(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-documents"] }); setForm({ title: "", description: "", fileUrl: "", fileType: "pdf", phase: "todas", tags: [] }); setOpen(false); },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => (await (api as any).admin.documents[":id"].$delete({ param: { id } })).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-documents"] }),
  });

  const docs = (data as any)?.documents || [];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "24px", color: "var(--text)", margin: 0 }}>DOCUMENTOS</h2>
          <p style={{ color: "var(--text-2)", fontSize: "13px", marginTop: "4px" }}>{docs.length} documento{docs.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setOpen(true)} style={btnStyle("var(--accent)")}>+ Novo Documento</button>
      </div>

      {isLoading ? (
        <div style={{ color: "var(--text-2)", fontSize: "14px" }}>A carregar...</div>
      ) : docs.length === 0 ? (
        <EmptyState text="Ainda sem documentos. Cola um link de PDF ou Google Drive." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {docs.map((d: any) => (
            <div key={d.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
                  <Tag color="var(--accent)">{phaseLabel[d.phase] || d.phase}</Tag>
                  <Tag color="var(--text-3)">{d.fileType?.toUpperCase()}</Tag>
                </div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "18px", fontWeight: 700, color: "var(--text)" }}>{d.title}</div>
                {d.description && <div style={{ color: "var(--text-2)", fontSize: "12px", marginTop: "2px" }}>{d.description}</div>}
                <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontSize: "12px", wordBreak: "break-all" }}>{d.fileUrl}</a>
              </div>
              <button onClick={() => { if (confirm("Apagar este documento?")) remove.mutate(d.id); }} style={{ ...btnSmall("var(--danger)", "rgba(224,82,82,0.2)"), flexShrink: 0 }}>Apagar</button>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ background: "var(--bg)", borderRadius: "16px", width: "100%", maxWidth: "500px", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "22px", color: "var(--text)", margin: 0 }}>NOVO DOCUMENTO</h3>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "var(--text-2)", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <FormField label="Título">
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="ex: Guia de Nutrição" style={inputStyle} />
              </FormField>
              <FormField label="Descrição (opcional)">
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Uma frase curta sobre o documento" style={inputStyle} />
              </FormField>
              <FormField label="URL do ficheiro (PDF, Drive, Dropbox...)">
                <input value={form.fileUrl} onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))} placeholder="https://..." style={inputStyle} />
              </FormField>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <FormField label="Tipo">
                  <select value={form.fileType} onChange={e => setForm(f => ({ ...f, fileType: e.target.value }))} style={inputStyle}>
                    <option value="pdf">PDF</option>
                    <option value="doc">DOC</option>
                    <option value="other">Outro</option>
                  </select>
                </FormField>
                <FormField label="Fase">
                  <select value={form.phase} onChange={e => setForm(f => ({ ...f, phase: e.target.value }))} style={inputStyle}>
                    {DOC_PHASES.map(p => <option key={p} value={p}>{phaseLabel[p]}</option>)}
                  </select>
                </FormField>
              </div>
              <TagChipSelector selected={form.tags} onChange={tags => setForm(f => ({ ...f, tags }))} />
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button onClick={() => setOpen(false)} style={{ ...btnStyle("var(--border)"), color: "var(--text-2)" }}>Cancelar</button>
              <button onClick={() => create.mutate({ ...form, tags: form.tags })} disabled={create.isPending || !form.title || !form.fileUrl} style={{ ...btnStyle("var(--accent)"), flex: 1 }}>
                {create.isPending ? "A guardar..." : "Adicionar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── VÍDEOS ────────────────────────────────────────────────────────────────────

function AdminVideos({ qc }: { qc: any }) {
  const [form, setForm] = useState({ title: "", description: "", videoUrl: "", phase: "todas", category: "tecnica", tags: [] as string[] });
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-videos"],
    queryFn: async () => (await (api as any).admin.videos.$get()).json(),
  });

  const create = useMutation({
    mutationFn: async (body: any) => (await (api as any).admin.videos.$post({ json: body })).json(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-videos"] }); setForm({ title: "", description: "", videoUrl: "", phase: "todas", category: "tecnica", tags: [] }); setOpen(false); },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => (await (api as any).admin.videos[":id"].$delete({ param: { id } })).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-videos"] }),
  });

  const videos = (data as any)?.videos || [];

  function getYtThumb(url: string) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "24px", color: "var(--text)", margin: 0 }}>VÍDEOS</h2>
          <p style={{ color: "var(--text-2)", fontSize: "13px", marginTop: "4px" }}>{videos.length} vídeo{videos.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setOpen(true)} style={btnStyle("var(--accent)")}>+ Novo Vídeo</button>
      </div>

      {isLoading ? (
        <div style={{ color: "var(--text-2)", fontSize: "14px" }}>A carregar...</div>
      ) : videos.length === 0 ? (
        <EmptyState text="Ainda sem vídeos. Cola um link do YouTube ou outro." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" }}>
          {videos.map((v: any) => {
            const thumb = getYtThumb(v.videoUrl);
            return (
              <div key={v.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
                {thumb && <img src={thumb} alt="" style={{ width: "100%", height: "140px", objectFit: "cover" }} />}
                <div style={{ padding: "14px" }}>
                  <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                    <Tag color="var(--accent)">{phaseLabel[v.phase] || v.phase}</Tag>
                    <Tag color="var(--text-3)">{catLabel[v.category] || v.category}</Tag>
                  </div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "16px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>{v.title}</div>
                  {v.description && <div style={{ color: "var(--text-2)", fontSize: "12px", marginBottom: "8px" }}>{v.description}</div>}
                  <div style={{ display: "flex", gap: "6px" }}>
                    <a href={v.videoUrl} target="_blank" rel="noopener noreferrer" style={{ ...btnSmall("var(--accent)", "var(--accent-glow)"), textDecoration: "none", fontSize: "12px" }}>Ver</a>
                    <button onClick={() => { if (confirm("Apagar este vídeo?")) remove.mutate(v.id); }} style={{ ...btnSmall("var(--danger)", "rgba(224,82,82,0.1)"), fontSize: "12px" }}>Apagar</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ background: "var(--bg)", borderRadius: "16px", width: "100%", maxWidth: "500px", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "22px", color: "var(--text)", margin: 0 }}>NOVO VÍDEO</h3>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "var(--text-2)", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <FormField label="Título">
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="ex: Como fazer um Hip Thrust perfeito" style={inputStyle} />
              </FormField>
              <FormField label="Descrição (opcional)">
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={inputStyle} />
              </FormField>
              <FormField label="URL do vídeo (YouTube, Vimeo, direto...)">
                <input value={form.videoUrl} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))} placeholder="https://youtube.com/watch?v=..." style={inputStyle} />
              </FormField>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <FormField label="Fase">
                  <select value={form.phase} onChange={e => setForm(f => ({ ...f, phase: e.target.value }))} style={inputStyle}>
                    {DOC_PHASES.map(p => <option key={p} value={p}>{phaseLabel[p]}</option>)}
                  </select>
                </FormField>
                <FormField label="Categoria">
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle}>
                    {VIDEO_CATS.map(c => <option key={c} value={c}>{catLabel[c]}</option>)}
                  </select>
                </FormField>
              </div>
              <TagChipSelector selected={form.tags} onChange={tags => setForm(f => ({ ...f, tags }))} />
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button onClick={() => setOpen(false)} style={{ ...btnStyle("var(--border)"), color: "var(--text-2)" }}>Cancelar</button>
              <button onClick={() => create.mutate({ ...form, tags: form.tags })} disabled={create.isPending || !form.title || !form.videoUrl} style={{ ...btnStyle("var(--accent)"), flex: 1 }}>
                {create.isPending ? "A guardar..." : "Adicionar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function TagChipSelector({ selected, onChange }: { selected: string[]; onChange: (tags: string[]) => void }) {
  const [freeText, setFreeText] = useState("");

  function toggle(key: string) {
    onChange(selected.includes(key) ? selected.filter(t => t !== key) : [...selected, key]);
  }

  function addFree() {
    const val = freeText.trim().toLowerCase().replace(/\s+/g, "-");
    if (val && !selected.includes(val)) onChange([...selected, val]);
    setFreeText("");
  }

  const extraTags = selected.filter(t => !TAG_OPTIONS.find(o => o.key === t));

  return (
    <div>
      <label style={labelStyle}>Tags / Categorias Info</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
        {TAG_OPTIONS.map(opt => {
          const active = selected.includes(opt.key);
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => toggle(opt.key)}
              style={{
                padding: "5px 12px", borderRadius: "20px", cursor: "pointer",
                border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                background: active ? "var(--accent)" : "var(--surface)",
                color: active ? "#000" : "var(--text-2)",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700, fontSize: "13px", letterSpacing: "0.04em",
                transition: "all 0.15s",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {extraTags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
          {extraTags.map(t => (
            <button key={t} type="button" onClick={() => toggle(t)} style={{
              padding: "4px 10px", borderRadius: "20px", cursor: "pointer",
              border: "1px solid var(--accent)", background: "var(--accent)",
              color: "#000", fontFamily: "'Inter', sans-serif", fontSize: "12px",
            }}>
              {t} ✕
            </button>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          value={freeText}
          onChange={e => setFreeText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addFree(); } }}
          placeholder="Tag personalizada... (Enter para adicionar)"
          style={{ ...inputStyle, fontSize: "13px", flex: 1 }}
        />
        <button type="button" onClick={addFree} style={btnSmall("var(--accent)", "var(--accent-glow)")}>+</button>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function Tag({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{
      padding: "2px 8px", borderRadius: "4px",
      background: `${color}18`, border: `1px solid ${color}40`,
      color, fontSize: "10px", fontFamily: "'Barlow Condensed', sans-serif",
      fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
    }}>
      {children}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ padding: "40px", textAlign: "center", color: "var(--text-3)", border: "1px dashed var(--border)", borderRadius: "12px", fontSize: "14px" }}>
      {text}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px",
  background: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: "8px", color: "var(--text)",
  fontFamily: "'Inter', sans-serif", fontSize: "14px",
  outline: "none", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "11px", fontWeight: 600,
  color: "var(--text-3)", marginBottom: "5px", letterSpacing: "0.05em",
  textTransform: "uppercase",
};

function btnStyle(bg: string): React.CSSProperties {
  return {
    padding: "10px 18px", background: bg, color: bg === "var(--accent)" ? "#000" : "var(--text)",
    border: "none", borderRadius: "8px", cursor: "pointer",
    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
    fontSize: "14px", letterSpacing: "0.04em",
  };
}

function btnSmall(color: string, bg: string): React.CSSProperties {
  return {
    padding: "6px 12px", background: bg, border: `1px solid ${color}`,
    borderRadius: "6px", color, cursor: "pointer",
    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
    fontSize: "13px",
  };
}
