import { DB } from "../../index.js";
import CustomError from "../customError.js";

export default async function All(req, res) {
    try {
        try {
            const result = await DB.query(`
                SELECT
                    id, ip, user_agent, date_created, date_expires
                FROM "refresh_tokens"
                WHERE uid=$1
            `, [ req.user_id ]);

            if (!result?.rows?.length)
                throw new CustomError("subscribe, all", "У пользователя нет активных сессий");

            res.status(200).json(result?.rows);
        }
        catch(err) {
            if (err instanceof CustomError)
                throw err;

            console.error("[sessions, all]", err.toString());
            throw "Неизвестная ошибка";
        }
    }
    catch(err) {
        console.error("[sessions, all]", err.toString());
        res.status(422).json({
            msg: err.toString()
        });
    }
}