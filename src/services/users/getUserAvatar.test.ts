import { expect } from "chai";
import esmock from "esmock";
import fs from "fs";

describe("getUserAvatar", () => {
    const getUserAvatar = async (login: string) => {
        const { default: getUserAvatar } = await esmock("./getUserAvatar.ts");

        return getUserAvatar(login);
    }

    it("Файл существует", async () => {
        const result = await getUserAvatar("wmgcat");
        expect(result).to.be.instanceof(fs.ReadStream);
    });

    it("Файл отсутствует", async () => {
        try { await getUserAvatar("wmgcat2"); }
        catch(err) {
            await expect(err.message).to.equal("Файл не найден");
        }
    });

    it("Логин больше 50", async () => {
        try { await getUserAvatar("a".repeat(51)); }
        catch(err) {
            await expect(err.message).to.equal("Не может превышать 50 символов");
        }
    })
    it("Логин меньше 3", async () => {
        try { await getUserAvatar("a"); }
        catch(err) {
            await expect(err.message).to.equal("Не может быть < 3 символов");
        }
    })
    it("Пустой логин", async () => {
        try { await getUserAvatar(""); }
        catch(err) {
            await expect(err.message).to.equal("Не может быть < 3 символов");
        }
    });
    it("Логин состояит из SQL-инъекции", async () => {
        try { await getUserAvatar("'; DROP TABLE users; --"); }
        catch(err) {
            await expect(err.message).to.equal("Не верный формат строки");
        }
    });
});