import { Request, Response } from "express";
import getUserGamesService from "@/services/users/getUserGames";
import getUser from "@/services/users/getUser";

/**
 * Получение пользовательских игр
 * 
 * @param {Request} req 
 * @param {Response} res 
 * @returns 
*/
const getUserGames = async (req: Request, res: Response): Promise<void> => {
    const { login } = req.params;
    const { offset, limit } = req.query;

    const user = await getUser(login);
    if (!user?.privacy?.games) {
        res.status(200).json({
            items: [],
            offset,
            limit,
            total: 0
        });
        return;
    }

    const [ items, total ] = await getUserGamesService(Number(user.id), Number(offset || 0), Number(limit || 5));
    res.status(200).json({
        items,
        offset,
        limit,
        total
    });
}

export default getUserGames;