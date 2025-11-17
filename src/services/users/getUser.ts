import db from "@lib/db";
import { UserDetails } from "@/types/user";
import LoginSchema from "@schemas/login";
import ContentError from "@utils/ContentError";
import validate from "@utils/validate";
import redisClient from "@lib/redis";
import UserDetailsSchema from "@/schemas/userDetails";

/**
 * Получение информации о пользователе
 * 
 * @param {string} login Логин пользователя 
 * @returns {Promise<UserDetails>}
*/
const getUser = async (login: string): Promise<UserDetails> => {
    validate(LoginSchema, login, "getUser");

    const cache_key: string = `user:${login}`;
    let cached = await redisClient.readWithLog(cache_key);

    if (cached) {
        try {
            const parsed = JSON.parse(cached as string);
            validate(UserDetailsSchema, parsed, "getUser");
            return parsed as UserDetails;
        }
        catch(err) { await redisClient.delWithLog(cache_key); }
    }

    const result = await db.query<UserDetails>(`
        SELECT
            id,
            active,
            login,
            description,
            date_created,
            date_deleted,
            date_ban,
            ban_count,
            privacy,
            role_id
        FROM "users"
        WHERE
            login = $1
            AND active = true
    `, [ login ]);

    if (result.rowCount === 0)
        throw new ContentError("getUser", "errors.exists");
    
    const user: UserDetails = result.rows[0];
    redisClient.writeWithLog(cache_key, JSON.stringify(user));

    return user;
}

export default getUser;