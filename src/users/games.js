import { DB } from "../../index.js";
import CustomError from "../customError.js";
import jwt from "jsonwebtoken";
import { secret } from "../../index.js";

export default async function Games(req, res) {
    try {
        const { login } = req.params;
        const { limit } = req.query;
        try {
            const result = await DB.query(`
                SELECT 
                    g.id
                FROM "games" g
                JOIN "users" u
                ON g.creater_id = u.id
                WHERE
                    g.creater_id = u.id AND
                    u.login = $1
                    AND u.privacy->'games' = 'true'::jsonb
                ORDER BY g.date_created DESC
                OFFSET 0 LIMIT $2
            `, [ login, limit || 5 ]);

            const data = result?.rows;
            res.status(200).json(data);
        }
        catch(err) {
            if (err instanceof CustomError)
                throw err;

            console.error("[info, games]", err.toString());
            throw "Неизвестная ошибка";
        }
    }
    catch(err) {
        console.error("[info, games]", err.toString());
        res.status(422).json({
            msg: err.toString()
        });
    }
}