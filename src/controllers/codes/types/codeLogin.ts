import promisegRPC from "@/utils/promisegRPC";
import createSession from "@services/sessions/createSession";
import createToken from "@services/sessions/createToken";
import { Request, Response } from "express";
import { serviceUsers } from "index";

/**
 * Вход в систему
 * 
 * @param {any} payload Данные одноразового кода
 * @param {Request} req 
 * @param {Response} res 
*/
const CodeLogin = async (payload: any, req: Request, res: Response): Promise<void> => {
		const { value: login } = await promisegRPC(serviceUsers, "GetUserEmailLogin", { email: payload?.email });
		const user = await promisegRPC(serviceUsers, "GetUser", { login });
    const session = await createSession(user?.id, req.ip?.split(":")?.at(-1), req.get("User-Agent"));

    res.cookie("refresh_token", session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000
    });

    const token = await createToken(session.token);
    res.status(200).json({
        token,
        id: user?.id,
        login: user?.login,
        is_avatar: user?.is_avatar,
				is_banner: user?.is_banner,
				is_donut: user?.is_donut
    });
}

export default CodeLogin;
