import { useState, useEffect } from "react";
import {
  LayoutDashboardIcon,
  SproutIcon,
  ShoppingBagIcon,
  TrendingUpIcon,
  TruckIcon,
  SmartphoneIcon,
  MessageSquareIcon,
  UsersIcon,
  SettingsIcon,
  HelpCircleIcon,
  BellIcon,
  MapPinIcon,
  PlusIcon,
  SearchIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  LeafIcon,
  XIcon,
  LogOutIcon,
  Loader2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Map produce name keywords → public image path */
function produceImage(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("kale") || n.includes("sukuma")) return "/produce_kale.png";
  if (n.includes("tomato"))  return "/produce_tomatoes.png";
  if (n.includes("onion"))   return "/produce_onions.png";
  if (n.includes("carrot"))  return "/produce_carrots.png";
  if (n.includes("potato"))  return "/produce_potatoes.png";
  return ""; // fallback to emoji
}


interface NavItem {
  icon: React.ReactNode;
  label: string;
  id: string;
}

const NAV_MAIN: NavItem[] = [
  { icon: <LayoutDashboardIcon className="size-4" />, label: "Dashboard", id: "dashboard" },
  { icon: <SproutIcon className="size-4" />, label: "My Listings", id: "listings" },
  { icon: <ShoppingBagIcon className="size-4" />, label: "Orders", id: "orders" },
  { icon: <TrendingUpIcon className="size-4" />, label: "Market Prices", id: "prices" },
];

const NAV_PLATFORM: NavItem[] = [
  { icon: <TruckIcon className="size-4" />, label: "Logistics", id: "logistics" },
  { icon: <SmartphoneIcon className="size-4" />, label: "M-PESA", id: "mpesa" },
  { icon: <MessageSquareIcon className="size-4" />, label: "Messages", id: "messages" },
  { icon: <UsersIcon className="size-4" />, label: "Cooperative", id: "coop" },
];

const NAV_ACCOUNT: NavItem[] = [
  { icon: <SettingsIcon className="size-4" />, label: "Settings", id: "settings" },
  { icon: <HelpCircleIcon className="size-4" />, label: "Support", id: "support" },
];

interface ShambaDashboardProps {
  user: {
    id: number;
    name: string;
    phone: string;
    email?: string;
    role: "farmer" | "buyer" | "admin";
    county?: string;
    location?: string;
    avatar_initials?: string;
  };
  token: string;
  onLogout: () => void;
  onBack?: () => void;
}

export function ShambaDashboard({ user, token, onLogout, onBack }: ShambaDashboardProps) {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // API State
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    total_revenue: 84200,
    month_revenue: 12400,
    active_listings: 14,
    expiring_soon: 3,
    total_orders: 7,
    orders_in_transit: 2,
    orders_delivered: 5,
    orders_pending: 0,
    wallet_balance: 12480,
  });
  const [myListings, setMyListings] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [logistics, setLogistics] = useState<any[]>([]);
  const [marketPrices, setMarketPrices] = useState<any[]>([]);

  // Dialog Modals
  const [showAddListing, setShowAddListing] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [apiError, setApiError] = useState("");

  // New Listing Form State
  const [newListingName, setNewListingName] = useState("");
  const [newListingQty, setNewListingQty] = useState("");
  const [newListingPrice, setNewListingPrice] = useState("");
  const [newListingCategory, setNewListingCategory] = useState("Vegetables");
  const [newListingGrade, setNewListingGrade] = useState("Grade A");
  const [newListingDesc, setNewListingDesc] = useState("");

  // Withdraw Form State
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawPhone, setWithdrawPhone] = useState(user.phone);

  const fetchDashboardData = async () => {
    setLoading(true);
    setApiError("");
    try {
      const response = await fetch("/api/dashboard", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      if (data.success) {
        if (data.stats) setStats(data.stats);
        if (data.my_listings) setMyListings(data.my_listings);
        if (data.recent_orders) setRecentOrders(data.recent_orders);
        if (data.transactions) setTransactions(data.transactions);
        if (data.logistics) setLogistics(data.logistics);
        if (data.market_prices) setMarketPrices(data.market_prices);
      }
    } catch (err: any) {
      console.warn("Backend API not reachable. Using mock simulation mode.", err);
      setApiError("Running in local simulation mode (XAMPP server offline or setup pending)");
      // Populate defaults for mock
      setMyListings([
        { emoji: "🥬", image_url: "/Small-Farmers/produce_kale.png",     name: "Kale (Sukuma Wiki)",      category: "Vegetables", quantity_kg: 120, price_per_kg: 18, county: "Nakuru", location: "Njoro",  quality_grade: "Grade A", status: "active" },
        { emoji: "🍅", image_url: "/Small-Farmers/produce_tomatoes.png", name: "Tomatoes (Money Maker)",   category: "Vegetables", quantity_kg: 85,  price_per_kg: 54, county: "Nakuru", location: "Lanet",  quality_grade: "Grade A", status: "active" },
        { emoji: "🧅", image_url: "/Small-Farmers/produce_onions.png",   name: "Red Onions",              category: "Vegetables", quantity_kg: 200, price_per_kg: 62, county: "Nakuru", location: "Bahati", quality_grade: "Grade A", status: "active" },
        { emoji: "🥕", image_url: "/Small-Farmers/produce_carrots.png",  name: "Carrots",                 category: "Vegetables", quantity_kg: 60,  price_per_kg: 35, county: "Nakuru", location: "Molo",   quality_grade: "Grade B", status: "active" },
      ]);

      setRecentOrders([
        { id: 1, produce_name: "Kale (Sukuma Wiki)", emoji: "🥬", buyer_name: "Mama Ngina Supermarket", buyer_phone: "0722111222", delivery_location: "Westlands, Nairobi", total_ksh: 4320, status: "confirmed", created_at: "2026-06-02 08:34:00" },
        { id: 2, produce_name: "Arabica Coffee AA", emoji: "☕", buyer_name: "Kenyatta Hospital", buyer_phone: "0733444555", delivery_location: "Nairobi CBD", total_ksh: 12000, status: "pending", created_at: "2026-06-01 14:15:00" },
        { id: 3, produce_name: "Red Onions", emoji: "🧅", buyer_name: "Quick Mart Ruaka", buyer_phone: "0799888777", delivery_location: "Kiambu Rd", total_ksh: 7650, status: "in_transit", created_at: "2026-05-30 06:12:00" },
      ]);
      setTransactions([
        { direction: "in", description: "Wakulima Market · Nairobi", created_at: "2026-06-03 08:34:00", amount_ksh: 6480, status: "completed" },
        { direction: "in", description: "City Market · Nairobi", created_at: "2026-06-02 15:12:00", amount_ksh: 3240, status: "completed" },
        { direction: "out", description: "Logistics — Nakuru→Nairobi", created_at: "2026-06-02 06:00:00", amount_ksh: 1200, status: "completed" },
      ]);
      setLogistics([
        { route_from: "Nakuru", route_to: "Wakulima", vehicle_type: "truck", departure_date: "2026-06-10", status: "confirmed", pooled_count: 3 },
        { route_from: "Farm", route_to: "Nakuru Town", vehicle_type: "motorbike", departure_date: "2026-06-03", status: "pending", pooled_count: 1 },
      ]);
      setMarketPrices([
        { produce_name: "Kale", market_name: "Wakulima", price_per_kg: 22, trend: "rising" },
        { produce_name: "Tomatoes", market_name: "Wakulima", price_per_kg: 60, trend: "stable" },
        { produce_name: "Onions", market_name: "Wakulima", price_per_kg: 80, trend: "rising" },
        { produce_name: "Carrots", market_name: "City Mkt", price_per_kg: 38, trend: "dropping" },
        { produce_name: "Potatoes", market_name: "City Mkt", price_per_kg: 46, trend: "stable" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const handleAddListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: newListingName,
          category: newListingCategory,
          quantity_kg: parseFloat(newListingQty),
          price_per_kg: parseFloat(newListingPrice),
          quality_grade: newListingGrade,
          description: newListingDesc,
          county: user.county || "Nakuru",
          location: user.location || "Nakuru Town",
          emoji: newListingName.toLowerCase().includes("tomato") ? "🍅" : newListingName.toLowerCase().includes("onion") ? "🧅" : "🥬"
        })
      });
      const data = await response.json();
      if (data.success) {
        setShowAddListing(false);
        // Reset form
        setNewListingName("");
        setNewListingQty("");
        setNewListingPrice("");
        setNewListingDesc("");
        // Reload dashboard
        fetchDashboardData();
      } else {
        alert(data.error || "Failed to create listing");
      }
    } catch (err) {
      // Offline fallback
      const newList = {
        emoji: newListingName.toLowerCase().includes("tomato") ? "🍅" : newListingName.toLowerCase().includes("onion") ? "🧅" : "🥬",
        name: newListingName,
        category: newListingCategory,
        quantity_kg: parseFloat(newListingQty),
        price_per_kg: parseFloat(newListingPrice),
        county: user.county || "Nakuru",
        location: user.location || "Nakuru Town",
        quality_grade: newListingGrade,
        status: "active"
      };
      setMyListings([newList, ...myListings]);
      setStats({ ...stats, active_listings: stats.active_listings + 1 });
      setShowAddListing(false);
      setNewListingName("");
      setNewListingQty("");
      setNewListingPrice("");
      setNewListingDesc("");
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/mpesa?action=stk", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          phone: withdrawPhone,
          amount: parseFloat(withdrawAmount),
          description: "Wallet Withdrawal"
        })
      });
      const data = await response.json();
      if (data.success) {
        alert("M-PESA STK Push Sent! Enter PIN on phone to complete withdrawal.");
        setShowWithdraw(false);
        setWithdrawAmount("");
        fetchDashboardData();
      } else {
        alert(data.error || "Failed to process withdrawal request");
      }
    } catch (err) {
      // Simulation fallback
      const amt = parseFloat(withdrawAmount);
      if (stats.wallet_balance < amt) {
        alert("Insufficient wallet balance.");
        return;
      }
      setStats({
        ...stats,
        wallet_balance: stats.wallet_balance - amt
      });
      setTransactions([
        { direction: "out", description: `Withdrawal via M-PESA to ${withdrawPhone}`, created_at: new Date().toLocaleString(), amount_ksh: amt, status: "completed" },
        ...transactions
      ]);
      alert(`[Simulation Mode] Success! Ksh ${amt} withdrawn via M-PESA to ${withdrawPhone}`);
      setShowWithdraw(false);
      setWithdrawAmount("");
    }
  };

  const roleText = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* ── SIDEBAR ── */}
      <aside
        className={`${sidebarOpen ? "w-56" : "w-0 overflow-hidden"} flex-shrink-0 transition-all duration-300 flex flex-col bg-card border-r border-border`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <LeafIcon className="size-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-foreground tracking-tight">ShambaPoint</span>
            <span className="text-[10px] text-muted-foreground tracking-wide">Digital Marketplace</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-5">
          {/* Main */}
          <div>
            <div className="px-4 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Main</div>
            {NAV_MAIN.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 mx-1 rounded-lg text-sm transition-all duration-150 text-left ${
                  activeNav === item.id
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`}
              >
                <span className={activeNav === item.id ? "text-primary" : ""}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Platform */}
          <div>
            <div className="px-4 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Platform</div>
            {NAV_PLATFORM.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 mx-1 rounded-lg text-sm transition-all duration-150 text-left ${
                  activeNav === item.id
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`}
              >
                <span className={activeNav === item.id ? "text-primary" : ""}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Account */}
          <div>
            <div className="px-4 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Account</div>
            {NAV_ACCOUNT.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 mx-1 rounded-lg text-sm transition-all duration-150 text-left ${
                  activeNav === item.id
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        {/* User pill */}
        <div className="border-t border-border p-3 space-y-2">
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-muted/40 transition-colors">
            <div className="size-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
              {user.avatar_initials || user.name.slice(0,2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{user.name}</div>
              <div className="text-[11px] text-muted-foreground">{roleText} · {user.county || "Nairobi"}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
          >
            <LogOutIcon className="size-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Topbar */}
        <div className="flex items-center gap-3 px-6 py-3.5 bg-card border-b border-border flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
          >
            <LayoutDashboardIcon className="size-4" />
          </button>
          <span className="text-base font-medium text-foreground flex-1">
            Good morning, {user.name.split(" ")[0]} <span className="text-base">🌱</span>
          </span>

          {/* Search */}
          <div className="flex items-center gap-2 bg-muted/40 border border-border rounded-lg px-3 h-8 min-w-[200px]">
            <SearchIcon className="size-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Search produce, buyers, routes…</span>
          </div>

          {/* Badges */}
          <button className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/40 transition-colors">
            <BellIcon className="size-3.5" /> 3
          </button>
          <button className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/40 transition-colors">
            <MapPinIcon className="size-3.5" /> {user.county || "Nairobi"}
          </button>

          {/* CTA */}
          {user.role === "farmer" && (
            <button
              onClick={() => setShowAddListing(true)}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-3 h-8 rounded-lg transition-colors uppercase tracking-wider"
            >
              <PlusIcon className="size-3.5" /> New Listing
            </button>
          )}

          {/* Back to site */}
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs border border-border px-3 h-8 rounded-lg transition-colors"
            >
              <XIcon className="size-3.5" /> Exit
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Local simulation warning alert */}
          {apiError && (
            <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-primary text-xs font-medium flex items-center justify-between">
              <span>⚡ {apiError}</span>
              <span className="text-[10px] opacity-75 font-mono uppercase">Offline Mode</span>
            </div>
          )}

          {loading ? (
            <div className="h-[50vh] flex flex-col items-center justify-center gap-2">
              <Loader2Icon className="size-8 text-primary animate-spin" />
              <span className="text-xs text-muted-foreground">Fetching ShambaPoint metrics...</span>
            </div>
          ) : (
            <>
              {/* ── STATS ROW ── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Revenue (For Farmer) or Total Spent (For Buyer) */}
                <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1.5 hover:border-primary/30 transition-colors">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-base">💰</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {user.role === "buyer" ? "Total Purchases" : "Total Revenue"}
                  </div>
                  <div className="text-xl font-bold text-foreground tracking-tight">
                    Ksh {stats.total_revenue?.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-primary flex items-center gap-1">
                    <TrendingUpIcon className="size-3" /> +12.4% this month
                  </div>
                </div>
                
                {/* Listings (For Farmer) or Available Catalog Items (For Buyer) */}
                <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1.5 hover:border-primary/30 transition-colors">
                  <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <span className="text-base">📦</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {user.role === "buyer" ? "Active Market Listings" : "Active Listings"}
                  </div>
                  <div className="text-xl font-bold text-foreground tracking-tight">
                    {stats.active_listings}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {user.role === "buyer" ? "Direct from farmers" : `${stats.expiring_soon} expiring soon`}
                  </div>
                </div>

                {/* Deliveries / Active Orders */}
                <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1.5 hover:border-primary/30 transition-colors">
                  <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <span className="text-base">🚚</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">Deliveries</div>
                  <div className="text-xl font-bold text-foreground tracking-tight">
                    {stats.total_orders}
                  </div>
                  <div className="text-[11px] text-primary flex items-center gap-1">
                    <TrendingUpIcon className="size-3" /> {stats.orders_in_transit} en route today
                  </div>
                </div>

                {/* Post-harvest (For Farmer) or Savings (For Buyer) */}
                <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1.5 hover:border-primary/30 transition-colors">
                  <div className="size-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <span className="text-base">📉</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {user.role === "buyer" ? "Platform Fees Waived" : "Post-harvest Loss"}
                  </div>
                  <div className="text-xl font-bold text-foreground tracking-tight">
                    {user.role === "buyer" ? "0.0%" : "2.1%"}
                  </div>
                  <div className="text-[11px] text-primary flex items-center gap-1">
                    <TrendingUpIcon className="size-3" /> Down from 8.4%
                  </div>
                </div>
              </div>

              {/* ── MID ROW: Listings + M-PESA ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* My Listings (For Farmer) or Available Catalog (For Buyer) */}
                <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-foreground">
                      {user.role === "buyer" ? "Featured Harvest Listings" : "My Produce Listings"}
                    </span>
                    {user.role === "farmer" && (
                      <span
                        onClick={() => setShowAddListing(true)}
                        className="text-xs text-primary cursor-pointer hover:underline"
                      >
                        + Add listing ↗
                      </span>
                    )}
                  </div>
                  <div className="space-y-2.5">
                    {myListings.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">
                        No active listings found.
                      </div>
                    ) : (
                      myListings.map((p, index) => {
                        const imgSrc = p.image_url || produceImage(p.name);
                        return (
                          <div key={index} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/20 transition-all">
                            <div className="size-11 rounded-lg bg-muted/50 flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                              {imgSrc ? (
                                <img
                                  src={imgSrc}
                                  alt={p.name}
                                  className="w-full h-full object-cover rounded-lg"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              ) : (
                                <span>{p.emoji || "🥬"}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
                              <div className="text-[11px] text-muted-foreground">
                                {p.quantity_kg} kg · {p.location || "Nakuru"}, {p.county || "Nakuru"}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-foreground">Ksh {p.price_per_kg}/kg</div>
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                                {p.quality_grade || "Grade A"}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* M-PESA Panel */}
                <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <div className="bg-primary text-primary-foreground text-xs font-black px-2 py-1 rounded tracking-tight">M-PESA</div>
                    <div className="ml-auto text-right">
                      <div className="text-[10px] text-muted-foreground">Wallet balance</div>
                      <div className="text-lg font-bold text-foreground tracking-tight">Ksh {stats.wallet_balance?.toLocaleString()}</div>
                    </div>
                    {user.role === "farmer" && (
                      <button
                        onClick={() => setShowWithdraw(true)}
                        className="bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[220px]">
                    <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Recent transactions</div>
                    {transactions.length === 0 ? (
                      <div className="py-4 text-center text-xs text-muted-foreground">
                        No transactions recorded.
                      </div>
                    ) : (
                      transactions.map((t, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                          <div className={`size-7 rounded-full flex items-center justify-center flex-shrink-0 ${t.direction === "in" ? "bg-primary/10" : "bg-red-500/10"}`}>
                            {t.direction === "in"
                              ? <ArrowDownLeftIcon className="size-3.5 text-primary" />
                              : <ArrowUpRightIcon className="size-3.5 text-red-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-medium text-foreground truncate">{t.description}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {new Date(t.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className={`text-sm font-semibold ${t.direction === "in" ? "text-primary" : "text-red-400"}`}>
                            {t.direction === "in" ? "+" : "−"}Ksh {t.amount_ksh}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* ── BOTTOM ROW: Market Prices + Orders + Logistics ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Market Prices */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-foreground">Nairobi Market Prices</span>
                    <span className="text-xs text-primary cursor-pointer hover:underline">See all ↗</span>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-muted-foreground border-b border-border">
                        <th className="text-left pb-2 font-medium">Produce</th>
                        <th className="text-left pb-2 font-medium">Market</th>
                        <th className="text-left pb-2 font-medium">Ksh/kg</th>
                        <th className="text-left pb-2 font-medium">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marketPrices.map((r, index) => (
                        <tr key={index} className="border-b border-border/40 last:border-0">
                          <td className="py-2 text-foreground font-semibold">{r.produce_name}</td>
                          <td className="py-2 text-muted-foreground">{r.market_name}</td>
                          <td className="py-2 text-foreground">Ksh {r.price_per_kg}</td>
                          <td className="py-2">
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                              r.trend === "rising" ? "bg-primary/10 text-primary" :
                              r.trend === "stable" ? "bg-amber-500/10 text-amber-400" :
                              "bg-red-500/10 text-red-400"
                            }`}>
                              {r.trend === "rising" ? "▲ High" : r.trend === "stable" ? "→ Stable" : "▼ Drop"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Active Orders */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-foreground">
                      {user.role === "buyer" ? "My Purchases" : "Active Orders"}
                    </span>
                    <span className="text-xs text-primary cursor-pointer hover:underline">View all ↗</span>
                  </div>
                  <div className="space-y-2.5">
                    {recentOrders.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">
                        No active orders.
                      </div>
                    ) : (
                      recentOrders.map((o) => (
                        <div key={o.id} className="grid grid-cols-[28px_1fr_auto] gap-2 items-center px-3 py-2.5 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                          <span className="text-[11px] font-semibold text-muted-foreground">#{o.id}</span>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">
                              {user.role === "buyer" ? o.produce_name : o.buyer_name}
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-0.5 truncate">
                              <MapPinIcon className="size-2.5" /> {o.delivery_location}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-foreground">Ksh {o.total_ksh?.toLocaleString()}</div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              o.status === "confirmed" ? "bg-primary/10 text-primary" :
                              o.status === "pending" ? "bg-amber-500/10 text-amber-400" :
                              "bg-blue-500/10 text-blue-400"
                            }`}>
                              {o.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Logistics */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-foreground">Logistics</span>
                    <span className="text-xs text-primary cursor-pointer hover:underline">Book transport ↗</span>
                  </div>
                  <div className="space-y-2.5">
                    {logistics.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">
                        No active logistics listings.
                      </div>
                    ) : (
                      logistics.map((l, index) => (
                        <div key={index} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:border-primary/30 transition-colors">
                          <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <TruckIcon className="size-4 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">{l.route_from} → {l.route_to}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {l.departure_date} · {l.pooled_count} pooled
                            </div>
                          </div>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                            {l.status}
                          </span>
                        </div>
                      ))
                    )}

                    {/* County Pills */}
                    <div className="pt-2">
                      <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Active counties</div>
                      <div className="flex flex-wrap gap-1.5">
                        {["Nakuru", "Meru", "Kiambu", "Murang'a", "Uasin Gishu"].map((c) => (
                          <span
                            key={c}
                            className={`text-[11px] px-2.5 py-0.5 rounded-full border cursor-pointer transition-colors ${
                              c === (user.county || "Nakuru")
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                            }`}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* ── MODAL: ADD LISTING ── */}
      {showAddListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card border border-border p-6 rounded-xl shadow-2xl relative">
            <button
              onClick={() => setShowAddListing(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <XIcon className="size-5" />
            </button>
            <h3 className="text-lg font-bold uppercase tracking-tight text-foreground mb-4">Add Crop Listing</h3>
            <form onSubmit={handleAddListingSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Crop Name</label>
                <Input
                  placeholder="e.g. Red Onions"
                  value={newListingName}
                  onChange={(e) => setNewListingName(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Quantity (KG)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 150"
                    value={newListingQty}
                    onChange={(e) => setNewListingQty(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Price per KG (Ksh)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 60"
                    value={newListingPrice}
                    onChange={(e) => setNewListingPrice(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Category</label>
                  <select
                    value={newListingCategory}
                    onChange={(e) => setNewListingCategory(e.target.value)}
                    className="w-full h-10 px-3 bg-muted/20 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Vegetables" className="bg-card text-foreground">Vegetables</option>
                    <option value="Fruits" className="bg-card text-foreground">Fruits</option>
                    <option value="Cereals" className="bg-card text-foreground">Cereals</option>
                    <option value="Tubers" className="bg-card text-foreground">Tubers</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Quality Grade</label>
                  <Input
                    placeholder="e.g. Grade A"
                    value={newListingGrade}
                    onChange={(e) => setNewListingGrade(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Description</label>
                <textarea
                  value={newListingDesc}
                  onChange={(e) => setNewListingDesc(e.target.value)}
                  placeholder="Details about harvest quality, packaging..."
                  className="w-full h-20 p-2.5 bg-muted/20 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold uppercase tracking-widest text-xs h-10">
                Publish Listing
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: MPESA WITHDRAW ── */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-card border border-border p-6 rounded-xl shadow-2xl relative">
            <button
              onClick={() => setShowWithdraw(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <XIcon className="size-5" />
            </button>
            <h3 className="text-lg font-bold uppercase tracking-tight text-foreground mb-4">M-PESA Withdrawal</h3>
            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">M-PESA Phone Number</label>
                <Input
                  type="tel"
                  placeholder="e.g. 0712345678"
                  value={withdrawPhone}
                  onChange={(e) => setWithdrawPhone(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Amount (Ksh)</label>
                <Input
                  type="number"
                  placeholder="e.g. 5000"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  required
                />
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  Available wallet balance: Ksh {stats.wallet_balance?.toLocaleString()}
                </span>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold uppercase tracking-widest text-xs h-10">
                Initiate M-PESA Transfer
              </Button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
