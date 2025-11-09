import { QueryResult } from "pg";
import db from "@lib/db";
import LoginSchema from "@schemas/login";
import validate from "@utils/validate";
import redisClient from "@lib/redis";

/**
 * Просмотр избранных игр
 * 
 * @param {string} login Логин
 * @param {{ offset?: number; limit?: number }} query Поисковый запрос 
 * @returns 
*/
const getUserFavorites = async (
    login: string,
    query?: {
        offset?: number;
        limit?: number;
    }
) => {
    validate(LoginSchema, login, "getUserFavorites");

    const offset: number = query?.offset || 0;
    const limit: number = query?.limit || 5;

    const cache_key: string = `user:${login}:favorites`;
    let cached = await redisClient.readWithLog(cache_key);

    if (cached) {
        try {
            const parsed = JSON.parse(cached as string);
            return parsed;
        }
        catch(err) { await redisClient.delWithLog(cache_key); }
    }

    const result: QueryResult = await db.query(`
        SELECT
            s.target_id as id,
            s.date_created,
            COUNT(*) OVER()::INTEGER AS total
        FROM "subscribers" s
        JOIN "users" u
        ON 
            s.source_id = u.id 
            AND u.login = $1
            AND u.active = true
            AND s.target_type = 'game'
            AND u.privacy->'favorites' = 'true'::jsonb
        ORDER BY s.date_created DESC
        OFFSET $2 LIMIT $3
    `, [ login, offset, limit ]);

    const obj = {
        items: result.rows,
        offset,
        limit,
        total: result.rows?.[0]?.total
    }

    redisClient.writeWithLog(cache_key, JSON.stringify(obj));

    return obj;
}

export default getUserFavorites;