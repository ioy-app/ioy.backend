import jwt from "jsonwebtoken";

import db from "@/lib/db";
import AccessError from "@/utils/AccessError"
import { secret } from "index";

/**
 * Создание временного токена доступа
 * 
 * @param session_token Токен сессии
 * @returns
*/
const createToken = async (session_token: string): Promise<string> => {
    if (!session_token)
        throw new AccessError("createToken", "errors.denied");

    const result = await db.query(`
        SELECT id, uid
        FROM "sessions"
        WHERE
            token=$1
            AND NOW() < date_expires
    `, [ session_token ]);

    if (result.rowCount === 0)
        throw new AccessError("createToken", "errors.denied");

    const { id: refresh_id, uid: id} = result.rows[0];
    const token = jwt.sign({
        id,
        refresh_id
    }, secret, {
        expiresIn: "30m"
    });

    return token;
}

export default createToken;