import { Leaf, Menu, X } from "lucide-react";
import { useState } from "react";

type Tab = "home" | "about" | "marketplace" | "dashboard" | "auth";

interface Props {
  tab: Tab;
  token: string | null;
  onNavigate: (t: Tab) => void;
}

const NAV_LINKS: { key: Tab; label: string }[] = [
  { key: "home",        label: "Home" },
  { key: "about",       label: "About" },
  { key: "marketplace", label: "Marketplace" },
];

export function ShambaHeader({ tab, token, onNavigate }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid var(--clr-border)",
        background: "rgba(10,18,9,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBlock: "0.875rem" }}>
        {/* Logo */}
        <button
          onClick={() => onNavigate("home")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "1.2rem",
            color: "var(--clr-text)",
            letterSpacing: "-0.02em",
          }}
        >
          <span style={{
            background: "linear-gradient(135deg,var(--clr-primary),var(--clr-accent))",
            borderRadius: "8px",
            padding: "4px 6px",
            display: "flex",
            alignItems: "center",
          }}>
            <Leaf size={16} color="#fff" />
          </span>
          Shamba<span style={{ color: "var(--clr-primary-light)" }}>Point</span>
        </button>

        {/* Desktop nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem" }} className="hidden md:flex">
          {NAV_LINKS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`nav-link ${tab === key ? "active" : ""}`}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          {token ? (
            <button
              className="btn btn-primary btn-sm hidden md:inline-flex"
              onClick={() => onNavigate("dashboard")}
            >
              Dashboard →
            </button>
          ) : (
            <button
              className="btn btn-primary btn-sm hidden md:inline-flex"
              onClick={() => onNavigate("auth")}
            >
              Sign In
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--clr-text)" }}
            className="md:hidden"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          borderTop: "1px solid var(--clr-border)",
          padding: "1rem 1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          background: "rgba(10,18,9,0.95)",
        }}>
          {NAV_LINKS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { onNavigate(key); setMenuOpen(false); }}
              style={{
                background: tab === key ? "rgba(22,163,74,0.12)" : "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                padding: "0.625rem 0.875rem",
                borderRadius: "var(--radius-md)",
                color: tab === key ? "var(--clr-primary)" : "var(--clr-text-2)",
                fontWeight: tab === key ? 600 : 400,
                fontFamily: "var(--font-body)",
                fontSize: "0.9rem",
              }}
            >
              {label}
            </button>
          ))}
          <button
            className="btn btn-primary"
            onClick={() => { onNavigate(token ? "dashboard" : "auth"); setMenuOpen(false); }}
            style={{ marginTop: "0.5rem" }}
          >
            {token ? "Go to Dashboard" : "Sign In"}
          </button>
        </div>
      )}
    </header>
  );
}
