import db from "@/lib/db";
import validate from "@/utils/validate";
import z from "zod";
import redis from "@/lib/redis";
import { IdSchemaCustom } from "@/schemas/id";

enum OrderEnum {
    new="DESC",
    old="ASC"
}

/**
 * Get sub's list of user subscribe
 * 
 * @param user_id - User ID
 * @param target_type - Target type
 * @param offset - Offset
 * @param limit - Limit
 * @returns
*/
const getUserSubs = async (
    source_id: number,
    target_type: "game" | "user" | "jam" | "picture" = "game",
    offset: number = 0,
    limit: number = 5,
    sort: "new" | "old" = "new"
): Promise<[ number[], number ]> => {
    validate(z.object({
        source_id: IdSchemaCustom("source_id"),
        offset: z.number("errors.invalid.offset")
            .nonnegative("errors.invalid.offset")
            .int("errors.invalid.offset")
            .optional(),
        limit: z.number("errors.invlaid.limit")
            .nonnegative("errors.invalid.limit")
            .int("errors.invalid.limit")
            .optional(),
        sort: z.enum([
            "new",
            "old"
        ], "errors.invalid.sort")
        .optional(),
        target_type: z.enum([
            "game",
            "user",
            "jam",
            "picture"
        ], "errors.invalid.target_type")
        .optional()
    }), {
        source_id,
        offset,
        limit,
        sort,
        target_type
    }, "getUserSubs");

    const cache_key = `subscribers:${source_id}:${target_type}:${offset}:${limit}:${sort}`;
    let cached = await redis.readWithLog(cache_key);
    if (cached) {
        try {
            const parsed = JSON.parse(cached as string);
            return parsed;
        }
        catch(err) { await redis.delWithLog(cache_key); }
    }

    let sql;
    switch(target_type) {
        case "game": {
            sql = `
                SELECT
                    s.target_id as id,
                    COUNT(*) OVER()::INTEGER AS total
                FROM "subscribers" s
                JOIN "users" u
                ON
                    u.id = s.source_id
                    AND s.target_type = $2
                JOIN "games" g
                ON
                    g.id = s.target_id
                    AND g.status = 'public'
                WHERE s.source_id = $1
                ORDER BY s.date_created ${OrderEnum[sort] || "DESC"}
                OFFSET $3
                LIMIT $4
            `;
        } break;
        default: {
            sql = `
                SELECT
                    target_id as id,
                    COUNT(*) OVER()::INTEGER AS total
                FROM "subscribers"
                WHERE
                    source_id = $1
                    AND target_type = $2
                ORDER BY date_created ${OrderEnum[sort] || "DESC"}
                OFFSET $3
                LIMIT $4
            `;
        } break;
    }

    const result = await db.query(sql, [
        source_id,
        target_type,
        offset,
        limit 
    ]);
    
    const ids: number[] = result?.rows?.map((row: { id: number, total: number }) => row.id);
    const total: number = result?.rows?.[0]?.total || 0;
    const data: [ number[], number ] = [ ids, total ];

    redis.writeWithLog(cache_key, JSON.stringify(data));
    return data;
}

export default getUserSubs;