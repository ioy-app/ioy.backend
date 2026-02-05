import db from "@lib/db";
import redisClient from "@lib/redis";
import IdSchema from "@schemas/id"
import validate from "@utils/validate"

/**
 * Удаление пользовательской сессии
 * 
 * @param user_id - ID Пользователя
 * @param id - ID Сессии
 * @returns
*/
const deleteSession = async (user_id: number, id: number): Promise<boolean> => {
    validate(IdSchema, id);
    validate(IdSchema, user_id);

    await db.query(`
        DELETE FROM "sessions"
        WHERE id = $1 AND uid = $2
        RETURNING 1
    `, [ id, user_id ]);

    await redisClient.delWithLog(`session:${id}`);
    await redisClient.delWithLog(`sessions:${user_id}`);

    return true;
}

export default deleteSession;