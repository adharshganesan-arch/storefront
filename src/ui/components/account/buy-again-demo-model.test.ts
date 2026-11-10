import { describe, expect, it } from "vitest";
import { cartCount, cartTotal, planReorder } from "@/ui/components/account/buy-again-demo-model";

describe("buy-again prototype cart", () => {
	it("skips unavailable items and caps limited stock", () => {
		const result = planReorder({ hoodie: 1, shoes: 2, tee: 1 }, {});
		expect(result).toEqual({ hoodie: 1, shoes: 1 });
		expect(cartCount(result)).toBe(2);
		expect(cartTotal(result)).toBe(116);
	});
	it("accounts for existing bag quantities without replacing them", () => {
		expect(planReorder({ hoodie: 2, shoes: 1 }, { hoodie: 4, shoes: 1 })).toEqual({ hoodie: 1 });
	});
	it("returns no additions when everything is unavailable", () => {
		expect(planReorder({ hoodie: 1, shoes: 2 }, {}, true)).toEqual({});
	});
	it("ignores unknown, nonfinite and negative quantities", () => {
		expect(planReorder({ hoodie: -1, shoes: NaN, unknown: 5 }, {})).toEqual({});
	});
	it("respects deselection and integer quantities", () => {
		expect(planReorder({ hoodie: 2.9, shoes: 0 }, {})).toEqual({ hoodie: 2 });
	});
});
