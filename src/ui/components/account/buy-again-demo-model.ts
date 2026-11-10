/** Deliberately isolated fixtures for the three buy-again design prototypes. */
export const demoProducts = [
	{
		id: "hoodie",
		name: "Everyday hoodie",
		variant: "Grey / Medium",
		price: 68,
		previousPrice: 64,
		ordered: 1,
		stock: 5,
		image: "/media/products/saleor-grey-hoodie.png",
	},
	{
		id: "shoes",
		name: "Canvas plimsolls",
		variant: "Blue / EU 42",
		price: 48,
		previousPrice: 48,
		ordered: 2,
		stock: 1,
		image: "/media/products/saleor-blue-plimsolls-1.png",
	},
	{
		id: "tee",
		name: "The team tee",
		variant: "White / Medium",
		price: 28,
		previousPrice: 28,
		ordered: 1,
		stock: 0,
		image: "/media/products/saleor-team-tee-front.png",
	},
];

export type DemoCart = Record<string, number>;

export function planReorder(requested: DemoCart, cart: DemoCart, unavailable = false): DemoCart {
	return Object.fromEntries(
		demoProducts
			.map((product) => [
				product.id,
				Math.max(
					0,
					Math.min(
						Math.floor(Number.isFinite(requested[product.id]) ? requested[product.id] : 0),
						unavailable ? 0 : product.stock - (cart[product.id] ?? 0),
					),
				),
			])
			.filter(([, quantity]) => Number(quantity) > 0),
	);
}

export function cartCount(cart: DemoCart) {
	return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
}

export function cartTotal(cart: DemoCart) {
	return demoProducts.reduce((sum, product) => sum + product.price * (cart[product.id] ?? 0), 0);
}
