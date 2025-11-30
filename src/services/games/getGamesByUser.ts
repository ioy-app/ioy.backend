import validate from "@/utils/validate";
import { validObj } from ".";
import db from "@/lib/db";
import redis from "@/lib/redis";
import z from "zod";
import ValidError from "@/utils/ValidError";

export type status = "draft" | "public" | undefined;

/**
 * Получение игр пользователя
 * 
 * @param {number} user_id ID Пользователя
 * @param {number} [offset=0] Отступ
 * @param {number} [limit=10] Лимит
 * @param {status} status Статус
 * @param {string} search Поисковый запрос
*/
const getGamesByUser = async (
    user_id: number,
    offset: number = 0,
    limit: number = 10,
    status?: status,
    search?: string
): Promise<[number[], number]> => {
    validate(validObj, { user_id, offset, limit }, "getGamesByUser");
    validate(z.object({
        status: z.string({ error: "errors.invalid.status" }).optional(),
        search: z.string({ error: "errors.invalid.search" }).optional()
    }), { status, search }, "getGamesByUser");

    const cache_key: string = `games:user:${user_id}:${offset}:${limit}:${status}:${search}`;
    let cached = await redis.readWithLog(cache_key);
    if (cached) {
        try {
            const parsed = JSON.parse(cached as string);
            return parsed as [number[], number];
        }
        catch(err) { await redis.delWithLog(cache_key); }
    }

    if (status && !["draft", "public"].includes(status))
        throw new ValidError("getGamesByUser", "errors.invalid.status");

    const filters = [];
    const opts = [];
    if (status) {
        filters.push(`status=$${4 + opts.length}`);
        opts.push(status);
    }

    if (search) {
        filters.push(`title ILIKE $${4 + opts.length}`);
        opts.push(`%${search}%`);
    }

    console.log(status, search);
    console.log(filters, opts);

    const result = await db.query(`
        SELECT
            id,
            COUNT(*) OVER()::INTEGER as total
        FROM "games"
        WHERE
            creater_id = $1
            ${filters?.length >= 1 && `AND ${filters.join(" AND ")}` || ""}
        ORDER BY date_created DESC
        OFFSET $2 LIMIT $3
    `, [ user_id, offset, limit, ...opts ]);

    const total = Number(result?.rows?.[0]?.total || 0);
    const game_ids: number[] = result?.rows?.map((row: { id: number, total: number }) => row.id);

    redis.writeWithLog(cache_key, JSON.stringify([ game_ids, total ]));

    return [ game_ids, total ];
}

export default getGamesByUser;