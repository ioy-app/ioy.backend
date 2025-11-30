import db from "@/lib/db"
import redis from "@/lib/redis";

/**
 * Удаление проверочного кода
 * @param {string} code Проверочный код 
*/
const deleteCode = async (code: string): Promise<void> => {
    const result = await db.query(`
        DELETE FROM "codes"
        WHERE code=$1
        RETURNING 1
    `, [ code ]);

    if (result.rowCount !== 0)
        redis.delWithLog(`code:${code}`);
}

export default deleteCode;