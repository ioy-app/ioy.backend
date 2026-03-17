import { z } from "zod";
import db from "@/lib/db";
import redisClient from "@/lib/redis";
import { UserDetails } from "@/types/user";
import ContentError from "@/utils/ContentError";
import validate from "@/utils/validate";
import UserDetailsSchema from "@/schemas/userDetails";
import getUser from "./getUser";

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
            return (await getUser(parsed));
        }
        catch(err) { await redisClient.delWithLog(cache_key); }
    }

    const result = await db.query<UserDetails>(`
        SELECT login
        FROM "users"
        WHERE email = $1
    `, [ email ]);

    if (result.rowCount === 0)
        throw new ContentError("getUserEmail", "errors.exists");

    const login: string = result.rows?.[0]?.login;
    redisClient.writeWithLog(cache_key, String(login));

    return getUser(login);
}

export default getUserEmail;