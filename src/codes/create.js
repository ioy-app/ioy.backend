import { DB } from "../../index.js";
import { generate } from "./index.js";

const CODE_LENGTH = process.env.CODE_LENGTH || 6;

export default async function Create(uid, payload) {
    if (!DB.connected)
        return false;

    while(true) {
        const code = generate(CODE_LENGTH);
        const result = await DB.query(`
            INSERT INTO "codes" (
                code,
                payload,
                uid
            )
            SELECT $1, $2, $3
            WHERE NOT EXISTS (
                SELECT 1 FROM "codes"
                WHERE code=$1
            )
            RETURNING id, uid, code;
        `, [ code, payload, uid ]);

        if (result?.rows?.length)
            return result?.rows?.at(0);
    }
}