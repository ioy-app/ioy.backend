import { expect } from "chai";
import esmock from "esmock";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const libDbPath = join(__dirname, "..", "..", "lib", "db.js");

import { mockUsers, mockDb } from "./index.test";

describe("getUser", () => {
    const getUser = async (login: string) => {
        const { default: getUser } = await esmock("./getUser.ts", {
            [libDbPath]: mockDb
        });

        return getUser(login);
    }

    it("Пользователь найден", async () => {
        const result = await getUser("tester");
        await expect(result).to.deep.equal(mockUsers[0]);
    })

    it("Пользователя не существует", async () => {
        try { await getUser("tester2"); }
        catch(err) {
            await expect(err.message).to.equal("Пользователь не найден");
        }
    });

    it("Пользователь без активации", async () => {
        try { await getUser("noactive"); }
        catch(err) {
            await expect(err.message).to.equal("Пользователь не найден");
        }
    });

    it("Логин больше 50", async () => {
        try { await getUser("a".repeat(51)); }
        catch(err) {
            await expect(err.message).to.equal("Не может превышать 50 символов");
        }
    })
    it("Логин меньше 3", async () => {
        try { await getUser("a"); }
        catch(err) {
            await expect(err.message).to.equal("Не может быть < 3 символов");
        }
    })
    it("Пустой логин", async () => {
        try { await getUser(""); }
        catch(err) {
            await expect(err.message).to.equal("Не может быть < 3 символов");
        }
    });
    it("Логин состояит из SQL-инъекции", async () => {
        try { await getUser("'; DROP TABLE users; --"); }
        catch(err) {
            await expect(err.message).to.equal("Не верный формат строки");
        }
    });
});