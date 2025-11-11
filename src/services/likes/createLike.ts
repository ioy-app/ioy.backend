import db from "@/lib/db";
import redis from "@/lib/redis";
import IdSchema from "@/schemas/id";
import ContentError from "@/utils/ContentError";
import validate from "@/utils/validate";

/**
 * Создание лайка по ID
 * 
 * @param {number} user_id ID Пользователя
 * @param {number} id ID Сущности
 * @param {"game" | "comment"} type Тип сущеости
 * @returns {Promise<boolean>}
*/
const createLike = async (user_id: number, id: number, type: string = "game"): Promise<boolean> => {
    validate(IdSchema, id);
    validate(IdSchema, user_id);

    const result = await db.query(`
        INSERT INTO "likes" (
            source_id,
            target_id,
            target_type
        ) SELECT $1, $2, $3
        WHERE NOT EXISTS (
            SELECT 1 FROM "likes"
            WHERE source_id = $1 AND target_id = $2 AND target_type = $3
        )
        RETURNING id, date_created
    `, [ user_id, id, type ]);

    if (result.rowCount !== 0) {
        redis.delWithLog(`likes_count:${type}:${id}`);
        redis.delWithLog(`likes_check:${type}:${id}`);
        redis.delAllWithLog(`user_id:${user_id}:likes:*`);
    }

    return true;
}

export default createLike;