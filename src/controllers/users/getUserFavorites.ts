import Game from "@/schemas/game";
import { getGameById } from "@/services/games";
import getUserSubs from "@/services/subscribers/getUserSubs";
import getUser from "@/services/users/getUser";
import getUserId from "@/services/users/getUserId";
import { Request, Response } from "express";

/**
 * Получение списка избранных
 * 
 * @param req - Запрос 
 * @param res - Ответ 
*/
const getUserFavorites = async (req: Request, res: Response): Promise<void> => {
    const { login } = req.params;
    const offset: number = req.query.offset && Number(req.query.offset);
    const limit: number = req.query.limit && Number(req.query.limit);
    const sort: "new" | "old" = (req.query.sort && req.query.sort) as ("new" | "old");

    const user = await getUser(login);
    if (!user?.privacy?.favorites) {
        res.status(200).json({
            items: [],
            offset,
            limit,
            total: 0
        });
        return;
    }
    
    
    const id = await getUserId(login);

    

    const [ items, total ] = await getUserSubs(id, "game", offset, limit, sort);
    const data: Game[] = [];
    for (const id of items) {
        const game_data = await getGameById(id);
        data.push(game_data);
    }
    
    res.status(200).json({
        items: data,
        offset,
        limit,
        total
    });
}

export default getUserFavorites;