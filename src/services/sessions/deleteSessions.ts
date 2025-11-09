import db from "@lib/db";
import redisClient from "@lib/redis";
import IdSchema from "@schemas/id"
import validate from "@utils/validate"

/**
 * Удаление всех пользовательских сессий
 * 
 * @param {number} user_id ID Пользователя
 * @returns {Promise<boolean>}
*/
const deleteSessions = async (user_id: number): Promise<boolean> => {
    validate(IdSchema, user_id);

    const result = await db.query<number[]>(`
        DELETE FROM "sessions"
        WHERE uid = $1
        RETURNING id
    `, [ user_id ]);

    const sessionKeys = result.rows.map(({ id }) => `session:${id}`);
    await redisClient.delWithLog(sessionKeys);
    await redisClient.delWithLog(`sessions:${user_id}`);

    return true;
}

export default deleteSessions;