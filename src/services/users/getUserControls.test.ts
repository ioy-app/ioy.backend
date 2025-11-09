import { expect } from "chai";
import esmock from "esmock";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const libDbPath = join(__dirname, "..", "..", "lib", "db.js");

import { mockDbSubscribers } from "./index.test";

describe("getUserControls", () => {
    const getUserControls = async (source_id: any, target_id: any) => {
        const { default: getUserControls } = await esmock("./getUserControls.ts", {
            [libDbPath]: mockDbSubscribers
        });

        return getUserControls(source_id, target_id);
    }

    it("Введены верные значения", async () => {
        const result = await getUserControls(1, 2);
        await expect(result).to.deep.equal({
            is_subscribe: true,
            is_me: false
        });
    });
    
    it("source_id строка", async () => {
        try { await getUserControls("a", 2); }
        catch(err) {
            await expect(err.message).to.equal("ID должен быть числом");
        }
    });
    
    it("target_id строка", async () => {
        try { await getUserControls(1, "a"); }
        catch(err) {
            await expect(err.message).to.equal("ID должен быть числом");
        }
    });

    it("source_id пустой", async () => {
        try { await getUserControls(undefined, 2); }
        catch(err) {
            await expect(err.message).to.equal("ID должен быть числом");
        }
    });

    it("source_id и target_id пустые", async () => {
        try { await getUserControls(undefined, undefined); }
        catch(err) {
            await expect(err.message).to.equal("ID должен быть числом");
        }
    });

    it("source_id < 0", async () => {
        try { await getUserControls(-10, 2); }
        catch(err) {
            await expect(err.message).to.equal("ID не может быть меньше 0");
        }
    });

    it("target_id < 0", async () => {
        try { await getUserControls(1, -5); }
        catch(err) {
            await expect(err.message).to.equal("ID не может быть меньше 0");
        }
    });
});