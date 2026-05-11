import Request from "@/types/request";
import { Response } from "express";
import { editPicture as editPictureService, getPicture } from "@/services/pictures";
import ContentError from "@/utils/ContentError";
import AccessError from "@/utils/AccessError";
import { getJam } from "@/services/jams";
import { getGameById } from "@/services/games";

/**
 * Edit picture data
 * @param req - Request
 * @param res - Response
*/
const editPicture = async(req: Request, res: Response): Promise<void> => {
  const { user_id } = req;
  const image = req?.files?.image?.[0];

  const picturedata = await getPicture(Number(req?.params?.id));
  if (!picturedata)
    throw new ContentError("editPicture", "errors.exists");
  if (picturedata?.creater_id != Number(user_id))
    throw new AccessError("editPicture", "errors.denied");

  if (!image)
    throw new ContentError("editPicture", "errors.required.image");
  
  if (image?.size > (3 * 1024 * 1024))
    throw new AccessError("editPicture", "errors.image_limit");
  if (image?.mimetype != "image/png")
    throw new AccessError("editPicture", "errors.image_type");

  if (req?.body?.jam_id) {
    const jam_id = Number(req?.body?.jam_id);
    const jamdata = await getJam(jam_id);

    if (jamdata?.status != "in_process")
      throw new AccessError("editPicture", "errors.denied");

    if (jamdata?.judges?.length && jamdata?.judges?.includes(user_id))
      throw new AccessError("editPicture", "errors.denied");

    if (jamdata?.creater_id == user_id)
      throw new AccessError("editPicture", "errors.denied");

    req.body.status = "public";
  }

  if (req?.body?.game_id) {
    const gamedata = await getGameById(Number(req?.body?.game_id));
    if (!gamedata || gamedata?.status != "public")
      throw new ContentError("editPicture", "errors.exists");

    req.body.game_id = Number(req?.body?.game_id);
  }

  if (typeof(req?.body?.is_background) == "string")
    req.body.is_background = Boolean(req?.body?.is_background);

  const obj = await editPictureService(
    Number(req?.params?.id),
    req?.body,
    image
  );
  
  res.status(200).json(obj);
}

export default editPicture;