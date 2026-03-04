import { Request, Response } from "express";
import getUserLikesService from "@/services/users/getUserLikes";
import getUser from "@/services/users/getUser";
import Game from "@/schemas/game";
import { getGameById } from "@/services/games";

/**
 * Получение пользовательских игр
 * 
 * @param req - Запрос 
 * @param res - Ответ 
*/
const getUserLikes = async (req: Request, res: Response): Promise<void> => {
    const { login } = req.params;
    const { offset, limit, sort } = req.query;

    const user = await getUser(login);
    if (!user?.privacy?.likes && (user.id != req?.user_id)) {
        res.status(200).json({
            items: [],
            offset,
            limit,
            total: 0
        });
        return;
    }

    const [ items, total ] = await getUserLikesService(
        Number(user.id),
        Number(offset || 0),
        Number(limit || 5),
        sort as ("new" | "old")
    );
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

export default getUserLikes;