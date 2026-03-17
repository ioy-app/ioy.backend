import db from "@/lib/db";
import redis from "@/lib/redis";
import { IdSchemaCustom } from "@/schemas/id";
import validate from "@/utils/validate";
import z from "zod";
import getUserId from "./getUserId";
import getUserLogin from "./getUserLogin";
import getUser from "./getUser";

/**
 * Update user email
 * 
 * @param user_id - ID user
 * @param email - Email
 * @returns 
*/
const putUserEmail = async (user_id: number, current_email: string, email: string): Promise<boolean> => {
    validate(
        z.object({
            user_id: IdSchemaCustom("user_id"),
            email: z.email({ error: "errors.invalid.email"})
            .nonoptional({ error: "errors.required.email" }),
            current_email: z.email({ error: "errors.invalid.current_email"})
            .nonoptional({ error: "errors.required.current_email" })
        }),
        {
            user_id,
            current_email,
            email
        }
    );

    const login = await getUserLogin(user_id);
    const userdata = await getUser(login);

    const user_email = await db.query(`
        SELECT email FROM "users"
        WHERE id = $1 AND email = $2
    `, [ user_id, current_email ]);

    if (user_email.rowCount === 0)
        return false;

    const result = await db.query(`
        UPDATE "users"
        SET
            email = $2
        WHERE id = $1
        RETURNING 1
    `, [ user_id, email ]);
    
    if (result.rowCount === 0)
        return false;

    await redis.delWithLog(`user_email:${userdata.email}`);
    return true;
}

export default putUserEmail;