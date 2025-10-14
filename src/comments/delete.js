import { DB } from "../../index.js";
import CustomError from "../customError.js";
import jwt from "jsonwebtoken";
import { secret } from "../../index.js";

export default async function Delete(req, res) {
    try {
        const authHeader = req?.headers?.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        const { commentid } = req.params;
        try {
            const { id } = jwt.verify(token, secret);

            if (!id)
                throw new CustomError("comments, post", "Нет авторизации");

            const result = await DB.query(`
                UPDATE "comments" SET deleted=true, comment=NULL, source_id=NULL WHERE id=$1 AND source_id=$2
            `, [ commentid, id ]);


            res.status(200).json({
                msg: "ok"
            });
        }
        catch(err) {
            if (err instanceof CustomError)
                throw err;

            console.error("[comments, delete]", err.toString());
            throw "Неизвестная ошибка";
        }
    }
    catch(err) {
        console.error("[comments, delete]", err.toString());
        res.status(422).json({
            msg: err.toString()
        });
    }
}