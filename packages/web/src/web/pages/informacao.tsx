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

const PHASES = [
  { value: "all", label: "Todas as fases" },
  { value: "fundacao", label: "Fundação" },
  { value: "construcao", label: "Construção" },
  { value: "intensidade", label: "Intensidade" },
  { value: "manutencao", label: "Manutenção" },
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

export default function InformacaoPage() {
  const [tab, setTab] = useState<"documentos" | "videos">("documentos");
  const [phase, setPhase] = useState("all");

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

  const filteredDocs = (docs || []).filter(d =>
    phase === "all" ? true : d.phase === phase || !d.phase
  );

  const filteredVideos = (videos || []).filter(v =>
    phase === "all" ? true : v.phase === phase || !v.phase
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: "80px" }}>
      {/* Header */}
      <div style={{
        padding: "60px 20px 20px",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-1)", margin: 0 }}>
          Informação
        </h1>
        <p style={{ color: "var(--text-3)", fontSize: "13px", margin: "4px 0 0" }}>
          Documentos e vídeos do programa
        </p>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginTop: "16px" }}>
          {(["documentos", "videos"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: "none",
                background: tab === t ? "var(--accent)" : "var(--border)",
                color: tab === t ? "var(--bg)" : "var(--text-2)",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {t === "documentos" ? "📄 Documentos" : "▶ Vídeos"}
            </button>
          ))}
        </div>

        {/* Phase filter */}
        <select
          value={phase}
          onChange={e => setPhase(e.target.value)}
          style={{
            marginTop: "12px",
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text-1)",
            fontSize: "13px",
            width: "100%",
          }}
        >
          {PHASES.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      <div style={{ padding: "20px" }}>
        {/* DOCUMENTOS */}
        {tab === "documentos" && (
          <>
            {docsLoading ? (
              <p style={{ color: "var(--text-3)", textAlign: "center", marginTop: "40px" }}>A carregar...</p>
            ) : filteredDocs.length === 0 ? (
              <div style={{ textAlign: "center", marginTop: "60px" }}>
                <div style={{ fontSize: "40px" }}>📂</div>
                <p style={{ color: "var(--text-3)", marginTop: "8px" }}>Nenhum documento disponível</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
                      padding: "16px",
                      background: "var(--surface)",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      textDecoration: "none",
                      transition: "border-color 0.2s",
                    }}
                  >
                    <div style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      background: "var(--accent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      flexShrink: 0,
                    }}>
                      📄
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: "var(--text-1)", fontSize: "14px" }}>
                        {doc.title}
                      </div>
                      {doc.description && (
                        <div style={{ color: "var(--text-3)", fontSize: "12px", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {doc.description}
                        </div>
                      )}
                      {doc.phase && (
                        <span style={{
                          display: "inline-block",
                          marginTop: "4px",
                          padding: "2px 8px",
                          borderRadius: "10px",
                          background: "rgba(180,130,70,0.15)",
                          color: "var(--accent)",
                          fontSize: "11px",
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}>
                          {doc.phase}
                        </span>
                      )}
                    </div>
                    <span style={{ color: "var(--accent)", fontSize: "18px" }}>↗</span>
                  </a>
                ))}
              </div>
            )}
          </>
        )}

        {/* VÍDEOS */}
        {tab === "videos" && (
          <>
            {videosLoading ? (
              <p style={{ color: "var(--text-3)", textAlign: "center", marginTop: "40px" }}>A carregar...</p>
            ) : filteredVideos.length === 0 ? (
              <div style={{ textAlign: "center", marginTop: "60px" }}>
                <div style={{ fontSize: "40px" }}>🎬</div>
                <p style={{ color: "var(--text-3)", marginTop: "8px" }}>Nenhum vídeo disponível</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {filteredVideos.map(video => {
                  const embedUrl = getYoutubeEmbed(video.videoUrl);
                  return (
                    <div
                      key={video.id}
                      style={{
                        background: "var(--surface)",
                        borderRadius: "12px",
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
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
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
                            height: "160px",
                            background: "var(--surface2)",
                            color: "var(--accent)",
                            fontSize: "40px",
                            textDecoration: "none",
                          }}
                        >
                          ▶
                        </a>
                      )}
                      <div style={{ padding: "14px" }}>
                        <div style={{ fontWeight: 600, color: "var(--text-1)", fontSize: "14px" }}>
                          {video.title}
                        </div>
                        {video.description && (
                          <div style={{ color: "var(--text-3)", fontSize: "12px", marginTop: "4px" }}>
                            {video.description}
                          </div>
                        )}
                        {video.phase && (
                          <span style={{
                            display: "inline-block",
                            marginTop: "6px",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            background: "rgba(180,130,70,0.15)",
                            color: "var(--accent)",
                            fontSize: "11px",
                            fontWeight: 600,
                            textTransform: "capitalize",
                          }}>
                            {video.phase}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
