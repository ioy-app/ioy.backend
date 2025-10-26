import { DB } from "../../index.js";
import CustomError from "../customError.js";
import jwt from "jsonwebtoken";
import { secret } from "../../index.js";

export default async function Delete(req, res) {
    try {
        const { commentid } = req.params;
        try {

            const result = await DB.query(`
                UPDATE "comments" SET deleted=true, comment=NULL, source_id=NULL WHERE id=$1 AND source_id=$2
            `, [ commentid, req.user_id ]);


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