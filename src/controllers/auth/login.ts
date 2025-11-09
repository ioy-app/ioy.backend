import db from "@lib/db";
import Create from "../codes/create.js";

export default async function Login(req, res) {
    try {
        const { email } = req.body;

        try {
            const result = await db.query(`
                SELECT id, email, login FROM "users"
                WHERE email=$1
            `, [ email ]);
            
            if (!result?.rows?.length)
                throw "Такого пользователя не существует";

            const user = result?.rows?.at(0);
            const code_result = await Create(user.id, {
                type: "login",
                email: email
            });
            console.log(code_result);

            res.status(200).end();
        }
        catch(err) {
            if (err.toString() == "Такого пользователя не существует")
                throw err;

            console.error("[reg]", err.toString());
            throw "Неизвестная ошибка";
        }
    }
    catch(err) {
        console.error("[login]", err.toString());
        res.status(422).json({
            msg: err.toString()
        });
    }
}