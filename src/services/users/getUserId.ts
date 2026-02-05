import db from "@/lib/db";
import redisClient from "@/lib/redis";
import LoginSchema from "@/schemas/login"
import ContentError from "@/utils/ContentError";
import validate from "@/utils/validate";

/**
 * Получение ID пользователя по лоигну
 * 
 * @param login - Логин
 * @returns
*/
const getUserId = async (login: string): Promise<number> => {
    validate(LoginSchema, login);

    const cache_key: string = `user:${login}:id`;
    let cached = await redisClient.readWithLog(cache_key);

    if (cached) {
        try {
            const parsed = Number(cached as string);
            validate(LoginSchema, parsed, "getUser");
            return parsed as number;
        }
        catch(err) { await redisClient.delWithLog(cache_key); }
    }

    const result = await db.query(`
        SELECT id
        FROM "users"
        WHERE login = $1
    `, [ login ]);

    if (result.rowCount === 0)
        throw new ContentError("getUserId", "errors.user.exists");

    const { id } = result.rows[0];
    redisClient.writeWithLog(cache_key, String(id));

    return id;
}

export default getUserId;