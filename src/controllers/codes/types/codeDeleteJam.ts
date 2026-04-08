import { deleteJam, getJam } from "@/services/jams";
import Request from "@/types/request";
import AccessError from "@/utils/AccessError";
import ContentError from "@/utils/ContentError";
import { Response } from "express";

/**
 * Delete jam
 * 
 * @param payload - Code data
 * @param req - Request 
 * @param res - Response 
*/
const CodeDeleteJam = async (
    payload: {
        id: number;
    },
    req: Request,
    res: Response
): Promise<void> => {
    const jam = await getJam(Number(payload.id));
    if (jam.creater_id != req.user_id)
        throw new AccessError("CodeDeleteJam", "errors.denied");

    const isDeleted = await deleteJam(jam.id);
    if (isDeleted) {
        res.status(200).json({
            deleted: true,
            id: jam.id
        });
        return;
    }

    throw new ContentError("CodeDeleteJam", "errors.exists");
}

export default CodeDeleteJam;