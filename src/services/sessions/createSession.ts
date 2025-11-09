import crypto from "crypto";
import bcrypt from "bcrypt";

import IdSchema from "@schemas/id";
import Session from "@/types/session";
import validate from "@utils/validate";
import db from "@lib/db";
import redisClient from "@lib/redis";
import ValidError from "@utils/ValidError";

/**
 * Создание пользовательской сессии
 * 
 * @param {number} user_id ID Пользователя 
 * @param {string} ip IP Адрес
 * @param {string} user_agent Браузер, версия ОС
 * @returns {Promise<Session>}
*/
const createSession = async (user_id: number, ip: string, user_agent: string): Promise<Session> => {
    validate(IdSchema, user_id);

    const token = crypto.randomBytes(64).toString("hex");
    const hash = await bcrypt.hash(token, 12);

    const result = await db.query<Session>(`
        INSERT INTO "sessions" (
            uid,
            user_agent,
            ip,
            token
        )
        VALUES (
            $1,
            $2,
            $3,
            $4
        )
        RETURNING id, date_created, date_expires
    `, [ user_id, user_agent, ip, hash ]);

    if (result.rowCount === 0)
        throw new ValidError("createSession", "errors.valid.session");

    const { id, date_created, date_expires } = result.rows[0];
    const cache_key: string = `session:${id}`;
    const obj = {
        id,
        ip,
        user_agent,
        date_created,
        date_expires,
        token: hash
    }
    redisClient.writeWithLog(cache_key, JSON.stringify(obj));
    return obj as Session;
}

export default createSession;