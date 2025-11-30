import db from "@/lib/db";
import redis from "@/lib/redis";
import Code from "@/types/code";
import ContentError from "@/utils/ContentError";

/**
 * Проверка наличия кода подтверждения
 * 
 * @param {string} code Код 
 * @returns {Promise<Code>}
*/
const checkCode = async (code: string): Promise<Code> => {
    const cache_key: string = `code:${code}`;
    let cached = await redis.readWithLog(cache_key);
    if (cached) {
        try {
            const parsed = JSON.parse(cached as string);
            return parsed as Code;
        }
        catch(err) { await redis.delWithLog(cache_key); }
    }

    const result = await db.query<Code>(`
        SELECT id, payload, code, uid
        FROM "codes"
        WHERE
            code = $1
            AND (NOW() - date_created) < interval '5 minutes'
    `, [ code ]);

    if (result.rowCount === 0)
        throw new ContentError("checkCode", "errors.exists");

    const row: Code = result?.rows?.[0];
    console.log(row);

    redis.writeWithLog(cache_key, JSON.stringify(row));

    return row;
}

export default checkCode;