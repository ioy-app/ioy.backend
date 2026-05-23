import getGameById from "@/services/games/getGameById.js";
import es from "@/lib/elasticsearch.js";
import Request from "@/types/request";
import { Response } from "express";
const per_page = 10;
import { search } from "@/services/search";

/**
 * Get all games
 * @param req - Request
 * @param res - Response
*/
const getGames = async(req: Request, res: Response): Promise<void> => {
    const offset = Number(req?.query?.offset || 0);
    const count = Number(req?.query?.count || per_page);
    const query_search: string = req.query.search && String(req.query.search);

    // Search on games:
    if (query_search) {
        const [ ids, total ] = await search("games", query_search, offset, count);
        const items = [];
        for (const id of ids) {
            const data = await getGameById(Number(id));
            items.push(data);
        }

        res.status(200).json({
            items,
            offset,
            limit: count,
            total
        });
        return;
    }

    const { hits } = await es.search({
        index: "games",
        from: offset,
        size: count,
        sort: [
            { likes: { order: "desc" } },
            { comments: { order: "desc" } },
            { date_created: { order: "desc" } }
        ]
    });

    const items = [];
    for (const game of hits.hits) {
        const data = await getGameById(Number(game._id));
        items.push(data);
    }

    res.status(200).json({
        items,
        offset,
        limit: count,
        total: hits?.total?.value
    });
}

export default getGames;