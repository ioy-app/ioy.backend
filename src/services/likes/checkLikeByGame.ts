import db from "@/lib/db";
import redis from "@/lib/redis";
import IdSchema from "@/schemas/id";
import validate from "@/utils/validate";

/**
 * Проверка, есть ли лайк на игре от пользователя
 * 
 * @param {number} user_id ID Пользователя 
 * @param {number} id ID игры 
 * @returns {Promise<boolean>}
*/
const checkLikeByGame = async (user_id: number, id: number): Promise<boolean> => {
    validate(IdSchema, id);
    validate(IdSchema, user_id);

    const cache_key = `likes_check:game:${id}`;
    let cached = await redis.readWithLog(cache_key);
    if (cached)
        return cached == "true" ? true : false;

    const result = await db.query(`
        SELECT 1
        FROM "likes"
        WHERE
            source_id = $1
            AND target_id = $2
            AND target_type = 'game'
    `, [ user_id, id ]);

    const value = !(result.rowCount === 0);
    redis.writeWithLog(cache_key, String(value));

    return value;
}

export default checkLikeByGame;