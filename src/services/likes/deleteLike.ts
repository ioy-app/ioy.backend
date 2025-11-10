import db from "@/lib/db";
import redis from "@/lib/redis";
import IdSchema from "@/schemas/id";
import validate from "@/utils/validate";

/**
 * Удаление лайка по ID
 * 
 * @param {number} id ID Лайка 
 * @returns {Promise<boolean>}
*/
const deleteLike = async (id: number): Promise<boolean> => {
    validate(IdSchema, id);

    const result = await db.query(`
        DELETE FROM "likes"
        WHERE id = $1
        RETURNING target_id, target_type
    `, [ id ]);

    if (result.rowCount != 0) {
        const { target_id, target_type } = result.rows[0];

        redis.delWithLog(`likes_count:${target_type}:${target_id}`);
        redis.delWithLog(`likes_check:${target_type}:${target_id}`);
    }

    return true;
}

export default deleteLike;