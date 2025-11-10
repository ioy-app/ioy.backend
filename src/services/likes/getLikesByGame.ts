import db from "@/lib/db";
import redis from "@/lib/redis";
import IdSchema from "@/schemas/id";
import validate from "@/utils/validate";

/**
 * Просмотр общего кол-ва лайков на игре
 * 
 * @param {number} id ID Игры
 * @returns {Promise<number>}
*/
const getLikesByGame = async (id: number): Promise<number> => {
    validate(IdSchema, id);

    const cache_key = `likes_count:game:${id}`;
    let cached = await redis.readWithLog(cache_key);
    if (cached)
        return Number(cached);

    const result = await db.query(`
        SELECT
            COUNT(*)::integer as total
        FROM "likes"
        WHERE
            target_id = $1
            AND target_type = 'game'
    `, [ id ]);

    const { total } = result.rows[0];

    redis.writeWithLog(cache_key, String(total));
    return total;
}

export default getLikesByGame;