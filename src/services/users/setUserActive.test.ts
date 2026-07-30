import { it, vi } from "vitest";
import setUserActive from "./setUserActive";
import getUser from "./getUser";

const users = [
	{
		id: 1,
		login: "wmgcat",
		active: true
	},
	{
		id: 2,
		login: "tester",
		active: false
	}
];

vi.mock("@/lib/db", () => ({
	default: {
		query: vi.fn(async (sql: string, params: any[]) => {
			if (sql?.includes?.("UPDATE")) {
				const find = users.find((user) => (user?.id == params?.[0] || user?.login == params?.[0]));
				if (find)
					find.active = true;
				return {
					rows: [ 1 ],
					rowCount: 1
				};
			}

			if (sql?.includes?.("SELECT")) {
				const rows = users.filter((user) => (user?.id == params?.[0] || user?.login == params?.[0]));
				return {
					rows,
					rowCount: rows?.length
				}
			}
		})
	}
}));

it("Active activated user", async () => {
	const result = await setUserActive("wmgcat");
	expect(result).toEqual(true);
	const user = await getUser("wmgcat");
	expect(user).toHaveProperty("id", 1);
	expect(user).toHaveProperty("active", true);
});
it ("Active nonactive user", async () => {
	let user = await getUser("tester");
	expect(user).toHaveProperty("id", 2);
	expect(user).toHaveProperty("active", false);
	const result = await setUserActive("tester");
	expect(result).toEqual(true);
	user = await getUser("tester");
	expect(user).toHaveProperty("active", true);
});
it("Active no exists user", async () => await expect(setUserActive("mr_test")).rejects.toThrow("errors.exists"));
