import { DB, secret } from "../index.js";
import CustomError from "./customError.js";
import jwt from "jsonwebtoken";

export default async function Me(req, res) {
    try {
        const result = await DB.query(`
            SELECT
                id, login
            FROM "users"
            WHERE id=$1
        `, [ req.user_id ]);

        if (!result.rows.length)
            throw "Пользователь не найден";

        res.status(200).json({
            id: req.user_id,
            login: result.rows[0].login
        });
    }
    catch(err) {

        console.error("[me]", err.toString());
        res.status(422).json({
            msg: err.toString()
        });
    }
}