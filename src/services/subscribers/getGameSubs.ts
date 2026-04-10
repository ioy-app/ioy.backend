import db from "@/lib/db";
import redis from "@/lib/redis";
import validate from "@/utils/validate";
import z from "zod";

/**
 * Returning game saves counter
 * 
 * @param id - Game ID
 * @example
 * return getGameSubs(1)
*/
const getGameSubs = async (id: number): Promise<number> => {
    validate(
        z.number({ error: "errors.invalid.id" })
            .nonnegative({ error: "errors.invalid.id" })
            .nonoptional({ error: "errors.required.id" }),
        id
    );

    const cache_key = `game:${id}:saves`;
    const cache = await redis.readWithLog(cache_key);
    if (cache) {
        try {
            const total = Number(cache);
            return total;
        }
        catch(err) { await redis.delWithLog(cache_key); }
    }

    const result = await db.query(`
        SELECT
            COUNT(*) OVER()::INTEGER AS total
        FROM "subscribers" s
        JOIN "games" g
        ON
            g.id = s.target_id
            AND g.id = $1
            AND s.target_type = 'game'
        ORDER BY s.date_created DESC
    `, [ id ]);

    const total = result?.rows?.[0]?.total || 0;
    redis.writeWithLog(cache_key, String(total));
    return total;
}

export default getGameSubs;