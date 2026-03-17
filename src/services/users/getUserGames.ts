import { z } from "zod";
import db from "@lib/db";
import validate from "@utils/validate";
import redis from "@/lib/redis";

/**
 * Get games by user
 * 
 * @param id - ID User
 * @param offset - Offset
 * @param limit - Limit
 * @param sort - Order sort
 * @returns
*/
const getUserGames = async (id: number, offset: number = 0, limit: number = 20, sort: "new" | "old" = "new"): Promise<[number[], number]> => {
    validate(z.object({
        id: z.number({ error: "errors.invalid.id" })
            .nonnegative({ error: "errors.invalid.id" })
            .nonoptional({ error: "errors.required.id" }),
        offset: z.number({ error: "errors.invalid.offset" })
            .nonnegative({ error: "errors.invalid.offset" })
            .optional(),
        limit: z.number({ error: "errors.invlaid.limit" })
            .nonnegative({ error: "errors.invalid.limit" })
            .optional(),
        sort: z.enum([ "new", "old" ], { error: "errors.invalid.sort" })
            .optional()
    }), { id, offset, limit, sort }, "getUserGames");
    
    const cache_key = `user_id:${id}:games:${offset}:${limit}:${sort}`;
    let cached = await redis.readWithLog(cache_key);
    if (cached) {
        try {
            const parsed = JSON.parse(cached as string);
            return parsed;
        }
        catch(err) { await redis.delWithLog(cache_key); }
    }

    enum OrderEnum {
        new="DESC",
        old="ASC"
    }

    const result = await db.query(`
        SELECT
            id,
            COUNT(*) OVER()::INTEGER as total
        FROM "games"
        WHERE creater_id = $1
        AND status = 'public'
        ORDER BY date_created ${OrderEnum[sort] || "DESC"}
        OFFSET $2 LIMIT $3
    `, [ id, offset, limit ]);

    const data: number[] = result?.rows?.map(row => row?.id);
    const total: number = result?.rows?.[0]?.total || 0;

    redis.writeWithLog(cache_key, JSON.stringify([data, total]));
    return [ data, total ];
}

export default getUserGames;