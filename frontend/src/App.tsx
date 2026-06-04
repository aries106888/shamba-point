import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LandingPage } from "@/components/landing-page";
import { AboutPage } from "@/components/about-page";
import { MarketplacePage } from "@/components/marketplace-page";
import { AuthPage } from "@/components/auth-page";
import { ShambaDashboard } from "@/components/shambapoint-dashboard";
import { ShambaHeader } from "@/components/ShambaHeader";
import { ShambaFooter } from "@/components/ShambaFooter";

type Tab = "home" | "about" | "marketplace" | "dashboard" | "auth";

function tabFromHash(hash: string): Tab {
  if (hash.startsWith("#/about"))       return "about";
  if (hash.startsWith("#/marketplace")) return "marketplace";
  if (hash.startsWith("#/dashboard"))   return "dashboard";
  if (hash.startsWith("#/auth"))        return "auth";
  return "home";
}

export function App() {
  const { token, user, login, register, logout } = useAuth();

  const [tab, setTab] = useState<Tab>(() => {
    const t = tabFromHash(window.location.hash);
    if (t === "dashboard" && !localStorage.getItem("shamba_token")) return "auth";
    if (t === "auth"      &&  localStorage.getItem("shamba_token")) return "dashboard";
    return t;
  });

  // Sync hash ↔ tab
  useEffect(() => {
    const onHash = () => {
      const t = tabFromHash(window.location.hash);
      if (t === "dashboard" && !localStorage.getItem("shamba_token")) {
        window.location.hash = "#/auth";
        setTab("auth");
      } else {
        setTab(t);
      }
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (tabFromHash(window.location.hash) !== tab) {
      window.location.hash = `#/${tab}`;
    }
  }, [tab]);

  // Dark mode via data-theme attribute
  useEffect(() => {
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, []);

  const go = (t: Tab) => {
    if (t === "dashboard" && !token) {
      setTab("auth");
      window.location.hash = "#/auth";
    } else {
      setTab(t);
    }
  };

  const handleAuthSuccess = async (phone: string, password: string, isLogin: boolean, payload?: Parameters<typeof register>[0]) => {
    try {
      if (isLogin) {
        await login(phone, password);
      } else if (payload) {
        await register(payload);
      }
      go("dashboard");
    } catch (e: unknown) {
      throw e;
    }
  };

  const handleLogout = () => {
    logout();
    go("home");
  };

  // Full-screen dashboard (no shared header/footer)
  if (tab === "dashboard" && token && user) {
    return (
      <ShambaDashboard
        user={user}
        token={token}
        onLogout={handleLogout}
        onBack={() => go("home")}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-dvh" style={{ background: "var(--clr-surface)", color: "var(--clr-text)" }}>
      <ShambaHeader tab={tab} token={token} onNavigate={go} />

      <main className="flex-1">
        {tab === "home"        && <LandingPage onNavigate={(t) => go(t as Tab)} />}
        {tab === "about"       && <AboutPage />}
        {tab === "marketplace" && <MarketplacePage token={token} user={user} />}
        {tab === "auth"        && (
          <AuthPage
            onAuthSuccess={handleAuthSuccess}
            onBack={() => go("home")}
          />
        )}
      </main>

      <ShambaFooter onNavigate={go} />
    </div>
  );
}

export default App;
