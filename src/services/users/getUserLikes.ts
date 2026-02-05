import { z } from "zod";
import db from "@lib/db";
import IdSchema from "@schemas/id";
import Game from "@/types/game";
import validate from "@utils/validate";
import redis from "@/lib/redis";
import { getGameById } from "../games";

/**
 * Получение игр, которые понравились пользователю
 * 
 * @param id - ID пользователя
 * @param offset - Отступ
 * @param limit - Лимит
 * 
 * @returns 
 */
const getUserLikes = async (id: number, offset: number, limit: number): Promise<[Game[], number]> => {
    validate(IdSchema, id);

    validate(z.number({
        error: "errors.invalid.offset"
    }).nonnegative({
        error: "errors.invalid.offset"
    }).int({
        error: "errors.invalid.offset"
    }), offset);

    validate(z.number({
        error: "errors.invalid.limit"
    }).nonnegative({
        error: "errors.invalid.limit"
    }).int({
        error: "errors.invalid.limit"
    }), limit);

    const cache_key = `user_id:${id}:likes:${offset}:${limit}`;
    let cached = await redis.readWithLog(cache_key);
    if (cached) {
        try {
            const parsed = JSON.parse(cached as string);
            const data: Game[] = [];
            for (const row of parsed) {
                const game = await getGameById(row?.target_id);
                if (game.status != "public")
                    throw new Error();

                data.push(game);
            }

            return [ data, parsed?.[0]?.total as number ];
        }
        catch(err) { await redis.delWithLog(cache_key); }
    }

    const result = await db.query(`
        SELECT
            l.id,
            l.target_id,
            l.date_created,
            COUNT(l.*) OVER()::INTEGER as total
        FROM "likes" l
        LEFT JOIN "games" g
        ON l.source_id = g.id
        WHERE
            l.source_id = $1
            AND l.target_type = 'game'
            AND g.status = 'public'
        ORDER BY l.date_created DESC
        OFFSET $2 LIMIT $3
    `, [ id, offset, limit ]);

    const data: Game[] = [];
    const total: number = result?.rows?.[0]?.total || 0;

    redis.writeWithLog(cache_key, JSON.stringify(result?.rows));

    for (const row of result.rows)
        data.push(await getGameById(row?.target_id));
    
    return [ data, total ];
}

export default getUserLikes;