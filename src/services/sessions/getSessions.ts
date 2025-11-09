import db from "@lib/db";
import redisClient from "@lib/redis";
import IdSchema from "@schemas/id";
import Session from "@/types/session";
import ContentError from "@utils/ContentError";
import validate from "@utils/validate";
import SessionSchema from "@/schemas/sessions";

/**
 * Получение пользовательских сессий
 * 
 * @param {number} user_id ID Пользователя 
 * @returns {Promise<Session[]>}
*/
const getSessions = async (user_id: number): Promise<Session[]> => {
    validate(IdSchema, user_id);

    const cache_key: string = `sessions:${user_id}`;
    let cached = await redisClient.readWithLog(cache_key);

    if (cached) {
        try {
            const parsed = JSON.parse(cached as string);
            validate(SessionSchema, parsed, "getSessions");
            return parsed as Session[];
        }
        catch(err) { await redisClient.delWithLog(cache_key); }
    }

    const result = await db.query<Session[]>(`
        SELECT
            id,
            ip,
            user_agent,
            date_created,
            date_expires
        FROM "sessions"
        WHERE uid = $1 AND NOW() < date_expires
    `, [ user_id ]);
    
    if (result.rowCount === 0)
        throw new ContentError("getSessions", "errors.exists.sessions");

    const { rows } = result;
    redisClient.writeWithLog(cache_key, JSON.stringify(rows));
    
    return rows;
}

export default getSessions;