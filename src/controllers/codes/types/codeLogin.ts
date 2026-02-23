import createSession from "@services/sessions/createSession";
import createToken from "@services/sessions/createToken";
import getUserEmail from "@services/users/getUserEmail";
import { Request, Response } from "express";

/**
 * Вход в систему
 * 
 * @param {any} payload Данные одноразового кода
 * @param {Request} req 
 * @param {Response} res 
*/
const CodeLogin = async (payload: any, req: Request, res: Response): Promise<void> => {
    const user = await getUserEmail(payload?.email);
    console.log(user);
    const { id, login, is_avatar } = user;
    const session = await createSession(id, req.ip, req.get("User-Agent"));

    res.cookie("refresh_token", session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000
    });

    const token = await createToken(session.token);
    res.status(200).json({
        token,
        id,
        login,
        is_avatar
    });
}

export default CodeLogin;