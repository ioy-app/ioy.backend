import { z } from "zod";
import Role from "@/types/role";
import validate from "@/utils/validate";
import redis from "@/lib/redis";
import db from "@/lib/db";

/**
 * Получение списка ролей
 * 
 * @param {number} offset Отступ 
 * @param {number} limit Кол-во записей
 * @returns {Promise<Role[]>}
*/
const getRoles = async (offset: number, limit: number): Promise<[Role[], number]> => {
    validate(z.number({
        error: "errors.invalid.offset"
    }).nonnegative({
        error: "errors.invalid.offset"
    }).int({
        error: "errors.invalid.offset"
    }), offset);

    validate(z.number({
        error: "errors.invalid.limit"
    }).nonnegative({
        error: "errors.invalid.limit"
    }).int({
        error: "errors.invalid.limit"
    }), limit);

    const cache_key: string = `roles:${offset}:${limit}`;
    const cached = await redis.readWithLog(cache_key);

    if (cached) {
        try {
            const parsed = JSON.parse(cached as string);
            return [ parsed as Role[], parsed?.[0]?.total as number ];
        }
        catch(err) { await redis.delWithLog(cache_key); }
    }

    const result = await db.query(`
        SELECT *, COUNT(*) OVER()::INTEGER AS total
        FROM "roles"
        ORDER BY id
        OFFSET $1, LIMIT $3
    `, [ offset, limit ]);

    redis.writeWithLog(cache_key, JSON.stringify(result.rows));

    return [ result.rows, result?.rows?.[0]?.total || 0 as number];
}

export default getRoles;