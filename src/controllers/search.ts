import Game from "@/schemas/game";
import { getGameById } from "@/services/games";
import { searchGames } from "@/services/search";
import getUser from "@/services/users/getUser";
import getUserId from "@/services/users/getUserId";
import getUserLogin from "@/services/users/getUserLogin";
import { Request, Response } from "express";

const Search = async (req: Request, res: Response): Promise<void> => {
    const search: string = req.query.search && String(req.query.search);
    const type = req.query.type;

    const offset: number = req.query.offset && Number(req.query.offset);
    const limit: number = req.query.limit && Number(req.query.limit);

    const [ items, total ] = await searchGames(search, offset, limit);
    console.log(items);
    const data: Game[] = [];
    for (const id of items) {
        
        const game = await getGameById(Number(id));
        const author = await getUser(await getUserLogin(Number(game.creater_id)));
        data.push({
            ...game,
            creater_data: author
        });
    }

    res.status(200).json({
        items: data,
        offset,
        limit,
        total
    });
}

export default Search;