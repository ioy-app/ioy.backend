import jwt from "jsonwebtoken";
import { DB, secret } from "../../../index.js";

import CustomError from "../../customError.js";

export default async function Login(data, req, res) {
    if (!DB.connected)
        throw "Нет связи с базой данных";

    try {
        const result = await DB.query(`
            SELECT id, email, login FROM "users"
            WHERE 
            email=$1 AND
            active=true AND
            date_ban is NULL AND
            date_deleted is NULL
        `, [ data?.payload?.email ]);
        
        if (!result?.rows?.length)
            throw new CustomError("codes, login", "Такого пользователя не существует");

        const user = result?.rows?.at(0);
        res.status(200).json({
            ...user,
            token: jwt.sign({
                id: user.id,
                email: user.email,
                login: user.login
            }, secret, {
                expiresIn: "1h"
            })
        });
    }
    catch(err) {
        if (err instanceof CustomError)
            throw err;

        console.error("[codes, login]", err.toString());
        throw "Неизвестная ошибка";
    }
}