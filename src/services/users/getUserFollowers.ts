import ContentError from "@utils/ContentError";
import db from "@lib/db";
import redisClient from "@lib/redis";

/**
 * Получение кол-ва подписчиков пользователя
 * 
 * @param {number} id ID Пользователя 
 * @returns {Promise<number>}
*/
const getUserFollowers = async (id: number): Promise<number> => {
    const cache_key: string = `user_id:${id}:followers`;
    const cache: string = await redisClient.readWithLog(cache_key);

    if (cache)
        return Number(cache);

    const result = await db.query(`
        SELECT COUNT(*)::INTEGER as count
        FROM "subscribers"
        WHERE
            target_id = $1
            AND target_type = 'user'
    `, [ id ]);

    if (result.rowCount == 0)
        throw new ContentError("getUserFollowers", "errors.exists");

    const count: number = result.rows[0]?.count || 0;
    redisClient.writeWithLog(cache_key, count.toString());

    return count;
}

export default getUserFollowers;