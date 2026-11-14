"use client";

import { useState } from "react";
import Image from "next/image";
import {
	ArrowDown,
	ArrowRight,
	Check,
	CheckCircle2,
	ChevronRight,
	Clock3,
	Package,
	RotateCcw,
	ShoppingBag,
	SlidersHorizontal,
	UserRound,
} from "lucide-react";
import { Button } from "@/ui/components/ui/button";
import { Badge } from "@/ui/components/ui/badge";
import {
	Sheet,
	SheetContent,
	SheetTitle,
	SheetDescription,
	SheetCloseButton,
} from "@/ui/components/ui/sheet";
import {
	cartCount,
	cartTotal,
	demoProducts,
	planReorder,
	type DemoCart,
} from "@/ui/components/account/buy-again-demo-model";
import { cn } from "@/lib/utils";

const approaches = [
	{
		name: "Quick repeat",
		subtitle: "One click. Back in your bag.",
		description:
			"The shortest path from a past order to a new one. Available items are added immediately, with a clear summary of what changed.",
		icon: RotateCcw,
	},
	{
		name: "Pick your items",
		subtitle: "A little more choice, right here.",
		description:
			"Expand an order, choose the items you still love, and adjust quantities without leaving your history.",
		icon: SlidersHorizontal,
	},
	{
		name: "Review & repeat",
		subtitle: "Everything checked before you add.",
		description:
			"A focused review drawer makes stock limits and price changes explicit before anything goes into your bag.",
		icon: ShoppingBag,
	},
];
const money = (amount: number) => `$${amount.toFixed(2)}`;
const originalQuantities = Object.fromEntries(demoProducts.map((p) => [p.id, p.ordered]));

export function BuyAgainDemo() {
	const [approach, setApproach] = useState(0);
	const [expanded, setExpanded] = useState(false);
	const [drawer, setDrawer] = useState<"review" | "cart" | null>(null);
	const [cart, setCart] = useState<DemoCart>({});
	const [selection, setSelection] = useState<DemoCart>(originalQuantities);
	const [lastAdded, setLastAdded] = useState<DemoCart | null>(null);
	const [unavailable, setUnavailable] = useState(false);
	const [errorNext, setErrorNext] = useState(false);
	const [error, setError] = useState("");
	const current = approaches[approach];
	const planned = planReorder(selection, cart, unavailable);
	const quickPlan = planReorder(originalQuantities, cart, unavailable);
	const count = cartCount(cart);
	const selectedCount = cartCount(planned);
	const addedCount = lastAdded ? cartCount(lastAdded) : 0;

	function reset(nextApproach = approach) {
		setApproach(nextApproach);
		setExpanded(false);
		setDrawer(null);
		setCart({});
		setSelection(originalQuantities);
		setLastAdded(null);
		setError("");
		setErrorNext(false);
		setUnavailable(false);
	}

	function add(requested: DemoCart) {
		if (errorNext) {
			setError("We couldn’t update your bag. Nothing was added. Please try again.");
			setErrorNext(false);
			return;
		}
		const additions = planReorder(requested, cart, unavailable);
		if (!cartCount(additions)) return;
		setCart((previous) => {
			const next = { ...previous };
			for (const [id, quantity] of Object.entries(additions)) next[id] = (next[id] ?? 0) + quantity;
			return next;
		});
		setLastAdded(additions);
		setError("");
		setExpanded(false);
		setDrawer(null);
	}

	function undo() {
		if (!lastAdded) return;
		setCart((previous) =>
			Object.fromEntries(
				Object.entries(previous).map(([id, quantity]) => [id, quantity - (lastAdded[id] ?? 0)]),
			),
		);
		setLastAdded(null);
	}

	const itemPicker = (
		<div className="divide-y divide-border">
			{demoProducts.map((product) => {
				const remaining = unavailable ? 0 : Math.max(0, product.stock - (cart[product.id] ?? 0));
				const quantity = planned[product.id] ?? 0;
				return (
					<div key={product.id} className={cn("flex items-center gap-4 py-5", !remaining && "opacity-60")}>
						<label className="flex min-h-11 items-center">
							<input
								aria-label={`Select ${product.name}`}
								type="checkbox"
								disabled={!remaining}
								checked={quantity > 0}
								onChange={(event) =>
									setSelection((prev) => ({
										...prev,
										[product.id]: event.target.checked ? Math.min(product.ordered, remaining) : 0,
									}))
								}
								className="h-5 w-5 rounded border-input accent-primary focus-visible:ring-2 focus-visible:ring-ring"
							/>
						</label>
						<Image
							src={product.image}
							alt={product.name}
							width={72}
							height={80}
							unoptimized
							className="h-20 w-16 rounded-card bg-secondary object-contain"
						/>
						<div className="min-w-0 flex-1">
							<p className="text-sm font-semibold">{product.name}</p>
							<p className="mt-1 text-xs text-muted-foreground">{product.variant}</p>
							<p className="mt-2 text-xs">
								{!remaining
									? product.stock
										? "No more available"
										: "Out of stock · not added"
									: product.stock < product.ordered
										? "Only 1 available · ordered 2"
										: "In stock"}
							</p>
							{product.price !== product.previousPrice && (
								<p className="mt-1 text-xs text-muted-foreground">
									Was {money(product.previousPrice)} · now {money(product.price)}
								</p>
							)}
						</div>
						<div className="shrink-0 text-right">
							<p className="mb-2 text-sm font-medium">{money(product.price)}</p>
							{remaining > 0 && (
								<select
									aria-label={`Quantity for ${product.name}`}
									value={quantity}
									onChange={(event) =>
										setSelection((prev) => ({ ...prev, [product.id]: Number(event.target.value) }))
									}
									className="min-h-11 rounded-button border border-input bg-background px-2 text-sm focus-visible:ring-2 focus-visible:ring-ring"
								>
									{Array.from({ length: remaining + 1 }, (_, index) => (
										<option key={index} value={index}>
											{index}
										</option>
									))}
								</select>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);

	return (
		<div className="min-h-screen bg-background text-foreground">
			<div className="border-b bg-foreground text-inverse">
				<div className="container-content flex flex-wrap items-center justify-between gap-3 py-3 text-xs">
					<p className="flex items-center gap-2">
						<span className="border-border-inverse rounded-full border px-2 py-1 uppercase tracking-widest">
							Design lab
						</span>{" "}
						Buy again / 3 interactive approaches
					</p>
					<span className="text-inverse-subtle">Sample orders · demo bag only · no purchases</span>
				</div>
			</div>
			<header className="border-b">
				<div className="container-content flex items-center justify-between py-6">
					<div className="flex items-baseline gap-3">
						<span className="text-h3 font-semibold tracking-tight">SALEOR</span>
						<span className="hidden text-xs text-muted-foreground sm:block">THE EVERYDAY COLLECTION</span>
					</div>
					<Button variant="ghost" className="min-h-11" onClick={() => setDrawer("cart")}>
						<ShoppingBag size={18} /> Demo bag{" "}
						<span className="rounded-full bg-secondary px-2 py-1 text-xs">{count}</span>
					</Button>
				</div>
			</header>
			<div className="container-content py-8">
				<div className="grid gap-3 md:grid-cols-3" aria-label="Choose a design approach">
					{approaches.map((option, index) => (
						<button
							key={option.name}
							type="button"
							onClick={() => reset(index)}
							aria-pressed={approach === index}
							className={cn(
								"flex items-center gap-4 rounded-card border p-4 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
								approach === index ? "border-primary bg-secondary" : "border-border",
							)}
						>
							<span
								className={cn(
									"flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm",
									approach === index
										? "bg-primary text-primary-foreground"
										: "bg-muted text-muted-foreground",
								)}
							>
								0{index + 1}
							</span>
							<span className="flex-1">
								<span className="block text-sm font-semibold">{option.name}</span>
								<span className="mt-1 block text-xs text-muted-foreground">{option.subtitle}</span>
							</span>
							{approach === index && <Check size={16} />}
						</button>
					))}
				</div>
				<div className="mt-10 grid gap-10 lg:grid-cols-[200px_1fr]">
					<aside className="hidden lg:block">
						<div className="mb-8 flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
								<UserRound size={18} />
							</div>
							<div>
								<p className="text-sm font-semibold">Alex Morgan</p>
								<p className="text-xs text-muted-foreground">Your account</p>
							</div>
						</div>
						<p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Account</p>
						<div className="flex items-center justify-between rounded-button bg-secondary px-4 py-3 text-sm font-semibold">
							<span>Order history</span>
							<ChevronRight size={16} />
						</div>
						<div className="mt-10 border-t pt-5 text-xs leading-relaxed text-muted-foreground">
							<p className="font-semibold text-foreground">Made for the second time.</p>
							<p className="mt-2">Your favorites, without starting from scratch.</p>
						</div>
					</aside>
					<main>
						<div className="mb-8 flex flex-wrap items-end justify-between gap-4">
							<div>
								<p className="mb-2 text-eyebrow uppercase tracking-widest text-muted-foreground">
									Your account / Orders
								</p>
								<h1 className="text-h1">Good things, again.</h1>
								<p className="mt-3 text-sm text-muted-foreground">
									Track your orders. Rediscover your favorites.
								</p>
							</div>
							<span className="text-sm text-muted-foreground">2 orders</span>
						</div>
						<div className="mb-6 flex items-start gap-3 rounded-card bg-secondary p-4">
							<current.icon size={20} className="mt-0.5 shrink-0" />
							<div>
								<h2 className="text-sm font-semibold">{current.name}</h2>
								<p className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground">
									{current.description}
								</p>
							</div>
						</div>
						{lastAdded && (
							<div role="status" className="mb-5 rounded-card border border-border bg-card p-5">
								<div className="flex flex-wrap items-center gap-3">
									<CheckCircle2 className="h-5 w-5 text-success" />
									<p className="flex-1 text-sm font-semibold">
										{addedCount} {addedCount === 1 ? "item" : "items"} added to your demo bag
									</p>
									<Button variant="ghost" onClick={undo}>
										Undo
									</Button>
									<Button variant="secondary" onClick={() => setDrawer("cart")}>
										View bag <ArrowRight size={16} />
									</Button>
								</div>
								<p className="mt-2 text-xs text-muted-foreground">
									Team tee skipped. Stock limits applied. Current prices used.
								</p>
							</div>
						)}
						{error && (
							<p
								role="alert"
								className="mb-4 rounded-card border border-destructive p-4 text-sm text-destructive"
							>
								{error}
							</p>
						)}
						<article className="overflow-hidden rounded-card border bg-card">
							<div className="flex flex-wrap items-center justify-between gap-4 border-b px-6 py-5">
								<div>
									<h2 className="text-sm font-semibold">Order № 1048</h2>
									<p className="mt-1 text-xs text-muted-foreground">October 24, 2026 · 4 items · $188.00</p>
								</div>
								<Badge variant="secondary" className="gap-1.5">
									<Check size={12} /> Delivered
								</Badge>
							</div>
							<div className="p-6">
								<div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
									<div className="flex gap-3">
										{demoProducts.map((p) => (
											<div key={p.id} className="relative">
												<Image
													src={p.image}
													alt={p.name}
													width={96}
													height={112}
													unoptimized
													className={cn(
														"h-28 w-24 rounded-card bg-secondary object-contain",
														!p.stock && "opacity-40",
													)}
												/>
												{p.ordered > 1 && (
													<span className="absolute bottom-1 right-1 rounded-full border bg-card px-2 py-0.5 text-xs">
														×{p.ordered}
													</span>
												)}
											</div>
										))}
									</div>
									<div className="sm:text-right">
										<Button
											className="min-h-11 w-full sm:w-auto"
											disabled={!cartCount(quickPlan)}
											onClick={() => {
												setLastAdded(null);
												setError("");
												if (approach === 0) add(originalQuantities);
												else if (approach === 1) setExpanded(!expanded);
												else setDrawer("review");
											}}
										>
											<RotateCcw size={16} />
											{!cartCount(quickPlan)
												? "No items available"
												: approach === 1 && expanded
													? "Close selection"
													: "Buy again"}
											{approach === 1 && <ArrowDown size={14} />}
										</Button>
										<p className="mt-2 text-xs text-muted-foreground">
											{!cartCount(quickPlan)
												? "Try another order"
												: `${cartCount(quickPlan)} of 4 items available`}
										</p>
									</div>
								</div>
								<div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
									<p>Everyday hoodie, Canvas plimsolls & The team tee</p>
									<span>Delivered October 28</span>
								</div>
								{!expanded && (
									<div className="mt-5 border-t pt-4 text-xs leading-relaxed text-muted-foreground">
										{unavailable
											? "These items are currently unavailable. Nothing will be added."
											: "Team tee is out of stock. Only 1 pair of plimsolls available. Hoodie is now $68 (was $64)."}
									</div>
								)}
								{expanded && (
									<section aria-label="Choose items to reorder" className="mt-6 border-t pt-5">
										<div className="flex items-center justify-between">
											<h3 className="text-base font-semibold">Choose what comes back</h3>
											<span className="text-xs text-muted-foreground">Current prices</span>
										</div>
										{itemPicker}
										<div className="flex flex-wrap items-center justify-between gap-4 border-t pt-5">
											<div>
												<p className="font-semibold">{money(cartTotal(planned))}</p>
												<p className="text-xs text-muted-foreground">
													{selectedCount} items selected · before shipping & tax
												</p>
											</div>
											<Button className="min-h-11" disabled={!selectedCount} onClick={() => add(selection)}>
												Add selected to bag <ArrowRight size={16} />
											</Button>
										</div>
									</section>
								)}
							</div>
						</article>
						<article className="mt-4 flex flex-wrap items-center gap-4 rounded-card border px-6 py-5">
							<div className="flex h-12 w-12 items-center justify-center rounded-card bg-secondary">
								<Package size={22} />
							</div>
							<div className="flex-1">
								<h2 className="text-sm font-semibold">Order № 0982</h2>
								<p className="mt-1 text-xs text-muted-foreground">September 12, 2026 · 1 item · $32.00</p>
							</div>
							<div className="text-right">
								<Button variant="secondary" disabled className="min-h-11">
									No items available
								</Button>
								<p className="mt-1 text-xs text-muted-foreground">This item is no longer sold</p>
							</div>
						</article>
						<div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
							<Clock3 size={14} /> Reordering uses today’s prices and availability. Your original orders stay
							unchanged.
						</div>
						<details className="mt-8 border-t pt-5 text-xs text-muted-foreground">
							<summary className="cursor-pointer py-3 font-medium text-foreground">
								Prototype controls
							</summary>
							<div className="flex flex-wrap items-center gap-4 py-3">
								<label className="flex min-h-11 items-center gap-2">
									<input
										type="checkbox"
										checked={unavailable}
										onChange={(e) => {
											setUnavailable(e.target.checked);
											setLastAdded(null);
										}}
									/>{" "}
									All items unavailable
								</label>
								<label className="flex min-h-11 items-center gap-2">
									<input
										type="checkbox"
										checked={errorNext}
										onChange={(e) => setErrorNext(e.target.checked)}
									/>{" "}
									Fail next add
								</label>
								<Button variant="ghost" onClick={() => reset()}>
									Reset demo
								</Button>
							</div>
							<p>
								Each approach starts with an empty demo bag. State resets on refresh. No Saleor checkout is
								created.
							</p>
						</details>
					</main>
				</div>
			</div>
			<Sheet
				open={drawer !== null}
				onOpenChange={(open) => {
					if (!open) setDrawer(null);
				}}
			>
				<SheetContent className="flex h-full flex-col overflow-y-auto p-6 sm:max-w-lg">
					<div className="flex items-center justify-between">
						<span className="text-eyebrow uppercase tracking-widest text-muted-foreground">
							{drawer === "review" ? "One more look" : "Ready when you are"}
						</span>
						<SheetCloseButton />
					</div>
					<SheetTitle className="mt-4 text-h2">
						{drawer === "review" ? "Your favorites, again." : `Your demo bag (${count})`}
					</SheetTitle>
					<SheetDescription>
						{drawer === "review"
							? "Order № 1048 · Review what’s available today."
							: "Prototype only. No payment or checkout will be created."}
					</SheetDescription>
					{drawer === "review" ? (
						<>
							<div className="mt-5 rounded-card bg-secondary p-4 text-sm leading-relaxed">
								<p className="font-semibold">A couple of things have changed</p>
								<p className="mt-1 text-muted-foreground">
									One item is out of stock, plimsolls are limited to 1, and the hoodie is $4 more.
								</p>
							</div>
							{itemPicker}
							{error && (
								<p role="alert" className="text-sm text-destructive">
									{error}
								</p>
							)}
							<div className="mt-auto border-t pt-5">
								<div className="mb-1 flex justify-between text-base font-semibold">
									<span>Subtotal · {selectedCount} items</span>
									<span>{money(cartTotal(planned))}</span>
								</div>
								<p className="mb-5 text-xs text-muted-foreground">Shipping & tax calculated at checkout.</p>
								<Button className="min-h-11 w-full" disabled={!selectedCount} onClick={() => add(selection)}>
									Add {selectedCount} items to bag <ArrowRight size={16} />
								</Button>
								<p className="mt-3 text-center text-xs text-muted-foreground">Nothing is purchased yet.</p>
							</div>
						</>
					) : (
						<>
							{!count && (
								<p className="py-12 text-center text-muted-foreground">
									Your demo bag is empty. Try Buy again.
								</p>
							)}
							{demoProducts
								.filter((p) => cart[p.id] > 0)
								.map((p) => (
									<div key={p.id} className="flex items-center gap-4 border-b py-5">
										<Image
											src={p.image}
											alt={p.name}
											width={72}
											height={80}
											unoptimized
											className="h-20 w-16 rounded-card bg-secondary object-contain"
										/>
										<div className="flex-1">
											<p className="text-sm font-semibold">{p.name}</p>
											<p className="mt-1 text-xs text-muted-foreground">
												{p.variant} · Qty {cart[p.id]}
											</p>
											<Button
												variant="ghost"
												className="mt-1 min-h-11 px-0 text-xs"
												onClick={() => {
													setCart((prev) => ({ ...prev, [p.id]: 0 }));
													setLastAdded(null);
												}}
											>
												Remove {p.name}
											</Button>
										</div>
										<span className="text-sm">{money(p.price * cart[p.id])}</span>
									</div>
								))}
							<div className="mt-auto border-t pt-5">
								<div className="flex justify-between font-semibold">
									<span>Subtotal</span>
									<span>{money(cartTotal(cart))}</span>
								</div>
								<Button className="mt-5 min-h-11 w-full" variant="secondary" onClick={() => setDrawer(null)}>
									Back to order history
								</Button>
							</div>
						</>
					)}
				</SheetContent>
			</Sheet>
		</div>
	);
}
