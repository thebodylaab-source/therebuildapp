import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "../components/nav";
import { api } from "../lib/api";

type Document = {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string;
  phase: string | null;
  createdAt: string;
};

type Video = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  phase: string | null;
  category: string;
  createdAt: string;
};

const KNOWLEDGE_CATEGORIES = [
  { key: "todos",     label: "Tudo",      icon: "◈", color: "#B8975A" },
  { key: "sono",      label: "Sono",      icon: "◐", color: "#4A7A9B" },
  { key: "hormonas",  label: "Hormonas",  icon: "⬡", color: "#6B7A5A" },
  { key: "pesquisa",  label: "Pesquisa",  icon: "◎", color: "#7A5A8A" },
  { key: "filhos",    label: "Família",   icon: "△", color: "#8A6A4A" },
  { key: "nutricao",  label: "Nutrição",  icon: "◑", color: "#4A8A6A" },
  { key: "treino",    label: "Treino",    icon: "⚡", color: "#9A6A4A" },
  { key: "mindset",   label: "Mindset",   icon: "◆", color: "#5A6A8A" },
  { key: "outro",     label: "Outro",     icon: "·", color: "#8A8A7A" },
];

function getYoutubeEmbed(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      return v ? `https://www.youtube.com/embed/${v}` : null;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    return null;
  } catch {
    return null;
  }
}

function matchesCategory(item: Document | Video, cat: string): boolean {
  if (cat === "todos") return true;
  const searchIn = [
    ("category" in item ? item.category : ""),
    item.title,
    item.description || "",
    item.phase || "",
  ].join(" ").toLowerCase();
  const aliases: Record<string, string[]> = {
    sono:     ["sono", "sleep", "descanso", "recuperação"],
    hormonas: ["hormon", "testosterona", "cortisol", "endocrino"],
    pesquisa: ["pesquisa", "estudo", "ciência", "research", "evidência"],
    filhos:   ["filho", "familia", "pai", "criança", "equilíbrio"],
    nutricao: ["nutric", "alimenta", "proteína", "caloria", "dieta"],
    treino:   ["treino", "exercício", "musculo", "força", "técnica", "mobilidade"],
    mindset:  ["mindset", "mental", "motivação", "psicolog", "foco", "disciplina"],
    outro:    ["outro", "geral"],
  };
  return (aliases[cat] || [cat]).some(kw => searchIn.includes(kw));
}

export default function InformacaoPage() {
  const [activeCategory, setActiveCategory] = useState("todos");
  const [mediaType, setMediaType] = useState<"ambos" | "documentos" | "videos">("ambos");
  const [search, setSearch] = useState("");

  const { data: docs, isLoading: docsLoading } = useQuery({
    queryKey: ["admin-documents"],
    queryFn: async () => {
      const res = await (api as any).admin.documents.$get();
      const data = await res.json();
      return data.documents as Document[];
    },
  });

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ["admin-videos"],
    queryFn: async () => {
      const res = await (api as any).admin.videos.$get();
      const data = await res.json();
      return data.videos as Video[];
    },
  });

  const isLoading = docsLoading || videosLoading;

  const searchFilter = (item: Document | Video) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.description || "").toLowerCase().includes(q)
    );
  };

  const filteredDocs = (docs || [])
    .filter(d => matchesCategory(d, activeCategory))
    .filter(searchFilter);

  const filteredVideos = (videos || [])
    .filter(v => matchesCategory(v, activeCategory))
    .filter(searchFilter);

  const showDocs = mediaType !== "videos";
  const showVideos = mediaType !== "documentos";

  const totalItems =
    (showDocs ? filteredDocs.length : 0) +
    (showVideos ? filteredVideos.length : 0);

  const activeCat = KNOWLEDGE_CATEGORIES.find(c => c.key === activeCategory)!;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: "90px" }}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div style={{
        padding: "56px 20px 0",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "4px" }}>
          <div>
            <p className="label" style={{ color: "var(--text-3)", marginBottom: "4px" }}>Base de conhecimento</p>
            <h1 className="display" style={{ fontSize: "32px", color: "var(--text)", lineHeight: 1 }}>
              APRENDER
            </h1>
          </div>
          <div style={{
            background: "var(--accent-glow)",
            border: "1px solid var(--accent)",
            borderRadius: "8px",
            padding: "6px 12px",
            textAlign: "center",
          }}>
            <div className="display" style={{ fontSize: "22px", color: "var(--accent)", lineHeight: 1 }}>
              {(docs?.length || 0) + (videos?.length || 0)}
            </div>
            <div className="label" style={{ fontSize: "9px", color: "var(--text-3)" }}>recursos</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", margin: "16px 0 12px" }}>
          <span style={{
            position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
            color: "var(--text-3)", fontSize: "14px", pointerEvents: "none",
          }}>◎</span>
          <input
            type="text"
            placeholder="Pesquisar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 34px",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              color: "var(--text)",
              fontSize: "14px",
              fontFamily: "'Inter', sans-serif",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Media type toggle */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
          {([
            { key: "ambos", label: "Tudo" },
            { key: "documentos", label: "📄 Documentos" },
            { key: "videos", label: "▶ Vídeos" },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setMediaType(t.key)}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                border: `1px solid ${mediaType === t.key ? "var(--accent)" : "var(--border)"}`,
                background: mediaType === t.key ? "var(--accent-glow)" : "transparent",
                color: mediaType === t.key ? "var(--accent)" : "var(--text-3)",
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: "12px",
                letterSpacing: "0.06em",
                cursor: "pointer",
                textTransform: "uppercase",
                transition: "all 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CATEGORIAS ─────────────────────────────────────────────────── */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "10px",
        }}>
          {KNOWLEDGE_CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "8px",
                  padding: "14px",
                  borderRadius: "14px",
                  border: `1.5px solid ${isActive ? cat.color : "var(--border)"}`,
                  background: isActive ? `${cat.color}14` : "var(--surface)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  textAlign: "left",
                }}
              >
                <span style={{
                  fontSize: "22px",
                  lineHeight: 1,
                  filter: isActive ? "none" : "grayscale(60%) opacity(0.6)",
                  transition: "filter 0.15s",
                }}>{cat.icon}</span>
                <div>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 800,
                    fontSize: "13px",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: isActive ? cat.color : "var(--text-2)",
                    lineHeight: 1,
                  }}>{cat.label}</div>
                  {isActive && (
                    <div style={{
                      marginTop: "3px",
                      width: "20px",
                      height: "2px",
                      borderRadius: "2px",
                      background: cat.color,
                    }} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CONTEÚDO ───────────────────────────────────────────────────── */}
      <div style={{ padding: "20px" }}>

        {/* Stats bar */}
        {!isLoading && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "16px", color: activeCat.color }}>{activeCat.icon}</span>
              <span className="label" style={{ color: "var(--text-2)", fontSize: "11px" }}>
                {activeCat.label}
              </span>
            </div>
            <span className="label" style={{ color: "var(--text-3)", fontSize: "10px" }}>
              {totalItems} {totalItems === 1 ? "resultado" : "resultados"}
            </span>
          </div>
        )}

        {isLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ height: "72px", borderRadius: "12px" }} />
            ))}
          </div>
        )}

        {!isLoading && totalItems === 0 && (
          <div style={{ textAlign: "center", marginTop: "60px" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px", opacity: 0.4 }}>{activeCat.icon}</div>
            <p className="label" style={{ color: "var(--text-3)", fontSize: "12px" }}>
              Nenhum conteúdo nesta categoria
            </p>
          </div>
        )}

        {/* ── DOCUMENTOS ── */}
        {showDocs && filteredDocs.length > 0 && (
          <div style={{ marginBottom: "28px" }}>
            {showVideos && filteredVideos.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span className="label" style={{ color: "var(--text-3)", fontSize: "10px" }}>DOCUMENTOS</span>
                <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                <span className="label" style={{ color: "var(--text-3)", fontSize: "10px" }}>{filteredDocs.length}</span>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {filteredDocs.map(doc => (
                <a
                  key={doc.id}
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px 16px",
                    background: "var(--surface)",
                    borderRadius: "12px",
                    border: "1px solid var(--border)",
                    textDecoration: "none",
                    transition: "border-color 0.15s, transform 0.15s",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "var(--accent-glow)",
                    border: "1px solid var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "17px",
                    flexShrink: 0,
                  }}>
                    📄
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700,
                      color: "var(--text)",
                      fontSize: "15px",
                      lineHeight: 1.2,
                    }}>
                      {doc.title}
                    </div>
                    {doc.description && (
                      <div style={{
                        color: "var(--text-3)",
                        fontSize: "12px",
                        marginTop: "2px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {doc.description}
                      </div>
                    )}
                    {doc.phase && doc.phase !== "todas" && (
                      <span style={{
                        display: "inline-block",
                        marginTop: "4px",
                        padding: "2px 7px",
                        borderRadius: "8px",
                        background: "var(--surface2)",
                        color: "var(--accent)",
                        fontSize: "10px",
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}>
                        {doc.phase}
                      </span>
                    )}
                  </div>
                  <span style={{ color: "var(--accent)", fontSize: "16px", flexShrink: 0 }}>↗</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── VÍDEOS ── */}
        {showVideos && filteredVideos.length > 0 && (
          <div>
            {showDocs && filteredDocs.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span className="label" style={{ color: "var(--text-3)", fontSize: "10px" }}>VÍDEOS</span>
                <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
                <span className="label" style={{ color: "var(--text-3)", fontSize: "10px" }}>{filteredVideos.length}</span>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {filteredVideos.map(video => {
                const embedUrl = getYoutubeEmbed(video.videoUrl);
                return (
                  <div
                    key={video.id}
                    style={{
                      background: "var(--surface)",
                      borderRadius: "14px",
                      border: "1px solid var(--border)",
                      overflow: "hidden",
                    }}
                  >
                    {embedUrl ? (
                      <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                        <iframe
                          src={embedUrl}
                          title={video.title}
                          style={{
                            position: "absolute",
                            top: 0, left: 0,
                            width: "100%", height: "100%",
                            border: "none",
                          }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <a
                        href={video.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "140px",
                          background: "var(--surface2)",
                          color: "var(--accent)",
                          fontSize: "36px",
                          textDecoration: "none",
                        }}
                      >
                        ▶
                      </a>
                    )}
                    <div style={{ padding: "14px 16px" }}>
                      <div style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontWeight: 700,
                        color: "var(--text)",
                        fontSize: "16px",
                        lineHeight: 1.2,
                      }}>
                        {video.title}
                      </div>
                      {video.description && (
                        <div style={{ color: "var(--text-3)", fontSize: "12px", marginTop: "4px", lineHeight: 1.5 }}>
                          {video.description}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
                        {video.phase && video.phase !== "todas" && (
                          <span style={{
                            padding: "2px 8px",
                            borderRadius: "8px",
                            background: "var(--surface2)",
                            color: "var(--text-3)",
                            fontSize: "10px",
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                          }}>
                            {video.phase}
                          </span>
                        )}
                        {video.category && video.category !== "geral" && (
                          <span style={{
                            padding: "2px 8px",
                            borderRadius: "8px",
                            background: "var(--accent-glow)",
                            color: "var(--accent)",
                            fontSize: "10px",
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                          }}>
                            {video.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
