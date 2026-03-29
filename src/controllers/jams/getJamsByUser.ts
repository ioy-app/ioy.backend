import Jam from "@/schemas/jam";
import { getJamsByUser as getJamsByUserService } from "@/services/jams";
import { getJam } from "@/services/jams";
import { getUserSubs } from "@/services/subscribers";
import Request from "@/types/request";
import { Response } from "express";

/**
 * Get all jams by user
 * 
 * @param req - Request 
 * @param res - Response 
*/
const getJamsByUser = async (req: Request, res: Response): Promise<void> => {
    const offset: number = req.query.offset && Number(req.query.offset);
    const limit: number = req.query.limit && Number(req.query.limit);
    const search: string = req.query?.search && String(req.query.search) || undefined;
    const sort: "new" | "old" = (req.query.sort && req.query.sort) as ("new" | "old");
    const jams: "author" | "join" | "judge" = (req.query.jams && req.query.jams) as ("author" | "join" | "judge");
    
    let jams_ids, total;
    switch(jams) {
        default: {
            [ jams_ids, total ] = await getJamsByUserService(
                Number(req.user_id),
                offset,
                limit,
                search,
                sort
            );
        } break;
        case "join" : {
            [ jams_ids, total ] = await getUserSubs(
                Number(req.user_id),
                "jam",
                offset,
                limit,
                sort
            );
        } break;
    }

    const items: Jam[] = [];
    for (const id of jams_ids) {
        const game = await getJam(Number(id));
        items.push({
            ...game
        });
    }

    res.status(200).json({
        items,
        offset,
        limit,
        total
    });
}

export default getJamsByUser;