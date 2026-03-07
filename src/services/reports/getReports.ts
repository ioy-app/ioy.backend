import db from "@/lib/db";
import redis from "@/lib/redis";
import validate from "@/utils/validate";
import z from "zod";

/**
 * Get reports list
 * 
 * @param offset - Offset
 * @param limit - Limit
 * @example
 * return getReports(0, 5)
*/
const getReports = async (offset: number = 0, limit: number = 20): Promise<[number[], number]> => {
    validate(z.object({
        offset: z.number("errors.invalid.offset")
            .int("errors.invalid.offset")
            .nonnegative("errors.invalid.offset")
            .optional(),
        limit: z.number("errors.invalid.limit")
            .int("errors.invalid.limit")
            .nonnegative("errors.invalid.limit")
            .optional()
    }), {
        offset,
        limit
    }, "getReports");

    const cache_key = `reports:${offset}:${limit}`;
    const cache = await redis.readWithLog(cache_key);
    if (cache) {
        try {
            const result = JSON.parse(cache);
            return result;
        }
        catch(err) { await redis.delWithLog(cache_key); }
    }

    const result = await db.query(`
        SELECT
            id,
            COUNT(*) OVER()::INTEGER AS total
        FROM "reports"
        ORDER BY date_created DESC
        OFFSET $1 LIMIT $2
    `, [ offset, limit ]);

    const items: number[] = result.rows?.map(row => row.id);
    const total: number = result?.rows?.[0]?.total || 0;
    const data: [number[], number] = [ items, total ];

    redis.writeWithLog(cache_key, JSON.stringify(data));
    return data;
}

export default getReports;