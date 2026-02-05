import { z } from "zod";
import db from "@/lib/db";
import redisClient from "@/lib/redis";
import { UserDetails } from "@/types/user";
import ContentError from "@/utils/ContentError";
import validate from "@/utils/validate";
import UserDetailsSchema from "@/schemas/userDetails";

/**
 * Получение данных о пользователе по почте
 * 
 * @param email - Почта
 * @returns
*/
const getUserEmail = async (email: string): Promise<UserDetails> => {
    validate(z.email({
        error: "errors.invalid.email"
    }), email);

    const cache_key: string = `user_email:${email}`;
    let cached = await redisClient.readWithLog(cache_key);

    if (cached) {
        try {
            const parsed = JSON.parse(cached as string);
            validate(UserDetailsSchema, parsed);
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
        WHERE email = $1
    `, [ email ]);

    if (result.rowCount === 0)
        throw new ContentError("getUserEmail", "errors.exists");

    const obj: UserDetails = result.rows[0];
    redisClient.writeWithLog(cache_key, JSON.stringify(obj));

    return obj;
}

export default getUserEmail;