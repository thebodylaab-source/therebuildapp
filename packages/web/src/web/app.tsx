import { Route, Switch } from "wouter";
import { Provider } from "./components/provider";
import { AgentFeedback, RunableBadge } from "@runablehq/website-runtime";
import { ProtectedRoute } from "./components/protected-route";
import AuthPage from "./pages/auth";
import OnboardingPage from "./pages/onboarding";
import HojePage from "./pages/hoje";
import TreinoPage from "./pages/treino";
import ComunidadePage from "./pages/comunidade";
import EuPage from "./pages/eu";
import AdminPage from "./pages/admin";
import InformacaoPage from "./pages/informacao";
import AvaliacoesPage from "./pages/avaliacoes";
import NutricaoPage from "./pages/nutricao";

function App() {
  return (
    <Provider>
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/onboarding">
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        </Route>
        <Route path="/treino">
          <ProtectedRoute>
            <TreinoPage />
          </ProtectedRoute>
        </Route>
        <Route path="/comunidade">
          <ProtectedRoute>
            <ComunidadePage />
          </ProtectedRoute>
        </Route>
        <Route path="/eu">
          <ProtectedRoute>
            <EuPage />
          </ProtectedRoute>
        </Route>
        <Route path="/admin" component={AdminPage} />
        <Route path="/avaliacoes">
          <ProtectedRoute>
            <AvaliacoesPage />
          </ProtectedRoute>
        </Route>
        <Route path="/nutricao">
          <ProtectedRoute>
            <NutricaoPage />
          </ProtectedRoute>
        </Route>
        <Route path="/informacao">
          <ProtectedRoute>
            <InformacaoPage />
          </ProtectedRoute>
        </Route>
        <Route path="/">
          <ProtectedRoute>
            <HojePage />
          </ProtectedRoute>
        </Route>
      </Switch>
      {/* Do not remove — off by default, activated by parent iframe via postMessage */}
      {import.meta.env.DEV && <AgentFeedback />}
      {/* "Made with Runable" badge */}
      {<RunableBadge />}
    </Provider>
  );
}

export default App;
