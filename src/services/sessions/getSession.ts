import db from "@lib/db";
import redisClient from "@lib/redis";
import IdSchema from "@schemas/id";
import Session from "@/types/session";
import ContentError from "@utils/ContentError";
import validate from "@utils/validate";
import SessionSchema from "@/schemas/sessions";

/**
 * Получение пользовательской сессии
 * 
 * @param user_id - ID Пользователя 
 * @param id - ID Сессии
 * @returns
*/
const getSession = async (user_id: number, id: number): Promise<Session> => {
    validate(IdSchema, user_id);
    validate(IdSchema, id);

    const cache_key: string = `session:${user_id}`;
    let cached = await redisClient.readWithLog(cache_key);

    if (cached) {
        try {
            const parsed = JSON.parse(cached as string);
            validate(SessionSchema, parsed, "getSession");
            return parsed as Session;
        }
        catch(err) { await redisClient.delWithLog(cache_key); }
    }

    const result = await db.query<Session>(`
        SELECT
            id,
            ip,
            user_agent,
            date_created,
            date_expires
        FROM "sessions"
        WHERE uid = $1 AND id = $2 AND NOW() < date_expires
    `, [ user_id, id ]);
    
    if (result.rowCount === 0)
        throw new ContentError("getSession", "errors.exists.session");

    const obj: Session = result.rows[0];
    redisClient.writeWithLog(cache_key, JSON.stringify(obj));
    
    return obj;
}

export default getSession;