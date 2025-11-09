import db from "@/lib/db";
import redisClient from "@/lib/redis";
import IdSchema from "@/schemas/id";
import ContentError from "@/utils/ContentError";
import validate from "@/utils/validate";

/**
 * Получение логина по id пользователя
 * 
 * @param {number} id ID
 * @returns {Promise<string>}
*/
const getUserLogin = async (id: number): Promise<string> => {
    validate(IdSchema, id);

    const cache_key: string = `user_id:${id}:login`;
    let cached = await redisClient.readWithLog(cache_key);

    if (cached) {
        try {
            const parsed = String(cached as string);
            validate(IdSchema, parsed);
            return parsed as string;
        }
        catch(err) { await redisClient.delWithLog(cache_key); }
    }

    const result = await db.query(`
        SELECT login
        FROM "users"
        WHERE id = $1
    `, [ id ]);

    if (result.rowCount === 0)
        throw new ContentError("getUserLogin", "errors.exists");

    const { login } = result.rows[0];
    redisClient.writeWithLog(cache_key, String(login));

    return login;
}

export default getUserLogin;