import { DB } from "../../index.js";
import CustomError from "../customError.js";
import jwt from "jsonwebtoken";
import { secret } from "../../index.js";

export default async function Info(req, res) {
    try {
        const authHeader = req?.headers?.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        const { login } = req.params;
        try {
            const result = await DB.query(`
                SELECT 
                    u.id,
                    u.login,
                    u.description,
                    u.date_deleted,
                    u.date_ban,
                    u.ban_count,
                    COUNT(s.target_id) AS subscribers
                FROM "users" u
                LEFT JOIN "subscribers" s
                    ON s.target_id = u.id 
                    AND s.target_type = 'user'
                WHERE u.login = $1 AND u.active = true
                GROUP BY u.id
            `, [ login ]);

            if (!result?.rows?.length)
                throw new CustomError("info", "Пользователя не существует");

            const data = result?.rows[0];
            data.subscribers = parseInt(data.subscribers);

            if (token) {
                try {
                    const info = jwt.verify(token, secret);
                    const result = await DB.query(`
                        SELECT *
                        FROM "subscribers"
                        WHERE source_id = $1 AND target_id = $2
                    `, [ info?.id, data?.id ]);

                    data.controls = {
                        is_subscribe: result?.rows?.length > 0,
                        is_me: data?.id == info?.id
                    }
                }
                catch(err) {}
            }

            res.status(200).json(data);
        }
        catch(err) {
            if (err instanceof CustomError)
                throw err;

            

            console.error("[info]", err.toString());
            throw "Неизвестная ошибка";
        }
    }
    catch(err) {
        console.error("[info]", err.toString());
        res.status(422).json({
            msg: err.toString()
        });
    }
}