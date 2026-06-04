import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, ShoppingCart, TrendingUp, Truck, Smartphone,
  Shield, Zap, ChevronRight, Star
} from "lucide-react";
import api from "@/api/client";

interface Props {
  onNavigate: (tab: string) => void;
}

const STATS = [
  { value: "220+", label: "Farmers Surveyed" },
  { value: "5",    label: "Kenyan Counties" },
  { value: "M-PESA", label: "Payments Integrated" },
  { value: "0%",   label: "Broker Fees" },
];

const FEATURES = [
  {
    icon: <ShoppingCart size={24} />,
    title: "Direct Marketplace",
    desc: "List your produce and connect directly with urban retailers, institutions, and households — no brokers, more profit.",
    color: "#16a34a",
  },
  {
    icon: <TrendingUp size={24} />,
    title: "Real-Time Prices",
    desc: "Live Nairobi wholesale prices from Wakulima & City Market so you always know what your produce is worth before you sell.",
    color: "#f59e0b",
  },
  {
    icon: <Smartphone size={24} />,
    title: "M-PESA Payments",
    desc: "Secure instant payments via Safaricom Daraja API. Get paid the moment your produce is confirmed — no cash, no delays.",
    color: "#3b82f6",
  },
  {
    icon: <Truck size={24} />,
    title: "Shared Logistics",
    desc: "Pool transport with neighbouring farmers to cut delivery costs and reduce post-harvest losses from Nakuru to Nairobi.",
    color: "#8b5cf6",
  },
  {
    icon: <Smartphone size={24} />,
    title: "USSD Access",
    desc: "Use our USSD menu on any phone, even without internet. Works on feature phones across rural Kenya.",
    color: "#ef4444",
  },
  {
    icon: <Shield size={24} />,
    title: "DPA 2019 Compliant",
    desc: "All data is stored securely and processed in accordance with Kenya's Data Protection Act 2019.",
    color: "#06b6d4",
  },
];

const COUNTIES = ["Nakuru", "Meru", "Murang'a", "Kiambu", "Uasin Gishu"];

export function LandingPage({ onNavigate }: Props) {
  const [prices, setPrices] = useState<{ produce_name: string; price_per_kg: number; trend: string; market_name: string }[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get<{ data: typeof prices }>("prices", {}, { auth: false })
      .then(r => setPrices(r.data.slice(0, 6)))
      .catch(() => {});
  }, []);

  // Parallax
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onScroll = () => {
      hero.style.backgroundPositionY = `${window.scrollY * 0.4}px`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div>
      {/* ── HERO ────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="gradient-hero"
        style={{
          minHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "5rem 1.25rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: "10%", left: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(22,163,74,0.12),transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "15%", right: "8%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(245,158,11,0.1),transparent 70%)", pointerEvents: "none" }} />

        <div className="animate-fade-up" style={{ maxWidth: "820px" }}>
          {/* County badges */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.5rem", marginBottom: "2rem" }}>
            {COUNTIES.map(c => (
              <span key={c} className="badge badge-green" style={{ fontSize: "0.7rem" }}>
                📍 {c}
              </span>
            ))}
          </div>

          <h1 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "clamp(2.4rem,7vw,5rem)",
            lineHeight: 1.05,
            color: "#ecf5ec",
            marginBottom: "1.5rem",
          }}>
            The Digital Ecosystem<br />
            <span className="gradient-text">Kenyan Farmers Deserve</span>
          </h1>

          <p style={{ fontSize: "clamp(1rem,2.5vw,1.2rem)", color: "#6b876b", maxWidth: "600px", margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
            ShambaPoint connects smallholder farmers directly to buyers, real-time Nairobi market prices, M-PESA payments, and shared logistics — all in one unified platform.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem" }}>
            <button className="btn btn-primary btn-xl animate-fade-up delay-200" onClick={() => onNavigate("auth")}>
              Get Started Free <ArrowRight size={18} />
            </button>
            <button className="btn btn-outline btn-xl animate-fade-up delay-300" onClick={() => onNavigate("marketplace")}
              style={{ borderColor: "rgba(255,255,255,0.15)", color: "#b8cdb8" }}>
              Browse Marketplace
            </button>
          </div>

          {/* Trust row */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1.5rem", marginTop: "3rem", color: "#6b876b", fontSize: "0.82rem" }}>
            {["✅ No broker fees", "📱 M-PESA integrated", "🔒 DPA 2019 compliant", "📡 USSD offline access"].map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div style={{ position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)", animation: "float 2.5s ease-in-out infinite" }}>
          <ChevronRight size={22} style={{ color: "#6b876b", transform: "rotate(90deg)" }} />
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────── */}
      <section style={{ background: "var(--clr-primary)", padding: "2rem 0" }}>
        <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "1.5rem", textAlign: "center" }}>
          {STATS.map(({ value, label }) => (
            <div key={label} className="animate-fade-in">
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "2rem", color: "#fff" }}>{value}</div>
              <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span className="badge badge-green" style={{ marginBottom: "1rem" }}>
              <Zap size={12} /> Four Core Modules
            </span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 800, color: "var(--clr-text)", marginBottom: "1rem" }}>
              Everything in One Workflow
            </h2>
            <p style={{ color: "var(--clr-text-3)", maxWidth: "520px", margin: "0 auto", fontSize: "1rem" }}>
              Unlike fragmented platforms, ShambaPoint integrates marketplace, pricing, payments, and logistics into a single seamless experience.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: "1.5rem" }}>
            {FEATURES.map(({ icon, title, desc, color }, i) => (
              <div
                key={title}
                className="card animate-fade-up"
                style={{ padding: "2rem", animationDelay: `${i * 0.08}s` }}
              >
                <div style={{
                  width: 48, height: 48,
                  borderRadius: "12px",
                  background: `${color}18`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color, marginBottom: "1.25rem",
                }}>
                  {icon}
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--clr-text)", marginBottom: "0.625rem" }}>
                  {title}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--clr-text-3)", lineHeight: 1.7 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE PRICES TICKER ────────────────────────────────── */}
      {prices.length > 0 && (
        <section style={{ background: "var(--clr-surface-2)", padding: "3rem 0", borderTop: "1px solid var(--clr-border)", borderBottom: "1px solid var(--clr-border)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <span className="badge badge-amber" style={{ marginBottom: "0.75rem" }}>
                <TrendingUp size={12} /> Live Market Prices
              </span>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 800, color: "var(--clr-text)" }}>
                Nairobi Wholesale Prices Today
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "1rem" }}>
              {prices.map(p => (
                <div key={p.produce_name + p.market_name} style={{
                  background: "var(--clr-surface-3)",
                  border: "1px solid var(--clr-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "1.25rem",
                  textAlign: "center",
                }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 800, color: "var(--clr-text)" }}>
                    Ksh {p.price_per_kg}/kg
                  </div>
                  <div style={{ fontWeight: 600, color: "var(--clr-text-2)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                    {p.produce_name}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--clr-text-3)", marginTop: "0.2rem" }}>
                    {p.market_name}
                  </div>
                  <span className={`badge ${p.trend === "rising" ? "badge-green" : p.trend === "dropping" ? "badge-red" : "badge-gray"}`} style={{ marginTop: "0.625rem" }}>
                    {p.trend === "rising" ? "↑" : p.trend === "dropping" ? "↓" : "→"} {p.trend}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="section" style={{ background: "var(--clr-surface)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,4vw,2.5rem)", fontWeight: 800, color: "var(--clr-text)", marginBottom: "0.75rem" }}>
              How It Works
            </h2>
            <p style={{ color: "var(--clr-text-3)", maxWidth: "480px", margin: "0 auto" }}>
              Three simple steps from farm to payment
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: "2rem", position: "relative" }}>
            {[
              { num: "01", title: "List Your Produce", desc: "Register and upload your produce with quantity, price, and location. Takes 2 minutes — works on any phone." },
              { num: "02", title: "Buyer Places Order", desc: "Urban retailers and households browse listings, place orders, and confirm via M-PESA STK push." },
              { num: "03", title: "Pool Transport & Get Paid", desc: "Book shared logistics for delivery. Payment lands in your M-PESA wallet the moment the order is confirmed." },
            ].map(({ num, title, desc }, i) => (
              <div key={num} className="animate-fade-up" style={{ animationDelay: `${i * 0.12}s` }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "4rem", fontWeight: 900, color: "rgba(22,163,74,0.12)", lineHeight: 1 }}>
                  {num}
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, color: "var(--clr-text)", margin: "0.5rem 0 0.625rem" }}>
                  {title}
                </h3>
                <p style={{ color: "var(--clr-text-3)", fontSize: "0.9rem", lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO BENEFITS ──────────────────────────────────────── */}
      <section className="section" style={{ background: "var(--clr-surface-2)", borderTop: "1px solid var(--clr-border)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,4vw,2.5rem)", fontWeight: 800, color: "var(--clr-text)" }}>
              Built for Everyone in the Chain
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "1.5rem" }}>
            {[
              { role: "🌾 Farmers",    desc: "List produce, check prices, request transport, get M-PESA payments instantly." },
              { role: "🛒 Buyers",      desc: "Browse fresh listings from verified farmers, place orders, track delivery." },
              { role: "🚛 Logistics",   desc: "Accept transport requests, pool routes, earn more per trip." },
              { role: "📊 Admin",       desc: "Monitor the full ecosystem, update prices, manage users and analytics." },
            ].map(({ role, desc }) => (
              <div key={role} className="card" style={{ padding: "1.75rem" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{role.split(" ")[0]}</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--clr-text)", marginBottom: "0.5rem" }}>
                  {role.split(" ").slice(1).join(" ")}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--clr-text-3)", lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 800, color: "var(--clr-text)" }}>
              Grounded in Real Research
            </h2>
            <p style={{ color: "var(--clr-text-3)", maxWidth: "500px", margin: "0.75rem auto 0" }}>
              Built after surveying 220 participants across 5 Kenyan counties including farmers, buyers, logistics providers, and extension officers.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "1.25rem" }}>
            {[
              { quote: "\"Farmers consistently receive only a fraction of the final retail price. ShambaPoint gives us the other side.\"", role: "Agricultural Extension Officer, Nakuru" },
              { quote: "\"I always sold cheap because I didn't know Nairobi prices. Now I check before I even harvest.\"", role: "Smallholder Farmer, Meru" },
              { quote: "\"Getting paid via M-PESA immediately after delivery changed everything for our cash flow.\"", role: "Buyer, Wakulima Market, Nairobi" },
            ].map(({ quote, role }) => (
              <div key={role} style={{
                background: "var(--clr-surface-2)",
                border: "1px solid var(--clr-border)",
                borderRadius: "var(--radius-lg)",
                padding: "1.75rem",
              }}>
                <Star size={16} style={{ color: "var(--clr-accent)", marginBottom: "0.875rem" }} />
                <p style={{ fontSize: "0.9rem", color: "var(--clr-text-2)", lineHeight: 1.7, fontStyle: "italic", marginBottom: "1rem" }}>
                  {quote}
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--clr-text-3)", fontWeight: 600 }}>{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────── */}
      <section style={{
        background: "linear-gradient(135deg,var(--clr-primary-dark),#0f2010)",
        padding: "5rem 1.25rem",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 900, color: "#fff", marginBottom: "1.25rem" }}>
            Ready to Grow Your Farm Income?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.05rem", marginBottom: "2rem" }}>
            Join ShambaPoint today. Register as a farmer, buyer, or logistics provider and start earning more from every harvest.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem" }}>
            <button className="btn btn-accent btn-xl" onClick={() => onNavigate("auth")}>
              Register Now — It's Free <ArrowRight size={18} />
            </button>
            <button className="btn btn-outline btn-xl" onClick={() => onNavigate("marketplace")}
              style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)" }}>
              Browse Listings
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
