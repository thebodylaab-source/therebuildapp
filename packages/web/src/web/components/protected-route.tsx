import { Redirect } from "wouter";
import { authClient } from "../lib/auth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "var(--bg)" }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 rounded-full mx-auto mb-4 animate-spin" 
               style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
          <p className="label" style={{ color: "var(--text-3)" }}>A carregar...</p>
        </div>
      </div>
    );
  }
  if (!session) return <Redirect to="/auth" />;
  return <>{children}</>;
}
