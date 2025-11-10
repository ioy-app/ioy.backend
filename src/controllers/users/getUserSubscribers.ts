import getUserSubscribersService from "@services/users/getUserSubscribers.js";
import { Request, Response } from "express";

/**
 * Получение списка подписок на других пользователей
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const getUserSubscribers = async (req: Request, res: Response): Promise<void> => {
    const { login } = req.params;

    const data = await getUserSubscribersService(login, req.query);
    res.status(200).json(data);
}

export default getUserSubscribers;