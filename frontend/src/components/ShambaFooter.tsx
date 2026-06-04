import { Leaf, Mail } from "lucide-react";

type Tab = "home" | "about" | "marketplace" | "dashboard" | "auth";

interface Props {
  onNavigate: (t: Tab) => void;
}

const GithubIcon = ({ size }: { size: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const TwitterIcon = ({ size }: { size: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);

export function ShambaFooter({ onNavigate }: Props) {
  return (
    <footer style={{
      borderTop: "1px solid var(--clr-border)",
      background: "var(--clr-surface-2)",
      padding: "3rem 0 1.5rem",
    }}>
      <div className="container">
        {/* Top row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "2.5rem", marginBottom: "2.5rem" }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
              <span style={{
                background: "linear-gradient(135deg,var(--clr-primary),var(--clr-accent))",
                borderRadius: "8px",
                padding: "4px 6px",
                display: "flex",
                alignItems: "center",
              }}>
                <Leaf size={14} color="#fff" />
              </span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "var(--clr-text)" }}>
                Shamba<span style={{ color: "var(--clr-primary-light)" }}>Point</span>
              </span>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--clr-text-3)", lineHeight: 1.7, maxWidth: "220px" }}>
              Empowering Kenyan smallholder farmers with direct market access, real-time pricing, and M-PESA payments.
            </p>
          </div>

          {/* Platform links */}
          <div>
            <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--clr-text-2)", marginBottom: "0.875rem" }}>
              Platform
            </h4>
            {[
              { key: "marketplace", label: "Marketplace" },
              { key: "about", label: "About ShambaPoint" },
              { key: "auth", label: "Sign In / Register" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => onNavigate(key as Tab)}
                style={{ display: "block", background: "none", border: "none", cursor: "pointer", fontSize: "0.875rem", color: "var(--clr-text-3)", marginBottom: "0.5rem", padding: 0, fontFamily: "var(--font-body)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--clr-primary)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--clr-text-3)")}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--clr-text-2)", marginBottom: "0.875rem" }}>
              Legal
            </h4>
            {["Privacy Policy", "Terms of Service", "Data Protection (DPA 2019)"].map(item => (
              <a
                key={item}
                href="#"
                style={{ display: "block", fontSize: "0.875rem", color: "var(--clr-text-3)", marginBottom: "0.5rem", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--clr-primary)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--clr-text-3)")}
              >
                {item}
              </a>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--clr-text-2)", marginBottom: "0.875rem" }}>
              Contact
            </h4>
            <p style={{ fontSize: "0.875rem", color: "var(--clr-text-3)" }}>hello@shambapoint.co.ke</p>
            <p style={{ fontSize: "0.875rem", color: "var(--clr-text-3)", marginTop: "0.25rem" }}>Nairobi, Kenya</p>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
              <a href="#" style={{ color: "var(--clr-text-3)", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color = "var(--clr-primary)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--clr-text-3)")}>
                <GithubIcon size={18} />
              </a>
              <a href="#" style={{ color: "var(--clr-text-3)", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color = "var(--clr-primary)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--clr-text-3)")}>
                <TwitterIcon size={18} />
              </a>
              <a href="#" style={{ color: "var(--clr-text-3)", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color = "var(--clr-primary)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--clr-text-3)")}>
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{
          borderTop: "1px solid var(--clr-border)",
          paddingTop: "1.25rem",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.75rem",
        }}>
          <span style={{ fontSize: "0.8rem", color: "var(--clr-text-3)", fontFamily: "var(--font-mono)" }}>
            © {new Date().getFullYear()} ShambaPoint · By Kevin Muli · DSE-02-0024/2025
          </span>
          <span style={{ fontSize: "0.8rem", color: "var(--clr-text-3)" }}>
            Built with ❤️ for Kenya's smallholder farmers
          </span>
        </div>
      </div>
    </footer>
  );
}
