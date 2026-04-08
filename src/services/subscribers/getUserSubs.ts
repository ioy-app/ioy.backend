import db from "@/lib/db";
import Game from "@/types/game";
import validate from "@/utils/validate";
import z from "zod";
import { getGameById } from "../games";
import redis from "@/lib/redis";
import { validObj } from ".";
import { User } from "@/types/user";
import getUserId from "../users/getUserId";
import getUser from "../users/getUser";
import getUserLogin from "../users/getUserLogin";

export type Type = "game" | "user" | "jam";
export type getUserSubsProp = Game[] | User[];

enum TypePrivacy {
    "game"="favorites",
    "user"="subscribers",
    "jams"="jams"
}

/**
 * Получение подписок пользователя на игры/пользователей/джемы
 * 
 * @param user_id - ID Пользователя 
 * @param type - Тип запроса
 * @param offset - Отступ
 * @param limit - Лимит записей
 * @returns
*/
const getUserSubs = async (
    user_id: number,
    type: Type = "game",
    offset: number = 0,
    limit: number = 5,
    sort: "new" | "old" = "new"
): Promise<[getUserSubsProp, number]> => {
    validate(z.object({
        user_id: z.number({ error: "errors.invalid.user_id" })
            .nonnegative({ error: "errors.invalid.user_id" })
            .nonoptional({ error: "errors.required.user_id" }),
        offset: z.number({ error: "errors.invalid.offset" })
            .nonnegative({ error: "errors.invalid.offset" })
            .optional(),
        limit: z.number({ error: "errors.invlaid.limit" })
            .nonnegative({ error: "errors.invalid.limit" })
            .optional(),
        sort: z.enum([ "new", "old" ], { error: "errors.invalid.sort" })
            .optional(),
        type: z.enum([ "game", "user", "jam" ], { error: "errors.invalid.type" })
            .optional()
    }), { user_id, offset, limit, sort, type }, "getUserSubs");

    const cache_key = `subscribers:${user_id}:${type}:${offset}:${limit}:${sort}`;
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

    let result;

    switch(type) {
        case "game": {
            result = await db.query(`
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
                OFFSET $3 LIMIT $4
            `, [ user_id, type, offset, limit ])
        } break;
        case "user":
            result = await db.query(`
                SELECT
                    s.target_id as id,
                    COUNT(*) OVER()::INTEGER AS total
                FROM "subscribers" s
                JOIN "users" u
                ON
                    u.id = s.source_id
                    AND s.target_type = $2
                WHERE s.source_id = $1
                ORDER BY s.date_created ${OrderEnum[sort] || "DESC"}
                OFFSET $3 LIMIT $4
            `, [ user_id, type, offset, limit ]);
        break;
        case "jam":
            result = await db.query(`
                SELECT
                    s.target_id as id,
                    COUNT(*) OVER()::INTEGER AS total
                FROM "subscribers" s
                JOIN "users" u
                ON
                    u.id = s.source_id
                    AND s.target_type = $2
                WHERE s.source_id = $1
                ORDER BY s.date_created ${OrderEnum[sort] || "DESC"}
                OFFSET $3 LIMIT $4
            `, [ user_id, type, offset, limit ]);
        break;
    }
    
    const data: number[] = result?.rows?.map(row => row.id);
    const total: number = result?.rows?.[0]?.total || 0;

    redis.writeWithLog(cache_key, JSON.stringify([data, total]));
    return [ data, total ];
}

export default getUserSubs;