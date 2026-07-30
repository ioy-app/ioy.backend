import { expect, it, vi } from "vitest";
import getUser from "./getUser";
import deleteUser from "./deleteUser";

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
			if (sql?.includes?.("DELETE")) {
				const index = users.findIndex((user) => (user?.id == params?.[0] || user?.login == params?.[0]));
				if (~index)
					users.splice(index, 1);

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

it("Delete exists user", async () => {
	let user = await getUser("wmgcat");
	expect(user).toHaveProperty("active", true);
	expect(user).toHaveProperty("id", 1);
	const result = await deleteUser("wmgcat");
	expect(result).toEqual(true);
	expect(getUser("wmgcat")).rejects.toThrow("errors.exists");
});
it("Delete no exists user", async () => expect(deleteUser("wmgcat2")).rejects.toThrow("errors.exists"));
