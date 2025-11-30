import db from "@lib/db";
import redisClient from "@lib/redis";
import IdSchema from "@schemas/id"
import validate from "@utils/validate"
import getSessions from "./getSessions";
import deleteSession from "./deleteSession";

/**
 * Удаление всех пользовательских сессий
 * 
 * @param {number} user_id ID Пользователя
 * @returns {Promise<boolean>}
*/
const deleteSessions = async (user_id: number): Promise<boolean> => {
    const sessions = await getSessions(user_id);
    for (const session of sessions)
        await deleteSession(user_id, session.id);
    
    return true;
}

export default deleteSessions;