import { deletePicture, getPicture } from "@/services/pictures";
import Request from "@/types/request";
import AccessError from "@/utils/AccessError";
import ContentError from "@/utils/ContentError";
import { Response } from "express";

/**
 * Delete picture
 * 
 * @param payload - Code data
 * @param req - Request 
 * @param res - Response 
*/
const CodeDeletePicture = async (
    payload: {
        id: number;
    },
    req: Request,
    res: Response
): Promise<void> => {
    const picturedata = await getPicture(Number(payload.id));
    if (picturedata?.creater_id != req.user_id)
        throw new AccessError("CodeDeletePicture", "errors.denied");

    const isDeleted = await deletePicture(picturedata?.id);
    if (isDeleted) {
        res.status(200).json({
            deleted: true,
            id: picturedata?.id
        });
        return;
    }

    throw new ContentError("CodeDeletePicture", "errors.exists");
}

export default CodeDeletePicture;