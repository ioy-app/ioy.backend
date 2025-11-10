import db from "@lib/db";
import CustomError from "../../utils/CustomError.js";
import redisClient from "@lib/redis";

export default async function postUserSubscribe(req, res) {
    try {
        const { login } = req?.params;
        if (!login)
            throw new CustomError("subscribe", "Не указан пользователь");
        
        try {
            const result = await db.query(`
                WITH target_user AS (
                    SELECT id FROM users WHERE login = $2
                ),
                deleted AS (
                    DELETE FROM "subscribers"
                    WHERE source_id = $1
                    AND target_id = (SELECT id FROM target_user)
                    AND target_type = 'user'
                    RETURNING 'deleted' AS status, (SELECT id FROM target_user) as id
                ),
                inserted AS (
                    INSERT INTO "subscribers" (source_id, target_id, target_type)
                    SELECT $1, (SELECT id FROM target_user), 'user'
                    WHERE NOT EXISTS (SELECT 1 FROM deleted) AND (SELECT id FROM target_user) != $1
                    RETURNING 'created' AS status, (SELECT id FROM target_user) as id
                )
                SELECT status, id FROM deleted
                UNION ALL
                SELECT status, id FROM inserted;
            `, [ req.user_id, login ]);

            

            if (!result?.rows?.length)
                throw new CustomError("subscribe", "Пользователя не существует");

            const sub = result.rows[0];
            redisClient.delWithLog(`user_id:${sub.id}:subs`);

            res.status(200).json(sub);
        }
        catch(err) {
            if (err instanceof CustomError)
                throw err;

            console.error("[subscribe]", err.toString());
            throw "Неизвестная ошибка";
        }
    }
    catch(err) {
        console.error("[subscribe]", err.toString());
        res.status(422).json({
            msg: err.toString()
        });
    }
}