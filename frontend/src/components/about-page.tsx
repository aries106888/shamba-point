import { ShieldCheckIcon, SparklesIcon, TrendingUpIcon } from "lucide-react";

export function AboutPage() {
	return (
		<div className="flex flex-col gap-16 py-12 md:py-20 max-w-7xl mx-auto px-4 md:px-8">
			{/* Hero typography */}
			<div className="flex flex-col gap-6 max-w-4xl">
				<div className="inline-flex items-center gap-2 text-primary font-mono text-sm tracking-wider uppercase">
					<SparklesIcon className="size-4 animate-pulse" /> Our Purpose
				</div>
				<h1 className="text-5xl md:text-7xl font-black tracking-tight uppercase leading-none">
					Always Bringing <br />
					<span className="text-primary glow-text">The Harvest</span> First.
				</h1>
				<p className="text-lg md:text-xl text-muted-foreground leading-relaxed mt-4">
					We build digital bridges for Kenyan smallholder farmers, connecting them directly with regional buyers, logistics providers, and real-time yield intelligence.
				</p>
			</div>

			{/* Large image row */}
			<div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl border border-border">
				<img 
					src="/smart.png" 
					alt="Kenyan Smart Farming" 
					className="object-cover w-full h-full grayscale brightness-75 hover:grayscale-0 transition-all duration-700 ease-in-out"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
				<div className="absolute bottom-6 left-6 md:left-12 flex flex-col gap-1">
					<div className="font-mono text-xs text-primary uppercase">Empowering local communities</div>
					<div className="text-lg font-bold">Smart Agricultural Tracking & Yield Intelligence</div>
				</div>
			</div>

			{/* Core pillars */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				<div className="flex flex-col gap-4 p-6 rounded-xl border border-border bg-card/50 backdrop-blur-md skew-card">
					<div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
						<TrendingUpIcon className="size-6" />
					</div>
					<h3 className="text-xl font-bold uppercase tracking-tight text-primary">Direct Market Linkages</h3>
					<p className="text-muted-foreground text-sm leading-loose">
						Cutting out exploitative middlemen by offering small-scale farmers direct access to hotel chains, supermarkets, and international buyers.
					</p>
				</div>

				<div className="flex flex-col gap-4 p-6 rounded-xl border border-border bg-card/50 backdrop-blur-md skew-card">
					<div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
						<ShieldCheckIcon className="size-6" />
					</div>
					<h3 className="text-xl font-bold uppercase tracking-tight text-primary">Financial Freedom</h3>
					<p className="text-muted-foreground text-sm leading-loose">
						Integrated with M-PESA Daraja APIs for instant, secure cash payments upon delivery. Say goodbye to delayed payouts and financial stress.
					</p>
				</div>

				<div className="flex flex-col gap-4 p-6 rounded-xl border border-border bg-card/50 backdrop-blur-md skew-card">
					<div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
						<SparklesIcon className="size-6" />
					</div>
					<h3 className="text-xl font-bold uppercase tracking-tight text-primary">Agri-Data Intelligence</h3>
					<p className="text-muted-foreground text-sm leading-loose">
						Real-time dashboard tracking local weather patterns, market pricing trends, and logistical status for optimal farming operations.
					</p>
				</div>
			</div>

			{/* Big numbers block */}
			<div className="border border-border rounded-2xl bg-card/30 p-8 md:p-12 backdrop-blur-sm grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
				<div className="flex flex-col gap-2">
					<span className="text-5xl font-black text-primary glow-text">12,000+</span>
					<span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Active Farmers</span>
				</div>
				<div className="flex flex-col gap-2 border-y md:border-y-0 md:border-x border-border py-6 md:py-0 md:px-8">
					<span className="text-5xl font-black text-primary glow-text">KES 84M+</span>
					<span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Processed via M-PESA</span>
				</div>
				<div className="flex flex-col gap-2 md:pl-8">
					<span className="text-5xl font-black text-primary glow-text">98%</span>
					<span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Market Access Rate</span>
				</div>
			</div>
		</div>
	);
}
