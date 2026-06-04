import { useState } from "react";
import { Eye, EyeOff, Leaf, ArrowLeft, Loader } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type Mode = "login" | "register";

const COUNTIES = ["Nakuru","Meru","Murang'a","Kiambu","Uasin Gishu","Nairobi","Mombasa","Kisumu","Nyeri","Kakamega","Eldoret","Thika"];

interface Props {
  onAuthSuccess: (phone: string, password: string, isLogin: boolean, payload?: Parameters<ReturnType<typeof useAuth>["register"]>[0]) => Promise<void>;
  onBack: () => void;
}

export function AuthPage({ onAuthSuccess, onBack }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login fields
  const [phone,    setPhone]    = useState("");
  const [password, setPassword] = useState("");

  // Register extra fields
  const [name,     setName]     = useState("");
  const [role,     setRole]     = useState("farmer");
  const [county,   setCounty]   = useState("");
  const [location, setLocation] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "register") {
      if (!name.trim()) return setError("Full name is required.");
      if (password.length < 6) return setError("Password must be at least 6 characters.");
      if (password !== confirmPwd) return setError("Passwords do not match.");
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await onAuthSuccess(phone, password, true);
      } else {
        await onAuthSuccess(phone, password, false, { name, phone, password, role, county, location });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100dvh",
      background: "linear-gradient(135deg,#0a1209 0%,#0f2010 50%,#0a1209 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1.25rem",
    }}>
      {/* Back button */}
      <button
        onClick={onBack}
        className="btn btn-ghost btn-sm"
        style={{ position: "fixed", top: "1.25rem", left: "1.25rem", color: "rgba(255,255,255,0.5)", zIndex: 10 }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ width: "100%", maxWidth: "440px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 56, height: 56,
            background: "linear-gradient(135deg,var(--clr-primary),var(--clr-accent))",
            borderRadius: "16px",
            marginBottom: "1rem",
            boxShadow: "0 8px 32px rgba(22,163,74,0.35)",
          }}>
            <Leaf size={28} color="#fff" />
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.6rem", color: "#ecf5ec" }}>
            {mode === "login" ? "Welcome back" : "Join ShambaPoint"}
          </h1>
          <p style={{ color: "#6b876b", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            {mode === "login" ? "Sign in to your account" : "Create your free account today"}
          </p>
        </div>

        {/* Card */}
        <div className="glass" style={{ padding: "2rem" }}>
          {/* Mode tabs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1.75rem", background: "rgba(255,255,255,0.04)", borderRadius: "var(--radius-md)", padding: "4px" }}>
            {(["login", "register"] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                style={{
                  padding: "0.625rem",
                  borderRadius: "calc(var(--radius-md) - 2px)",
                  border: "none",
                  background: mode === m ? "var(--clr-primary)" : "transparent",
                  color: mode === m ? "#fff" : "#6b876b",
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textTransform: "capitalize",
                }}
              >
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Register-only fields */}
            {mode === "register" && (
              <>
                <div>
                  <label className="label" style={{ color: "rgba(255,255,255,0.5)" }}>Full Name *</label>
                  <input id="auth-name" className="input" type="text" placeholder="Kevin Muli" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="label" style={{ color: "rgba(255,255,255,0.5)" }}>I am a *</label>
                  <select id="auth-role" className="select" value={role} onChange={e => setRole(e.target.value)}>
                    <option value="farmer">🌾 Farmer</option>
                    <option value="buyer">🛒 Buyer</option>
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label className="label" style={{ color: "rgba(255,255,255,0.5)" }}>County</label>
                    <select id="auth-county" className="select" value={county} onChange={e => setCounty(e.target.value)}>
                      <option value="">Select...</option>
                      {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label" style={{ color: "rgba(255,255,255,0.5)" }}>Town/Village</label>
                    <input id="auth-location" className="input" type="text" placeholder="Nakuru Town" value={location} onChange={e => setLocation(e.target.value)} />
                  </div>
                </div>
              </>
            )}

            {/* Common fields */}
            <div>
              <label className="label" style={{ color: "rgba(255,255,255,0.5)" }}>Phone Number *</label>
              <input id="auth-phone" className="input" type="tel" placeholder="07xx xxx xxx" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>

            <div>
              <label className="label" style={{ color: "rgba(255,255,255,0.5)" }}>Password *</label>
              <div style={{ position: "relative" }}>
                <input
                  id="auth-password"
                  className="input"
                  type={showPwd ? "text" : "password"}
                  placeholder={mode === "login" ? "Your password" : "Min 6 characters"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: "2.75rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#6b876b" }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <div>
                <label className="label" style={{ color: "rgba(255,255,255,0.5)" }}>Confirm Password *</label>
                <input id="auth-confirm-password" className="input" type={showPwd ? "text" : "password"} placeholder="Re-enter password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} required />
              </div>
            )}

            {error && (
              <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-md)", padding: "0.75rem 1rem", color: "#f87171", fontSize: "0.875rem" }}>
                ⚠️ {error}
              </div>
            )}

            <button id="auth-submit" className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: "0.5rem" }}>
              {loading ? (
                <><Loader size={16} style={{ animation: "spin 1s linear infinite" }} /> Please wait...</>
              ) : (
                mode === "login" ? "Sign In →" : "Create Account →"
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{ marginTop: "1.5rem", padding: "1rem", background: "rgba(22,163,74,0.07)", borderRadius: "var(--radius-md)", border: "1px dashed rgba(22,163,74,0.3)" }}>
            <p style={{ fontSize: "0.75rem", color: "#6b876b", fontFamily: "var(--font-mono)" }}>
              🔑 Demo: <strong style={{ color: "#22c55e" }}>0712345678</strong> / <strong style={{ color: "#22c55e" }}>farmer123</strong>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .input, .select {
          background: rgba(255,255,255,0.06) !important;
          border-color: rgba(255,255,255,0.12) !important;
          color: #ecf5ec !important;
        }
        .input::placeholder { color: rgba(255,255,255,0.25) !important; }
        .input:focus { border-color: var(--clr-primary) !important; }
      `}</style>
    </div>
  );
}
