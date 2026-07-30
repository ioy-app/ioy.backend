import { it, expect } from "vitest";
import getUserLogin from "./getUserLogin";

it("Login 254 chars", async () => await expect(getUserLogin("a".repeat(255))).rejects.toThrow("errors.invalid.id"));
it("Empty login", async () => await expect(getUserLogin("")).rejects.toThrow("errors.invalid.id"));
it("Undefined login", async () => await expect(getUserLogin()).rejects.toThrow("errors.invalid.id"));
it("Spaces login", async () => await expect(getUserLogin(" ".repeat(5))).rejects.toThrow("errors.invalid.id"));
it("Login isn't exists", async () => await expect(getUserLogin(5)).rejects.toThrow("errors.exists"));
it("Login is exists", async () => expect(await getUserLogin(1)).toEqual("wmgcat"));
