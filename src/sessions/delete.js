import { DB } from "../../index.js";
import CustomError from "../customError.js";

export default async function Delete(req, res) {
    try {
        try {
            const { id } = req.params;

            const result = await DB.query(`
                DELETE
                FROM "refresh_tokens"
                WHERE uid=$1 AND id=$2
                RETURNING 1
            `, [ req.user_id, id ]);

            if (!result?.rows?.length)
                throw new CustomError("subscribe, delete", "Такой сессии не существует");

            res.status(200).end();
        }
        catch(err) {
            if (err instanceof CustomError)
                throw err;

            console.error("[sessions, delete]", err.toString());
            throw "Неизвестная ошибка";
        }
    }
    catch(err) {
        console.error("[sessions, delete]", err.toString());
        res.status(422).json({
            msg: err.toString()
        });
    }
}