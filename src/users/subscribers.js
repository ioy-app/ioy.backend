import { DB } from "../../index.js";
import CustomError from "../customError.js";
import jwt from "jsonwebtoken";
import { secret } from "../../index.js";

export default async function Subscribers(req, res) {
    try {
        const { login } = req.params;
        const { limit } = req.query;
        try {
            const result = await DB.query(`
                SELECT 
                    tu.id,
                    tu.login,
                    subs.date_created
                FROM "subscribers" subs
                JOIN "users" u
                ON subs.source_id = u.id AND u.login = $1
                JOIN "users" tu
                ON subs.target_id = tu.id
                WHERE
                    subs.target_type = 'user'
                    AND u.privacy->'subscribers' = 'true'::jsonb
                ORDER BY subs.date_created DESC
                OFFSET 0 LIMIT $2
            `, [ login, limit || 5 ]);

            const data = result?.rows;
            res.status(200).json(data);
        }
        catch(err) {
            if (err instanceof CustomError)
                throw err;

            console.error("[info, subscribers]", err.toString());
            throw "Неизвестная ошибка";
        }
    }
    catch(err) {
        console.error("[info, subscribers]", err.toString());
        res.status(422).json({
            msg: err.toString()
        });
    }
}