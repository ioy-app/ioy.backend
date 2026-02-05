import db from "@/lib/db";
import redis from "@/lib/redis";
import IdSchema from "@/schemas/id";
import validate from "@/utils/validate";

/**
 * Удаление лайка по ID
 * 
 * @param {number} user_id ID Пользователя
 * @param {number} id ID Сущности
 * @param {"game" | "comment"} type Тип сущеости
 * @returns {Promise<boolean>}
*/
const deleteLike = async (user_id: number, id: number, type: string = "game"): Promise<boolean> => {
    validate(IdSchema, id);
    validate(IdSchema, user_id);

    const result = await db.query(`
        DELETE FROM "likes"
        WHERE source_id = $1 AND target_id = $2 AND target_type = $3
        RETURNING id
    `, [ user_id, id, type ]);

    if (result.rowCount != 0) {
        redis.delWithLog(`likes_count:${type}:${id}`);
        redis.delWithLog(`likes_check:${type}:${id}`);
        if (type == "game")
            redis.delAllWithLog(`user_id:${user_id}:likes:*`);
        if (type == "comment")
            redis.delWithLog(`comment:${id}`);
    }

    return true;
}

export default deleteLike;