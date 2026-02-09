import { Request, Response } from "express";
import { getJam, getJams as getJamsService } from "@/services/jams";
import Jam from "@/schemas/jam";

/**
 * Get jams between date
 * @param req - Request
 * @param res - Response
*/
const getJams = async(req: Request, res: Response): Promise<void> => {
    const date_from = req?.query?.date_from && String(req?.query?.date_from);
    const date_to = req?.query?.date_to && String(req?.query?.date_to);

    const [ ids, total ] = await getJamsService(date_from, date_to);
    const items: Jam[] = [];
    for (const id of ids) {
        const { theme, ...jam } = await getJam(id);
        items.push(jam);
    }

    res.status(200).json({
        items,
        total
    });
}

export default getJams;