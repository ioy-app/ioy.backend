import getUser from "@services/users/getUser";
import getUserLogin from "@services/users/getUserLogin";
import Request from "@/types/request";
import { Response } from "express";

/**
 * Получение данных о пользователе
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const Me = async (req: Request, res: Response): Promise<void> => {
    const { user_id, token } = req;

    

    if (!token) {
        res.status(401).end();
        return;
    }

    if (!user_id) {
        res.status(422).end();
        return;
    }

    const login = await getUserLogin(Number(user_id));

    const data = await getUser(login);
    res.status(200).json(data);
}

export default Me;