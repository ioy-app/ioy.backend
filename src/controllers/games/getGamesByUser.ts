import Game from "@/schemas/game";
import { getComments } from "@/services/comments";
import { getGameById, getGamesByUser as getGamesByUserService } from "@/services/games";
import { status } from "@/services/games/getGamesByUser";
import { getLikesByInstance } from "@/services/likes";
import { getSubsCounterByInstance } from "@/services/subscribers";
import Request from "@/types/request";
import { Response } from "express";

/**
 * Get all games by auth user
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const getGamesByUser = async (req: Request, res: Response): Promise<void> => {
    const offset: number = req.query.offset && Number(req.query.offset);
    const limit: number = req.query.limit && Number(req.query.limit);
    const status: string = req.query?.status && String(req.query.status) || undefined;
    const search: string = req.query?.search && String(req.query.search) || undefined;
    const sort: "new" | "old" = (req.query.sort && req.query.sort) as ("new" | "old");
    
    const [ game_ids, total ] = await getGamesByUserService(Number(req.user_id), offset, limit, status as status, search, sort);

    const items: Game[] = [];
    for (const id of game_ids) {
        const game = await getGameById(Number(id));
        const likes = await getLikesByInstance(Number(id), "game");
        const [ _, comments ] = await getComments(Number(id), 0, 1, "game");
        items.push({
            ...game,
            likes,
            comments
        });
    }

    res.status(200).json({
        items,
        offset,
        limit,
        total
    });
}

export default getGamesByUser;