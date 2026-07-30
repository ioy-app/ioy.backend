import { it, expect } from "vitest";
import getUser from "./getUser";

it("Login 254 chars", async () => await expect(getUser("a".repeat(255))).rejects.toThrow("errors.invalid.login"));
it("Empty login", async () => await expect(getUser("")).rejects.toThrow("errors.invalid.login"));
it("Undefined login", async () => await expect(getUser()).rejects.toThrow("errors.invalid.login"));
it("Spaces login", async () => await expect(getUser(" ".repeat(5))).rejects.toThrow("errors.invalid.login"));
it("Login is number", async () => await expect(getUser(5)).rejects.toThrow("errors.invalid.login"));
it("Login is exists", async () => expect(await getUser("wmgcat")).toHaveProperty("login", "wmgcat"));
it("Login is exists, but have spaces", async () => expect(await getUser("   wmgcat  ")).toHaveProperty("login", "wmgcat"));
it("Login isn't exists", async () => await expect(getUser("wmgcat2")).rejects.toThrow("errors.exists"));
