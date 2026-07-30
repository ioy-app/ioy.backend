import { it, expect, describe } from "vitest";
import getUserInstances, { getUserIdInstances } from "./getUserInstances";

describe("getUserInstances", () => {
	it("Without arguments", async () => await expect(getUserInstances()).rejects.toThrow("errors.invalid.login"));
	it("With exists login", async () => {
		const result = await getUserInstances("wmgcat");

		expect(result).toHaveLength(2);
		const [ items, total ] = result;

		expect(items?.[0]).toHaveProperty("id");
		expect(items?.[0]).toHaveProperty("type");
		expect(total).toBeTypeOf("number");
	});
	it("With no exists login", async () => await expect(getUserInstances("wmgcat2")).rejects.toThrow("errors.exists"));
	it("Negative offset", async () => await expect(getUserInstances("autotest", -5)).rejects.toThrow("errors.invalid.offset"));
	it("Negative limit", async () => await expect(getUserInstances("autotest", 0, -5)).rejects.toThrow("errors.invalid.limit")); 
	it("Limit equal zero", async () => await expect(getUserInstances("autotest", 0, 0)).rejects.toThrow("errors.invalid.limit"));
	it("Limit more 50 (Max)", async () => await expect(getUserInstances("autotest", 0, 51)).rejects.toThrow("errors.invalid.limit"));
	it("No exists table on include", async () => await expect(getUserInstances("autotest", 0, 1, [ "test" ])).rejects.toThrow("errors.invalid.include"));
	it("Exist table on include (1 table)", async () => {
		const result = await getUserInstances("wmgcat", 0, 1, [ "pictures" ]);

		expect(result).toHaveLength(2);
		const [ items, total ] = result;

		expect(items?.[0]).toHaveProperty("id");
		expect(items?.[0]).toHaveProperty("type", "picture");
		expect(total).toBeTypeOf("number");
		expect(items).toHaveLength(1);
	});
});

describe("getUserIdInstances", () => {
	it("Login 254 chars", async () => await expect(getUserIdInstances("a".repeat(255))).rejects.toThrow("errors.invalid.id"));
	it("Empty login", async () => await expect(getUserIdInstances("")).rejects.toThrow("errors.invalid.id"));
	it("Undefined login", async () => await expect(getUserIdInstances()).rejects.toThrow("errors.invalid.id"));
	it("Spaces login", async () => await expect(getUserIdInstances(" ".repeat(5))).rejects.toThrow("errors.invalid.id"));
	it("Login isn't exists", async () => await expect(getUserIdInstances(5)).rejects.toThrow("errors.exists"));
	it("Login is exists", async () => expect(await getUserIdInstances(1)).toHaveLength(2));
});
