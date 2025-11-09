import getUser from "@/services/users/getUser";
import getUserLogin from "@/services/users/getUserLogin";
import Request from "@/types/request";
import { Response } from "express";

/**
 * Получение данных о пользователе
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const Me = async (req: Request, res: Response): Promise<void> => {
    const login = await getUserLogin(Number(req.user_id));

    const data = await getUser(login);
    res.status(200).json(data);
}

export default Me;