import { it, expect } from "vitest";
import getUserId from "./getUserId";

it("Login 254 chars", async () => await expect(getUserId("a".repeat(255))).rejects.toThrow("errors.invalid.login"));
it("Empty login", async () => await expect(getUserId("")).rejects.toThrow("errors.invalid.login"));
it("Undefined login", async () => await expect(getUserId()).rejects.toThrow("errors.invalid.login"));
it("Spaces login", async () => await expect(getUserId(" ".repeat(5))).rejects.toThrow("errors.invalid.login"));
it("Login is number", async () => await expect(getUserId(5)).rejects.toThrow("errors.invalid.login"));
it("Login is exists", async () => expect(await getUserId("wmgcat")).toEqual(1));
it("Login is exists, but have spaces", async () => expect(await getUserId("   wmgcat  ")).toEqual(1));
it("Login isn't exists", async () => await expect(getUserId("wmgcat2")).rejects.toThrow("errors.exists"));
