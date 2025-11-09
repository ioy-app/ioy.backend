import db from "@lib/db";
import Login from "./types/login";
import CustomError from "../../utils/CustomError";

export default async function Check(req, res) {
    try {
        const { code } = req.body;

        try {
            
            const result = await db.query(`
                SELECT * FROM "codes"
                WHERE code=$1
                AND (NOW() - date_created) < interval '5 minutes'
            `, [ code ]);

            if (!result?.rows?.length)
                throw new CustomError("codes", "Неверный код подтверждения");

            const data = result?.rows?.at(0);
            const { payload, uid, id } = data;
            const result_deleted = await db.query(`
                DELETE FROM "codes"
                WHERE id=$1 OR 
                (NOW() - date_created) >= interval '5 minutes'
            `, [ id ]);
            console.log("[codes]", `clear ${result_deleted.rows.length} rows!`);

            
            switch(payload?.type) {
                case "login":
                    // Вход в систему:
                    return await Login(data, req, res);
                break;
            }
        }
        catch(err) {
            if (err instanceof CustomError)
                throw err;

            console.error("[codes]", err.toString());
            throw "Неизвестная ошибка";
        }
    }
    catch(err) {
        console.error("[codes]", err.toString());
        res.status(422).json({
            msg: err.toString()
        });
    }
}