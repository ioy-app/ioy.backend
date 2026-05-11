import Request from "@/types/request";
import { Response } from "express";
import { getPicture } from "@/services/pictures";
import ContentError from "@/utils/ContentError";
import AccessError from "@/utils/AccessError";
import { createCode } from "@/services/codes";

/**
 * Delete picture
 * @param req - Request
 * @param res - Response
*/
const deletePicture = async(req: Request, res: Response): Promise<void> => {
  try {
    const picturedata = await getPicture(Number(req?.params?.id));
    if (!picturedata)
      throw new ContentError("deletePicture", "errors.exists");

    if (req?.user_id != picturedata?.creater_id)
      throw new AccessError("deletePicture", "errors.denied");

    const code = await createCode(req.user_id, {
      type: "delete_picture",
      id: picturedata.id
    });
    console.log(code);
  }
  finally { res.status(200).end(); }
}

export default deletePicture;