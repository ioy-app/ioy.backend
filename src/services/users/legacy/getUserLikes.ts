import { z } from "zod";
import db from "@lib/db";
import IdSchema from "@schemas/id";
import Game from "@/types/game";
import validate from "@utils/validate";
import redis from "@/lib/redis";
import { getGameById } from "../games";

/**
 * Get like's games by user
 * 
 * @param id - User ID
 * @param offset - Offset
 * @param limit - limit
 * @param sort - Order sort
 * 
 * @returns 
 */
const getUserLikes = async (id: number, offset: number = 0, limit: number = 20, sort: "new" | "old" = "new"): Promise<[Game[], number]> => {
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
    }), { id, offset, limit, sort }, "getUserLikes");

    const cache_key = `user_id:${id}:likes:${offset}:${limit}:${sort}`;
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
            l.id,
            l.target_id,
            l.date_created,
            COUNT(l.*) OVER()::INTEGER as total
        FROM "likes" l
        JOIN "games" g
        ON g.id = l.target_id AND g.status = 'public'
        WHERE
            l.source_id = $1
            AND l.target_type = 'game'
        ORDER BY l.date_created ${OrderEnum[sort] || "DESC"}
        OFFSET $2 LIMIT $3
    `, [ id, offset, limit ]);

    const data = result?.rows?.map(row => row.target_id);
    const total: number = result?.rows?.[0]?.total || 0;

    redis.writeWithLog(cache_key, JSON.stringify([ data, total ]));    
    return [ data, total ];
}

export default getUserLikes;