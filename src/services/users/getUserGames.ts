import { z } from "zod";
import db from "@lib/db";
import IdSchema from "@schemas/id";
import Game from "@/types/game";
import validate from "@utils/validate";
import getGameById from "@services/games/getGameById";
import redis from "@/lib/redis";

/**
 * Получение списка игр пользователя
 * 
 * @param {number} id ID Пользователя
 * @param {number} [offset=0] Отступ
 * @param {number} [limit=5] Лимит
 * @returns {Promise<[Game[], number]>}
*/
const getUserGames = async (id: number, offset: number = 0, limit: number = 5): Promise<[Game[], number]> => {
    validate(z.object({
        id: z.number({ error: "errors.invalid.id" })
            .nonnegative({ error: "errors.invalid.id" })
            .nonoptional({ error: "errors.required.id" }),
        offset: z.number({ error: "errors.invalid.offset" })
            .nonnegative({ error: "errors.invalid.offset" })
            .optional(),
        limit: z.number({ error: "erros.invlaid.limit" })
            .nonnegative({ error: "errors.invalid.limit" })
            .optional()
    }), { id, offset, limit }, "getUserGames");
    
    const cache_key = `user_id:${id}:games:${offset}:${limit}`;
    let cached = await redis.readWithLog(cache_key);
    if (cached) {
        try {
            const parsed = JSON.parse(cached as string);
            return [ parsed as Game[], parsed?.[0]?.total as number ];
        }
        catch(err) { await redis.delWithLog(cache_key); }
    }

    const result = await db.query(`
        SELECT
            id,
            COUNT(*) OVER()::INTEGER as total
        FROM "games"
        WHERE creater_id = $1
        AND status = 'public'
        ORDER BY date_created DESC
        OFFSET $2 LIMIT $3
    `, [ id, offset, limit ]);

    const data: Game[] = [];
    const total: number = result?.rows?.[0]?.total || 0;

    for (const row of result.rows) {
        const content = await getGameById(row?.id)
        data.push({
            ...row,
            ...content
        });
    }

    redis.writeWithLog(cache_key, JSON.stringify(data));
    return [ data, total ];
}

export default getUserGames;