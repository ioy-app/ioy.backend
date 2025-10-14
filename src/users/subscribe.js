import { DB } from "../../index.js";
import CustomError from "../customError.js";
import jwt from "jsonwebtoken";
import { secret } from "../../index.js";

export default async function Subscribe(req, res) {
    try {
        const { login } = req?.params;
        const authHeader = req?.headers?.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        if (!token)
            throw "Нет доступа";
        try {
            const user = jwt.verify(token, secret);
            const result = await DB.query(`
                WITH target_user AS (
                    SELECT id FROM users WHERE login = $2
                ),
                deleted AS (
                    DELETE FROM "subscribers"
                    WHERE source_id = $1
                    AND target_id = (SELECT id FROM target_user)
                    AND target_type = 'user'
                    RETURNING 'deleted' AS status
                ),
                inserted AS (
                    INSERT INTO "subscribers" (source_id, target_id, target_type)
                    SELECT $1, (SELECT id FROM target_user), 'user'
                    WHERE NOT EXISTS (SELECT 1 FROM deleted)
                    RETURNING 'created' AS status
                )
                SELECT status FROM deleted
                UNION ALL
                SELECT status FROM inserted;
            `, [ user?.id, login ]);

            if (!result?.rows?.length)
                throw new CustomError("subscribe", "Пользователя не существует");

            res.status(200).json(result?.rows[0]);
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