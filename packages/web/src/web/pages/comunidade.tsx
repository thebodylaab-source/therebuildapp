import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { authClient } from "../lib/auth";
import { BottomNav } from "../components/nav";

type ComunidadeTab = "feed" | "tascos";

const CATEGORIES = [
  { value: "geral", label: "Geral" },
  { value: "vitoria", label: "Vitória" },
  { value: "regressei", label: "Regressei" },
  { value: "duvida", label: "Dúvida" },
];

// ── Tascos & Restaurantes ─────────────────────────────────────────────────────
interface TascoRec {
  id: string;
  userName: string;
  nome: string;
  cidade: string;
  tipo: string;
  nota: string;
  prato: string;
  emoji: string;
  createdAt: string;
}

const SEED_TASCOS: TascoRec[] = [
  {
    id: "t1", userName: "Miguel R.",
    nome: "Taberna da Rua das Flores", cidade: "Lisboa", tipo: "Taberna",
    nota: "Bacalhau à brás perfeito. Sem turistas, preços honestos.", prato: "Bacalhau à brás",
    emoji: "🐟", createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
  {
    id: "t2", userName: "André M.",
    nome: "O Zé da Mouraria", cidade: "Lisboa", tipo: "Tasca",
    nota: "Cozido à portuguesa às quartas. Reserva obrigatória.", prato: "Cozido à portuguesa",
    emoji: "🍲", createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "t3", userName: "Ricardo F.",
    nome: "Casa Guedes", cidade: "Porto", tipo: "Snack Bar",
    nota: "Sandes de pernil lendária. Fila enorme mas vale tudo.", prato: "Sandes de pernil",
    emoji: "🥩", createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: "t4", userName: "Luís C.",
    nome: "Adega Regional de Colares", cidade: "Sintra", tipo: "Adega",
    nota: "Cabrito no forno + vinho regional. Escondido mas incrível.", prato: "Cabrito assado",
    emoji: "🍷", createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
];

const TIPO_OPTIONS = ["Tasca","Taberna","Restaurante","Snack Bar","Adega","Marisqueira","Churrascaria","Outro"];

function TascosTab({ userName }: { userName: string }) {
  const [showForm, setShowForm] = useState(false);
  const [tascos, setTascos] = useState<TascoRec[]>(() => {
    try { return [...JSON.parse(localStorage.getItem("tascos_recs") || "[]"), ...SEED_TASCOS]; }
    catch { return SEED_TASCOS; }
  });
  const [form, setForm] = useState({ nome:"", cidade:"", tipo:"Tasca", nota:"", prato:"", emoji:"🍽️" });

  function submit() {
    if (!form.nome.trim() || !form.cidade.trim()) return;
    const novo: TascoRec = {
      id: Math.random().toString(36).slice(2),
      userName: userName || "Utilizador",
      nome: form.nome, cidade: form.cidade, tipo: form.tipo,
      nota: form.nota, prato: form.prato, emoji: form.emoji,
      createdAt: new Date().toISOString(),
    };
    const userRecs = tascos.filter(t => !t.id.startsWith("t"));
    const updated = [novo, ...userRecs];
    localStorage.setItem("tascos_recs", JSON.stringify(updated));
    setTascos([novo, ...tascos]);
    setForm({ nome:"", cidade:"", tipo:"Tasca", nota:"", prato:"", emoji:"🍽️" });
    setShowForm(false);
  }

  const EMOJI_OPTS = ["🍽️","🐟","🥩","🍲","🥗","🍷","🍺","🦐","🫒","🥚","🫙","🍖"];

  return (
    <div>
      {/* Intro */}
      <div style={{ marginBottom:"20px" }}>
        <p style={{ color:"var(--text-2)", fontSize:"14px", lineHeight:1.6 }}>
          Bom tasqueiro é bom da vida. Partilha os teus sítios favoritos com a comunidade.
        </p>
      </div>

      {/* Add button */}
      <button onClick={() => setShowForm(s => !s)} style={{
        width:"100%", padding:"14px 16px", marginBottom:"16px",
        background: showForm ? "var(--surface)" : "var(--accent-glow)",
        border:`1px solid ${showForm ? "var(--border)" : "var(--accent)"}`,
        borderRadius:"12px", color: showForm ? "var(--text-2)" : "var(--accent)",
        fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:"16px",
        cursor:"pointer", textAlign:"left",
      }}>
        {showForm ? "Cancelar" : "📍 Recomendar um sítio"}
      </button>

      {/* Form */}
      {showForm && (
        <div className="animate-fade-up" style={{
          background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"16px", padding:"20px", marginBottom:"20px",
        }}>
          {/* Emoji picker */}
          <p style={{ color:"var(--text-3)", fontSize:"11px", letterSpacing:"0.06em", marginBottom:"8px" }}>ÍCONE</p>
          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"16px" }}>
            {EMOJI_OPTS.map(e => (
              <button key={e} onClick={() => setForm(f => ({...f, emoji: e}))} style={{
                width:"38px", height:"38px", fontSize:"20px", border:`2px solid ${form.emoji === e ? "var(--accent)" : "var(--border)"}`,
                borderRadius:"8px", background: form.emoji === e ? "var(--accent-glow)" : "var(--bg)", cursor:"pointer",
              }}>{e}</button>
            ))}
          </div>

          {/* Nome + Cidade */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"12px" }}>
            {[
              { label:"NOME DO SÍTIO", key:"nome", placeholder:"Taberna do Zé" },
              { label:"CIDADE", key:"cidade", placeholder:"Lisboa" },
            ].map(f => (
              <div key={f.key}>
                <p style={{ color:"var(--text-3)", fontSize:"10px", letterSpacing:"0.06em", marginBottom:"6px" }}>{f.label}</p>
                <input type="text" value={(form as any)[f.key]} onChange={e => setForm(prev => ({...prev, [f.key]: e.target.value}))}
                  placeholder={f.placeholder} style={{
                    width:"100%", padding:"10px", background:"var(--bg)", border:"1px solid var(--border)",
                    borderRadius:"8px", color:"var(--text)", fontSize:"14px", fontFamily:"'Inter', sans-serif", outline:"none", boxSizing:"border-box",
                  }}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--accent)"}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = "var(--border)"}
                />
              </div>
            ))}
          </div>

          {/* Tipo */}
          <p style={{ color:"var(--text-3)", fontSize:"10px", letterSpacing:"0.06em", marginBottom:"6px" }}>TIPO</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"12px" }}>
            {TIPO_OPTIONS.map(t => (
              <button key={t} onClick={() => setForm(f => ({...f, tipo: t}))} style={{
                padding:"6px 12px", borderRadius:"20px", fontSize:"12px", cursor:"pointer",
                border:`1px solid ${form.tipo === t ? "var(--accent)" : "var(--border)"}`,
                background: form.tipo === t ? "var(--accent-glow)" : "transparent",
                color: form.tipo === t ? "var(--accent)" : "var(--text-3)",
              }}>{t}</button>
            ))}
          </div>

          {/* Prato + Nota */}
          {[
            { label:"PRATO RECOMENDADO", key:"prato", placeholder:"Bacalhau à brás" },
            { label:"NOTA PESSOAL", key:"nota", placeholder:"O que torna este sítio especial..." },
          ].map(f => (
            <div key={f.key} style={{ marginBottom:"12px" }}>
              <p style={{ color:"var(--text-3)", fontSize:"10px", letterSpacing:"0.06em", marginBottom:"6px" }}>{f.label}</p>
              <input type="text" value={(form as any)[f.key]} onChange={e => setForm(prev => ({...prev, [f.key]: e.target.value}))}
                placeholder={f.placeholder} style={{
                  width:"100%", padding:"10px", background:"var(--bg)", border:"1px solid var(--border)",
                  borderRadius:"8px", color:"var(--text)", fontSize:"14px", fontFamily:"'Inter', sans-serif", outline:"none", boxSizing:"border-box",
                }}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = "var(--accent)"}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = "var(--border)"}
              />
            </div>
          ))}

          <button onClick={submit} disabled={!form.nome.trim() || !form.cidade.trim()} style={{
            width:"100%", padding:"14px",
            background: form.nome.trim() && form.cidade.trim() ? "var(--accent)" : "var(--border)",
            color: form.nome.trim() && form.cidade.trim() ? "#000" : "var(--text-3)",
            border:"none", borderRadius:"10px",
            fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:"16px", letterSpacing:"0.06em",
            cursor: form.nome.trim() && form.cidade.trim() ? "pointer" : "not-allowed",
          }}>
            PARTILHAR RECOMENDAÇÃO
          </button>
        </div>
      )}

      {/* Cards */}
      <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
        {tascos.map(t => (
          <div key={t.id} className="animate-fade-up" style={{
            background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"16px", padding:"18px",
          }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:"14px" }}>
              <div style={{
                width:"48px", height:"48px", borderRadius:"12px", background:"var(--bg)",
                border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"24px", flexShrink:0,
              }}>{t.emoji}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"2px" }}>
                  <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:"18px", color:"var(--text)", lineHeight:1 }}>{t.nome}</span>
                  <span style={{ fontSize:"10px", color:"var(--text-3)", marginLeft:"8px", flexShrink:0 }}>{timeAgo(t.createdAt)}</span>
                </div>
                <div style={{ display:"flex", gap:"6px", alignItems:"center", marginBottom:"8px", flexWrap:"wrap" }}>
                  <span style={{ fontSize:"12px", color:"var(--text-3)" }}>📍 {t.cidade}</span>
                  <span style={{ padding:"2px 8px", borderRadius:"10px", background:"var(--accent-glow)", color:"var(--accent)", fontSize:"11px", fontWeight:600 }}>{t.tipo}</span>
                </div>
                {t.prato && (
                  <div style={{ marginBottom:"6px" }}>
                    <span style={{ fontSize:"12px", color:"var(--text-3)" }}>Pede o: </span>
                    <span style={{ fontSize:"13px", color:"var(--text)", fontWeight:600 }}>{t.prato}</span>
                  </div>
                )}
                {t.nota && (
                  <p style={{ color:"var(--text-2)", fontSize:"13px", lineHeight:1.5, margin:0, fontStyle:"italic" }}>"{t.nota}"</p>
                )}
                <div style={{ marginTop:"10px", display:"flex", alignItems:"center", gap:"8px" }}>
                  <div style={{
                    width:"24px", height:"24px", background:"var(--surface2)", borderRadius:"50%",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:700, color:"var(--text-3)",
                  }}>{t.userName[0]}</div>
                  <span style={{ fontSize:"12px", color:"var(--text-3)" }}>{t.userName}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  vitoria: "var(--success)",
  regressei: "var(--accent)",
  duvida: "#4CC9F0",
  geral: "var(--text-3)",
};

const SEED_POSTS = [
  {
    id: "seed-1",
    userName: "Miguel R.",
    content: "Semana 3. Hoje subi as escadas sem ofegar pela primeira vez em 2 anos. Pequeno para o mundo. Enorme para mim.",
    category: "vitoria",
    likesCount: 24,
    isLikedByMe: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "seed-2",
    userName: "André M.",
    content: "Voltei depois de 5 dias. Sem culpa. Só fiz os 7 minutos e pronto. É mais do que zero.",
    category: "regressei",
    likesCount: 18,
    isLikedByMe: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "seed-3",
    userName: "Ricardo F.",
    content: "45 anos, sedentário há 6. Achei que ia partir-me todo no primeiro treino. Não parti. Está a correr.",
    category: "geral",
    likesCount: 31,
    isLikedByMe: false,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "seed-4",
    userName: "Luís C.",
    content: "Alguém com problemas na anca? O agachamento dói um bocado. É normal na fase de fundação?",
    category: "duvida",
    likesCount: 7,
    isLikedByMe: false,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (h < 1) return "Agora";
  if (h < 24) return `Há ${h}h`;
  if (d === 1) return "Ontem";
  return `Há ${d} dias`;
}

export default function ComunidadePage() {
  const { data: sessionData } = authClient.useSession();
  const qc = useQueryClient();
  const [tab, setTab] = useState<ComunidadeTab>("feed");
  const [newPost, setNewPost] = useState("");
  const [category, setCategory] = useState("geral");
  const [posting, setPosting] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const userName = (sessionData as any)?.user?.name || "Utilizador";

  const { data: postsData, isLoading } = useQuery({
    queryKey: ["community-posts"],
    queryFn: async () => (await api.community.posts.$get()).json(),
  });

  const createPost = useMutation({
    mutationFn: async (data: any) => (await api.community.posts.$post({ json: data })).json(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["community-posts"] });
      setNewPost("");
      setShowCompose(false);
    },
  });

  const likePost = useMutation({
    mutationFn: async (postId: string) => {
      const res = await (api.community.posts as any)[":id"].like.$post({ param: { id: postId } });
      return res.json();
    },
    onMutate: async (postId) => {
      await qc.cancelQueries({ queryKey: ["community-posts"] });
      const prev = qc.getQueryData(["community-posts"]);
      qc.setQueryData(["community-posts"], (old: any) => ({
        ...old,
        posts: old?.posts?.map((p: any) =>
          p.id === postId
            ? { ...p, isLikedByMe: !p.isLikedByMe, likesCount: p.isLikedByMe ? p.likesCount - 1 : p.likesCount + 1 }
            : p
        ),
      }));
      return { prev };
    },
    onError: (_err, _id, ctx) => qc.setQueryData(["community-posts"], ctx?.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ["community-posts"] }),
  });

  const apiPosts = (postsData as any)?.posts || [];
  const allPosts = [...apiPosts, ...SEED_POSTS.filter(s => !apiPosts.find((p: any) => p.id === s.id))];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: "100px" }}>
      {/* Header */}
      <div style={{ padding: "48px 24px 20px" }}>
        <h1 className="display animate-fade-up" style={{ fontSize: "clamp(40px, 8vw, 56px)", color: "var(--text)", lineHeight: 1, marginBottom: "8px" }}>
          COMUNIDADE
        </h1>
        <p className="animate-fade-up delay-1" style={{ color: "var(--text-2)", fontSize: "14px", marginBottom: "16px" }}>
          Homens como tu, na mesma fase. Sem rankings. Sem julgamentos.
        </p>

        {/* Tabs */}
        <div style={{ display:"flex", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"12px", padding:"4px", gap:"4px", marginBottom:"16px" }}>
          {([{key:"feed",label:"Feed"},{key:"tascos",label:"🍽️ Tascos"}] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex:1, padding:"10px",
              background: tab === t.key ? "var(--accent)" : "transparent",
              border:"none", borderRadius:"8px",
              color: tab === t.key ? "#000" : "var(--text-2)",
              fontFamily:"'Barlow Condensed', sans-serif",
              fontWeight:800, fontSize:"14px", letterSpacing:"0.06em",
              cursor:"pointer", transition:"all 0.2s",
            }}>
              {t.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Tascos tab */}
      {tab === "tascos" && (
        <div style={{ padding:"0 24px" }}>
          <TascosTab userName={userName} />
        </div>
      )}

      {/* Feed tab */}
      {tab === "feed" && <>
      <div style={{ padding:"0 24px 0" }}>
        {/* Compose button */}
        <button
          onClick={() => setShowCompose(s => !s)}
          className="animate-fade-up delay-2"
          style={{
            width: "100%",
            padding: "16px",
            background: showCompose ? "var(--surface)" : "var(--accent-glow)",
            border: `1px solid ${showCompose ? "var(--border)" : "var(--accent)"}`,
            borderRadius: "12px",
            color: showCompose ? "var(--text-2)" : "var(--accent)",
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700,
            fontSize: "16px",
            cursor: "pointer",
            transition: "all 0.2s",
            textAlign: "left",
          }}
        >
          {showCompose ? "Cancelar" : "Partilhar algo..."}
        </button>
      </div>

      {/* Compose form */}
      {showCompose && (
        <div className="animate-fade-up" style={{
          margin: "0 24px 20px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "20px",
        }}>
          {/* Category */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className="label"
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  border: `1px solid ${category === c.value ? (CATEGORY_COLORS[c.value] || "var(--accent)") : "var(--border)"}`,
                  background: category === c.value ? `${CATEGORY_COLORS[c.value] || "var(--accent)"}20` : "transparent",
                  color: category === c.value ? (CATEGORY_COLORS[c.value] || "var(--accent)") : "var(--text-3)",
                  cursor: "pointer",
                  fontSize: "11px",
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
          <textarea
            value={newPost}
            onChange={e => setNewPost(e.target.value)}
            placeholder="O que queres partilhar?"
            rows={3}
            style={{
              width: "100%",
              padding: "14px",
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              color: "var(--text)",
              fontSize: "15px",
              fontFamily: "'Inter', sans-serif",
              resize: "none",
              outline: "none",
              marginBottom: "12px",
            }}
            onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = "var(--accent)"}
            onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = "var(--border)"}
          />
          <button
            onClick={() => createPost.mutate({ content: newPost, category })}
            disabled={!newPost.trim() || createPost.isPending}
            style={{
              width: "100%",
              padding: "14px",
              background: newPost.trim() ? "var(--accent)" : "var(--border)",
              color: newPost.trim() ? "#000" : "var(--text-3)",
              border: "none",
              borderRadius: "10px",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: "17px",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              cursor: newPost.trim() ? "pointer" : "not-allowed",
            }}
          >
            {createPost.isPending ? "A publicar..." : "Publicar"}
          </button>
        </div>
      )}

      {/* Posts */}
      <div style={{ padding: "0 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: "120px" }} />)
        ) : (
          allPosts.map((post: any) => (
            <div
              key={post.id}
              className="animate-fade-up"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "20px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "32px",
                      height: "32px",
                      background: "var(--surface2)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700,
                      color: "var(--text-2)",
                    }}>
                      {post.userName?.[0] || "?"}
                    </div>
                    <span style={{ color: "var(--text)", fontSize: "14px", fontWeight: 500 }}>{post.userName}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="label" style={{
                    color: CATEGORY_COLORS[post.category] || "var(--text-3)",
                    fontSize: "10px",
                    background: `${CATEGORY_COLORS[post.category] || "var(--text-3)"}15`,
                    padding: "3px 8px",
                    borderRadius: "10px",
                  }}>
                    {CATEGORIES.find(c => c.value === post.category)?.label || post.category}
                  </span>
                  <span style={{ color: "var(--text-3)", fontSize: "12px" }}>
                    {timeAgo(post.createdAt)}
                  </span>
                </div>
              </div>

              <p style={{ color: "var(--text)", fontSize: "15px", lineHeight: 1.6, marginBottom: "16px" }}>
                {post.content}
              </p>

              <button
                onClick={() => !post.id.startsWith("seed") && likePost.mutate(post.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "transparent",
                  border: "none",
                  cursor: post.id.startsWith("seed") ? "default" : "pointer",
                  padding: "0",
                }}
              >
                <span style={{
                  fontSize: "16px",
                  filter: post.isLikedByMe ? "none" : "grayscale(100%) opacity(0.4)",
                  transition: "all 0.2s",
                }}>
                  ♥
                </span>
                <span style={{
                  color: post.isLikedByMe ? "var(--accent)" : "var(--text-3)",
                  fontSize: "13px",
                  fontFamily: "'Inter', sans-serif",
                  transition: "color 0.2s",
                }}>
                  {post.likesCount}
                </span>
              </button>
            </div>
          ))
        )}
      </div>
      </> /* end feed tab */}

      <BottomNav />
    </div>
  );
}
