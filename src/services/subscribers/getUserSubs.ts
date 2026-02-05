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
const getUserSubs = async (user_id: number, type: Type = "game", offset: number = 0, limit: number = 5): Promise<[getUserSubsProp, number]> => {
    validate(validObj, { user_id, offset, limit }, "getUserSubs");

    const cache_key = `subscribers:${user_id}:${type}:${offset}:${limit}`;
    let cached = await redis.readWithLog(cache_key);
    if (cached) {
        try {
            const parsed = JSON.parse(cached as string);
            return [ parsed as getUserSubsProp, parsed?.[0]?.total as number ];
        }
        catch(err) { await redis.delWithLog(cache_key); }
    }

    const result = await db.query(`
        SELECT
            s.target_id as id,
            COUNT(*) OVER()::INTEGER AS total
        FROM "subscribers" s
        JOIN "users" u
        ON
            u.id = s.source_id
            AND s.target_type = $2
            AND u.privacy->'${TypePrivacy[type]}' = 'true'::jsonb
        WHERE s.source_id = $1
        ORDER BY s.date_created
        OFFSET $3 LIMIT $4
    `, [ user_id, type, offset, limit ]);

    const data: getUserSubsProp = [];
    const total: number = result?.rows?.[0]?.total || 0;

    for (const row of result.rows) {
        let content: User | Game;

        switch(type) {
            case "game":
                content = await getGameById(row?.id);
            break;
            case "user": {
                const login = await getUserLogin(Number(row?.id));
                content = await getUser(login);
            } break;
        }
        
        if (content)
            data.push({
                ...row,
                ...content
            });
    }

    redis.writeWithLog(cache_key, JSON.stringify(data));
    return [ data, total ];
}

export default getUserSubs;