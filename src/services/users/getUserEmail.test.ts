import { it, expect, describe } from "vitest";
import getUserEmail, { getUserIdEmail } from "./getUserEmail";

describe("getUserEmail", () => {
	it("Login 254 chars", async () => await expect(getUserEmail("a".repeat(255))).rejects.toThrow("errors.invalid.login"));
	it("Empty login", async () => await expect(getUserEmail("")).rejects.toThrow("errors.invalid.login"));
	it("Undefined login", async () => await expect(getUserEmail()).rejects.toThrow("errors.invalid.login"));
	it("Spaces login", async () => await expect(getUserEmail(" ".repeat(5))).rejects.toThrow("errors.invalid.login"));
	it("Login is number", async () => await expect(getUserEmail(5)).rejects.toThrow("errors.invalid.login"));
	it("Login is exists", async () => expect(await getUserEmail("wmgcat")).toEqual("developer@wmgcat.net"));
	it("Login is exists, but have spaces", async () => expect(await getUserEmail("   wmgcat  ")).toEqual("developer@wmgcat.net"));
	it("Login isn't exists", async () => await expect(getUserEmail("wmgcat2")).rejects.toThrow("errors.exists"));
});

describe("getUserIdEmail", () => {
	it("Login 254 chars", async () => await expect(getUserIdEmail("a".repeat(255))).rejects.toThrow("errors.invalid.id"));
	it("Empty login", async () => await expect(getUserIdEmail("")).rejects.toThrow("errors.invalid.id"));
	it("Undefined login", async () => await expect(getUserIdEmail()).rejects.toThrow("errors.invalid.id"));
	it("Spaces login", async () => await expect(getUserIdEmail(" ".repeat(5))).rejects.toThrow("errors.invalid.id"));
	it("Login isn't exists", async () => await expect(getUserIdEmail(5)).rejects.toThrow("errors.exists"));
	it("Login is exists", async () => expect(await getUserIdEmail(1)).toEqual("developer@wmgcat.net"));
});
