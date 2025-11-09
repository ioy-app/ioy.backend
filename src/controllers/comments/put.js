import db from "@lib/db";
import CustomError from "../../utils/CustomError.js";

export default async function Put(req, res) {
    try {
        const { commentid } = req.params;
        try {
            const { comment } = req.body;
            if (!comment)
                throw new CustomError("comments, put", "Пустое поле");

            const result = await db.query(`
                UPDATE "comments" SET comment=$1, date_updated=NOW() WHERE id=$2 AND source_id=$3
            `, [ comment, commentid, req.user_id ]);


            res.status(200).json({
                msg: "ok"
            });
        }
        catch(err) {
            if (err instanceof CustomError)
                throw err;

            console.error("[comments, put]", err.toString());
            throw "Неизвестная ошибка";
        }
    }
    catch(err) {
        console.error("[comments, put]", err.toString());
        res.status(422).json({
            msg: err.toString()
        });
    }
}