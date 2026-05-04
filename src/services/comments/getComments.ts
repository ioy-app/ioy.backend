import db from "@/lib/db";
import redis from "@/lib/redis";
import IdSchema from "@/schemas/id";
import validate from "@/utils/validate";
import z from "zod";

/**
 * Get comments from target
 * 
 * @param id - Target ID
 * @param offset - Offset
 * @param limit - Limit
 * @param type - Target type
 * @returns
*/
const getComments = async (
    id: number,
    offset: number = 0,
    limit: number = 10,
    type: "game" | "comment" = "game",
    sort: "new" | "old" = "new"
): Promise<[number[], number]> => {
    validate(
        z.object({
            id: IdSchema,
            type: z.enum([ "game", "comment" ], { error: "errors.invalid.type" })
                .nonoptional({ error: "errors.required.type" }),
            offset: z.number({ error: "errors.invalid.offset" })
                .nonnegative({ error: "errors.invalid.offset" })
                .optional(),
            limit: z.number({ error: "erros.invlaid.limit" })
                .nonnegative({ error: "errors.invalid.limit" })
                .optional()
        }),
        {
            id,
            type,
            offset,
            limit
        }
    );
    validate(
        z.enum([ "new", "old" ], { error: "errors.invalid.sort" })
            .optional(),
    sort, "getComments");

    const cache_key = `comments:${type}:${id}:${offset}:${limit}:${sort}`;
    const cache = await redis.readWithLog(cache_key);
    if (cache) {
        try {
            const parse = JSON.parse(cache) as [number[], number];
            validate(
                z.array(
                    z.number()
                    .int()
                    .nonnegative()
                    .nonoptional()
                ),
                parse?.[0]
            );
            validate(z.number().int().nonnegative().nonoptional(), parse?.[1]);

            return parse;
        }
        catch(err) { await redis.delWithLog(cache_key); }
    }

    enum OrderEnum {
        new="DESC",
        old="ASC"
    }

    const query = await db.query(`
        SELECT
            id,
            COUNT(*) OVER()::INTEGER as total
        FROM "comments"
        WHERE
            target_id = $1
            AND target_type = $2
        ORDER BY date_created ${type == "game" ? (OrderEnum[sort] || "DESC") : "DESC"}
        OFFSET $3
        LIMIT $4
    `, [ id, type, offset, limit ]);

    const arr = query.rows.map(item => item.id) as number[];
    const total: number = query.rows?.[0]?.total || 0;
    const result: [number[], number] = [ arr, total ];

    redis.writeWithLog(cache_key, JSON.stringify(result));

    return result;
}

export default getComments;