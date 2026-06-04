import { useState, useEffect, useCallback } from "react";
import { Search, Plus, X, Loader, ShoppingCart } from "lucide-react";
import api from "@/api/client";

interface Listing {
  id: number;
  name: string;
  emoji: string;
  category: string;
  quantity_kg: number;
  price_per_kg: number;
  county: string;
  location: string;
  quality_grade: string;
  description: string;
  status: string;
  farmer_name: string;
  farmer_phone: string;
  farmer_county: string;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  role: string;
}

interface Props {
  token: string | null;
  user: User | null;
}

const COUNTIES = ["", "Nakuru","Meru","Murang'a","Kiambu","Uasin Gishu","Nairobi","Mombasa","Kisumu","Nyeri","Kakamega"];
const CATEGORIES = ["", "Vegetables","Fruits","Tubers","Cereals","Legumes","Dairy","General"];
const EMOJIS: Record<string,string> = {
  Vegetables: "🥬", Fruits: "🍎", Tubers: "🥔", Cereals: "🌽", Legumes: "🫘", Dairy: "🥛", General: "🌿",
};

export function MarketplacePage({ token, user }: Props) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCounty, setFilterCounty] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [orderModal, setOrderModal] = useState<Listing | null>(null);
  const [toastMsg, setToastMsg] = useState("");

  // Create listing form state
  const [form, setForm] = useState({ name: "", category: "Vegetables", quantity_kg: "", price_per_kg: "", county: "", location: "", quality_grade: "Grade A", description: "", emoji: "🌿" });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Order form
  const [orderQty, setOrderQty] = useState("");
  const [orderLoc, setOrderLoc] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);

  const toast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string,string> = { status: "active" };
      if (search)       params.search   = search;
      if (filterCounty) params.county   = filterCounty;
      if (filterCat)    params.category = filterCat;
      const r = await api.get<{ data: Listing[] }>("listings", params, { auth: false });
      setListings(r.data);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  }, [search, filterCounty, filterCat]);

  useEffect(() => {
    const t = setTimeout(fetchListings, 300);
    return () => clearTimeout(t);
  }, [fetchListings]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.quantity_kg || !form.price_per_kg) return setFormError("Name, quantity and price are required.");
    setFormLoading(true);
    setFormError("");
    try {
      await api.post("listings", { ...form, quantity_kg: parseFloat(form.quantity_kg), price_per_kg: parseFloat(form.price_per_kg), emoji: EMOJIS[form.category] ?? "🌿" });
      toast("✅ Listing published successfully!");
      setShowForm(false);
      setForm({ name: "", category: "Vegetables", quantity_kg: "", price_per_kg: "", county: "", location: "", quality_grade: "Grade A", description: "", emoji: "🌿" });
      fetchListings();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to create listing.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderModal) return;
    setOrderLoading(true);
    try {
      const r = await api.post<{ id: number; total_ksh: number }>("orders", {
        listing_id: orderModal.id,
        quantity_kg: parseFloat(orderQty),
        delivery_location: orderLoc,
      });
      toast(`✅ Order #${r.id} placed! Total: Ksh ${r.total_ksh.toLocaleString()}. M-PESA STK push sent.`);
      setOrderModal(null);
      setOrderQty("");
      setOrderLoc("");
    } catch (err: unknown) {
      toast("❌ " + (err instanceof Error ? err.message : "Order failed."));
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100dvh", background: "var(--clr-surface)", paddingBottom: "4rem" }}>
      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 100,
          background: "#16a34a", color: "#fff",
          padding: "0.875rem 1.25rem", borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-lg)", fontWeight: 600, maxWidth: "340px",
          animation: "slideInRight 0.3s var(--ease-bounce)",
        }}>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ background: "var(--clr-surface-2)", borderBottom: "1px solid var(--clr-border)", padding: "2rem 0 1.5rem" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem,4vw,2.2rem)", fontWeight: 800, color: "var(--clr-text)" }}>
                🌿 Marketplace
              </h1>
              <p style={{ color: "var(--clr-text-3)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                {listings.length} active listing{listings.length !== 1 ? "s" : ""} from Kenyan farmers
              </p>
            </div>
            {token && user?.role === "farmer" && (
              <button className="btn btn-primary" onClick={() => setShowForm(true)} id="btn-create-listing">
                <Plus size={16} /> List Produce
              </button>
            )}
          </div>

          {/* Search & Filters */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1.25rem" }}>
            <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
              <Search size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--clr-text-3)" }} />
              <input
                id="marketplace-search"
                className="input"
                placeholder="Search produce..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: "2.5rem" }}
              />
            </div>
            <select id="filter-county" className="select" style={{ minWidth: "150px", width: "auto" }} value={filterCounty} onChange={e => setFilterCounty(e.target.value)}>
              <option value="">All Counties</option>
              {COUNTIES.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select id="filter-category" className="select" style={{ minWidth: "150px", width: "auto" }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {(search || filterCounty || filterCat) && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(""); setFilterCounty(""); setFilterCat(""); }}>
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Listings grid */}
      <div className="container" style={{ paddingTop: "2rem" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1.25rem" }}>
            {[...Array(6)].map((_,i) => <div key={i} className="skeleton" style={{ height: 240 }} />)}
          </div>
        ) : listings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--clr-text-3)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌾</div>
            <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--clr-text-2)" }}>No listings found</p>
            <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>Try adjusting your search or filters.</p>
            {token && user?.role === "farmer" && (
              <button className="btn btn-primary" style={{ marginTop: "1.5rem" }} onClick={() => setShowForm(true)}>
                <Plus size={16} /> Be the first to list
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1.25rem" }}>
            {listings.map(l => (
              <div key={l.id} className="card card-produce animate-fade-up" style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.875rem" }}>
                  <span style={{ fontSize: "2.5rem", lineHeight: 1 }}>{l.emoji}</span>
                  <span className={`badge ${l.quality_grade === "Grade A" ? "badge-green" : "badge-amber"}`}>
                    {l.quality_grade}
                  </span>
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: "var(--clr-text)", marginBottom: "0.25rem" }}>
                  {l.name}
                </h3>
                <p style={{ fontSize: "0.8rem", color: "var(--clr-text-3)", marginBottom: "1rem" }}>
                  📍 {l.county} · {l.farmer_name}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1.25rem" }}>
                  <div style={{ background: "var(--clr-surface-3)", borderRadius: "var(--radius-sm)", padding: "0.75rem" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "var(--clr-primary)" }}>
                      Ksh {l.price_per_kg}/kg
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--clr-text-3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Price</div>
                  </div>
                  <div style={{ background: "var(--clr-surface-3)", borderRadius: "var(--radius-sm)", padding: "0.75rem" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "var(--clr-text)" }}>
                      {l.quantity_kg} kg
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--clr-text-3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Available</div>
                  </div>
                </div>
                {l.description && (
                  <p style={{ fontSize: "0.82rem", color: "var(--clr-text-3)", marginBottom: "1rem", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {l.description}
                  </p>
                )}
                {token && user?.role === "buyer" ? (
                  <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => setOrderModal(l)} id={`btn-order-${l.id}`}>
                    <ShoppingCart size={15} /> Order Now
                  </button>
                ) : !token ? (
                  <button className="btn btn-outline" style={{ width: "100%" }} onClick={() => window.location.hash = "#/auth"}>
                    Sign in to order
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── CREATE LISTING MODAL ──────────────────────────────── */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }} onClick={() => setShowForm(false)}>
          <div style={{ background: "var(--clr-surface-2)", borderRadius: "var(--radius-xl)", padding: "2rem", width: "100%", maxWidth: "520px", maxHeight: "90dvh", overflowY: "auto", animation: "scaleIn 0.3s var(--ease-bounce)" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.3rem", color: "var(--clr-text)" }}>
                List Your Produce
              </h2>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost btn-sm"><X size={16} /></button>
            </div>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label className="label">Produce Name *</label>
                <input id="form-name" className="input" placeholder="e.g. Tomatoes (Money Maker)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label className="label">Category *</label>
                  <select id="form-category" className="select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Quality Grade *</label>
                  <select id="form-grade" className="select" value={form.quality_grade} onChange={e => setForm(f => ({ ...f, quality_grade: e.target.value }))}>
                    <option>Grade A</option>
                    <option>Grade B</option>
                    <option>Grade C</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label className="label">Quantity (KG) *</label>
                  <input id="form-quantity" className="input" type="number" min="0.1" step="0.1" placeholder="e.g. 500" value={form.quantity_kg} onChange={e => setForm(f => ({ ...f, quantity_kg: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Price per KG (Ksh) *</label>
                  <input id="form-price" className="input" type="number" min="1" step="0.5" placeholder="e.g. 45" value={form.price_per_kg} onChange={e => setForm(f => ({ ...f, price_per_kg: e.target.value }))} required />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label className="label">County</label>
                  <select id="form-county" className="select" value={form.county} onChange={e => setForm(f => ({ ...f, county: e.target.value }))}>
                    <option value="">Select county</option>
                    {COUNTIES.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Location / Town</label>
                  <input id="form-location" className="input" placeholder="e.g. Nakuru Town" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea id="form-desc" className="input" placeholder="Grade, freshness, packaging details..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ resize: "vertical" }} />
              </div>
              {formError && <div style={{ color: "#f87171", fontSize: "0.875rem", background: "rgba(239,68,68,0.1)", padding: "0.75rem", borderRadius: "var(--radius-md)" }}>⚠️ {formError}</div>}
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button>
                <button id="form-submit" type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={formLoading}>
                  {formLoading ? <><Loader size={15} style={{ animation: "spin 1s linear infinite" }} /> Publishing...</> : "Publish Listing →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ORDER MODAL ───────────────────────────────────────── */}
      {orderModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }} onClick={() => setOrderModal(null)}>
          <div style={{ background: "var(--clr-surface-2)", borderRadius: "var(--radius-xl)", padding: "2rem", width: "100%", maxWidth: "440px", animation: "scaleIn 0.3s var(--ease-bounce)" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.3rem", color: "var(--clr-text)" }}>
                {orderModal.emoji} Order {orderModal.name}
              </h2>
              <button onClick={() => setOrderModal(null)} className="btn btn-ghost btn-sm"><X size={16} /></button>
            </div>
            <div style={{ background: "var(--clr-surface-3)", borderRadius: "var(--radius-md)", padding: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", color: "var(--clr-text-2)" }}>
                <span>Price per kg</span>
                <strong style={{ color: "var(--clr-primary)" }}>Ksh {orderModal.price_per_kg}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", color: "var(--clr-text-2)", marginTop: "0.5rem" }}>
                <span>Available</span>
                <strong>{orderModal.quantity_kg} kg</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", color: "var(--clr-text-2)", marginTop: "0.5rem" }}>
                <span>Farmer</span>
                <strong>{orderModal.farmer_name} · {orderModal.county}</strong>
              </div>
              {orderQty && (
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1rem", color: "var(--clr-text)", marginTop: "0.875rem", paddingTop: "0.875rem", borderTop: "1px solid var(--clr-border)" }}>
                  <span>Total</span>
                  <span style={{ color: "var(--clr-primary)" }}>Ksh {(parseFloat(orderQty || "0") * orderModal.price_per_kg).toLocaleString()}</span>
                </div>
              )}
            </div>
            <form onSubmit={handleOrder} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label className="label">Quantity (KG) *</label>
                <input id="order-qty" className="input" type="number" min="0.1" step="0.1" max={orderModal.quantity_kg} placeholder={`Max ${orderModal.quantity_kg} kg`} value={orderQty} onChange={e => setOrderQty(e.target.value)} required />
              </div>
              <div>
                <label className="label">Delivery Location *</label>
                <input id="order-location" className="input" placeholder="e.g. Westlands Market, Nairobi" value={orderLoc} onChange={e => setOrderLoc(e.target.value)} required />
              </div>
              <div style={{ background: "rgba(22,163,74,0.08)", borderRadius: "var(--radius-md)", padding: "0.875rem", fontSize: "0.8rem", color: "var(--clr-text-3)" }}>
                📱 M-PESA STK push will be sent to your registered phone number upon order confirmation.
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setOrderModal(null)}>Cancel</button>
                <button id="order-submit" type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={orderLoading}>
                  {orderLoading ? <><Loader size={15} style={{ animation: "spin 1s linear infinite" }} /> Placing...</> : <><ShoppingCart size={15} /> Place Order →</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        textarea.input { height: auto; }
      `}</style>
    </div>
  );
}
