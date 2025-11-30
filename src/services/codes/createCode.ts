import db from "@/lib/db";
import redis from "@/lib/redis";
import Code from "@/types/code";
import genCode from "@/utils/genCode";

/**
 * Создание проверочного кода
 * 
 * @param {number} user_id ID Пользователя
 * @param {Record<string, any>} payload Данные 
 * @returns {Promise<Code>}
*/
const createCode = async (user_id: number, payload: Record<string, any>): Promise<Code> => {
    let created: Code;
    do {
        const code = genCode();
        const result = await db.query(`
            INSERT INTO "codes" (
                uid,
                code,
                payload
            ) SELECT $1, $2, $3
            WHERE NOT EXISTS (
                SELECT 1 FROM "codes"
                WHERE code=$2
            )
            RETURNING id, code, date_created, payload
        `, [ user_id, code, payload ]);

        if (result.rowCount !== 0)
            created = result?.rows?.[0];
    } while (!created);

    redis.writeWithLog(`code:${created.code}`, JSON.stringify(created));
    return created;
}

export default createCode;