import { createCode } from "@/services/codes";
import { getJam } from "@/services/jams";
import Request from "@/types/request";
import AccessError from "@/utils/AccessError";
import { Response } from "express";

/**
 * Delete jam
 * @param req - Request
 * @param res - Response
*/
const deleteJam = async(req: Request, res: Response): Promise<void> => {
    try {
        const jam = await getJam(Number(req.params.id));
        if (req.user_id != jam.creater_id)
            throw new AccessError("deleteJam", "errors.denied");
        const code = await createCode(req.user_id, { type: "delete_jam", id: jam.id });
        console.log(code);
    }
    finally { res.status(200).end(); }
}

export default deleteJam;