import getUserSubs from "@/services/subscribers/getUserSubs";
import getUserId from "@/services/users/getUserId";
import { Request, Response } from "express";

/**
 * Получение списка подписок на других пользователей
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const getUserSubscribers = async (req: Request, res: Response): Promise<void> => {
    const { login } = req.params;
    const offset: number = req.query.offset && Number(req.query.offset);
    const limit: number = req.query.limit && Number(req.query.limit);

    const id = await getUserId(login);
    const [ items, total ] = await getUserSubs(id, "user", offset, limit);
    
    res.status(200).json({
        items,
        offset,
        limit,
        total
    });
}

export default getUserSubscribers;