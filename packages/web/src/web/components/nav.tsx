import { useLocation, Link } from "wouter";

const NAV_ITEMS = [
  { path: "/", label: "Hoje", icon: "☀" },
  { path: "/treino", label: "Treino", icon: "⚡" },
  { path: "/nutricao", label: "Nutrição", icon: "◑" },
  { path: "/informacao", label: "Info", icon: "📖" },
  { path: "/eu", label: "Eu", icon: "◈" },
];

export function BottomNav() {
  const [location] = useLocation();

  return (
    <nav style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: "var(--surface)",
      borderTop: "1px solid var(--border)",
      display: "flex",
      padding: "6px 0 18px",
      zIndex: 100,
    }}>
      {NAV_ITEMS.map(item => {
        const isActive = location === item.path;
        return (
          <Link key={item.path} to={item.path} style={{ flex: 1, textDecoration: "none" }}>
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
              padding: "6px 0",
              cursor: "pointer",
            }}>
              <span style={{
                fontSize: "18px",
                filter: isActive ? "none" : "grayscale(100%) opacity(0.4)",
                transition: "all 0.2s",
                color: isActive ? "var(--accent)" : "var(--text-2)",
              }}>
                {item.icon}
              </span>
              <span className="label" style={{
                fontSize: "8px",
                color: isActive ? "var(--accent)" : "var(--text-3)",
                transition: "color 0.2s",
                letterSpacing: "0.04em",
              }}>
                {item.label}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
