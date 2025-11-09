import db from "@lib/db";
import { generate } from "./index.js";

const CODE_LENGTH = process.env.CODE_LENGTH || 6;

export default async function Create(uid, payload) {
    while(true) {
        const code = generate(CODE_LENGTH);
        const result = await db.query(`
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