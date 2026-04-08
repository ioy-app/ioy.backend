import db from "@/lib/db";
import validate from "@/utils/validate";
import z from "zod";
import checkSubscribe from "./checkSubscribe";
import redis from "@/lib/redis";

/**
 * Подписка/отписка на получателя в зависимости от его типа
 * 
 * @param source_id - Заявитель
 * @param target_id - Получатель
 * @param target_type - Тип получателя
 * @returns - Возвращает подписку/отписку
*/
const putSubscribe = async (
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
    }, "putSubscribe");

    const isSubscribe = await checkSubscribe(source_id, target_id, target_type);

    if (!isSubscribe) {
        await db.query(`
            INSERT INTO "subscribers" (
                source_id,
                target_id,
                target_type
            )
            SELECT $1, $2, $3
            WHERE NOT EXISTS (
                SELECT 1 FROM "subscribers"
                WHERE
                    source_id = $1
                    AND target_id = $2
                    AND target_type = $3
            )
            RETURNING id
        `, [ source_id, target_id, target_type ]);
    } else {
        await db.query(`
            DELETE FROM "subscribers"
            WHERE
                source_id = $1
                AND target_id = $2
                AND target_type = $3
        `, [ source_id, target_id, target_type ]);
    }
    await redis.delWithLog(`is_subscribe:${source_id}:${target_id}:${target_type}`);
    if (target_type == "user")
        await redis.delWithLog(`user_id:${target_id}:followers`);
    if (target_type == "game") {
        await redis.delWithLog(`user_id:${target_id}:subscribers`);
        await redis.delWithLog(`game:${target_id}:saves`);
    }
    await redis.delAllWithLog(`subscribers:${source_id}:${target_type}:*`);
    await redis.delWithLog(`subs:${target_type}:${target_id}`);

    return !isSubscribe;
}

export default putSubscribe;