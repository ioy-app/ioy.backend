import db from "@/lib/db";
import redis from "@/lib/redis";
import validate from "@/utils/validate";
import z from "zod";

/**
 * Проверка на наличие подписки заявителем на получателя
 * 
 * @param source_id - Заявитель
 * @param target_id - Получатель
 * @param target_type - Тип получателя
 * @returns - Возвращает подписку/отписку
*/
const checkSubscribe = async (
    source_id: number,
    target_id: number,
    target_type: "user" | "game" | "jam"
): Promise<boolean> => {
    validate(z.object({
        source_id: z.number({ error: "errors.invalid.source_id" })
                    .nonnegative({ error: "errors.invalid.source_id" })
                    .nonoptional({ error: "errors.required.source_id" }),
        target_id: z.number({ error: "errors.invalid.target_id" })
                    .nonnegative({ error: "errors.invalid.target_id" })
                    .nonoptional({ error: "errors.required.target_id" }),
        target_type: z.enum([ "user", "game", "jam" ], { error: "errors.invalid.target_type" })
                        .nonoptional({ error: "errors.required.target_type" })
    }), {
        source_id,
        target_id,
        target_type
    }, "checkSubscribe");

    const cache_key: string = `is_subscribe:${source_id}:${target_id}:${target_type}`;
    let cached = await redis.readWithLog(cache_key);

    if (cached) {
        try {
            const isSubscribe = Boolean((await redis.readWithLog(cache_key)) == "true");
            return isSubscribe;
        }
        catch(err) { await redis.delWithLog(cache_key); }
    }

    const result = await db.query(`
        SELECT 1
        FROM "subscribers"
        WHERE
            source_id = $1
            AND target_id = $2
            AND target_type = $3
    `, [ source_id, target_id, target_type ]);

    const isSubscribe = Boolean(result.rowCount !== 0);

    redis.writeWithLog(cache_key, String(isSubscribe));
    return isSubscribe;
}

export default checkSubscribe;