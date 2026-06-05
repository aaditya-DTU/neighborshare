import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AppProvider, useApp } from "./lib/AppContext";
import { Navbar } from "./components/Navbar";
import { LoginPage } from "./pages/LoginPage";
import { BrowsePage } from "./pages/BrowsePage";
import { ItemDetailPage } from "./pages/ItemDetailPage";
import { MyItemsPage } from "./pages/MyItemsPage";
import { RequestsPage } from "./pages/RequestsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { LandingPage } from "./pages/LandingPage";

function Protected({ children }) {
  const { currentUser, loading } = useApp();
  const location = useLocation();

  // Still checking saved token — don't flash login page
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-400 text-sm">Loading…</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function Shell() {
  const { currentUser } = useApp();
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {currentUser && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              currentUser ? <Navigate to="/browse" replace /> : <LandingPage />
            }
          />
          <Route
            path="/browse"
            element={
              <Protected>
                <BrowsePage />
              </Protected>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/item/:id"
            element={
              <Protected>
                <ItemDetailPage />
              </Protected>
            }
          />
          <Route
            path="/my-items"
            element={
              <Protected>
                <MyItemsPage />
              </Protected>
            }
          />
          <Route
            path="/requests"
            element={
              <Protected>
                <RequestsPage />
              </Protected>
            }
          />
          <Route
            path="/profile"
            element={
              <Protected>
                <ProfilePage />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {currentUser && (
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
          NeighborShare — Community Resource Sharing Platform
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </AppProvider>
  );
}
