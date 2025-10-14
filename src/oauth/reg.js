import { DB } from "../../index.js";

export default async function Reg(req, res) {
    try {
        const { login, email } = req.body;

        if (!DB.connected)
            throw "Нет связи с базой данных";

        try {
            const result = await DB.query(`
                INSERT INTO "users" (login, email)
                SELECT $1, $2
                WHERE NOT EXISTS (
                    SELECT 1 FROM "users"
                    WHERE login = $1 OR email = $2
                )
                RETURNING id;
            `, [ login, email ]);
            
            if (!result.rows.length)
                throw "Логин или почта уже заняты";
        }
        catch(err) {
            if (err.toString() == "Логин или почта уже заняты")
                throw err;

            console.error("[reg]", err.toString());
            throw "Неизвестная ошибка";
        }
        
        res.status(200);
    }
    catch(err) {
        console.error("[reg]", err.toString());
        res.status(422).json({
            msg: err.toString()
        });
    }
}