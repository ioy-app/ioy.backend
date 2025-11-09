import { z } from "zod";
import LoginSchema from "@/schemas/login";
import validate from "@/utils/validate";
import db from "@/lib/db";
import ContentError from "@/utils/ContentError";

/**
 * Создание учетной записи
 * 
 * @param {string} login Логин 
 * @param {string} email Почта
 * @returns {Promise<number>}
*/
const createUser = async (login: string, email: string): Promise<number> => {
    validate(LoginSchema, login);
    validate(z.email({ error: "errors.invalid.email" }), email);

    const result = await db.query(`
        INSERT INTO "users" (
            login,
            email
        )
        SELECT $1, $2
        WHERE NOT EXISTS (
            SELECT 1 FROM "users"
            WHERE login = $1 OR email = $2
        )
        RETURNING id
    `, [ login, email ]);

    if (result.rowCount == 0)
        throw new ContentError("createUser", "errors.exists");

    return result.rows[0].id;
}

export default createUser;