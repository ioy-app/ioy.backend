import Request from "@/types/request";
import AccessError from "@/utils/AccessError";
import ContentError from "@/utils/ContentError";
import { Response } from "express";
import { createPicture as createPictureService, getPicture } from "@/services/pictures";
import { getJam } from "@/services/jams";
import { getGameById } from "@/services/games";

/**
 * Add new picture
 * @param req - Request
 * @param res - Response
*/
const createPicture = async(req: Request, res: Response): Promise<void> => {
  const { user_id } = req;
  const image = req?.files?.image?.[0];

  if (!image)
    throw new ContentError("createPicture", "errors.required.image");
  
  if (image?.size > (3 * 1024 * 1024))
    throw new AccessError("createPicture", "errors.image_limit");
  if (image?.mimetype != "image/png")
      throw new AccessError("createPicture", "errors.image_type");

  if (req?.body?.jam_id) {
      const jam_id = Number(req?.body?.jam_id);
      const jamdata = await getJam(jam_id);

      if (jamdata?.status != "in_process")
          throw new AccessError("createPicture", "errors.denied");

      if (jamdata?.judges?.length && jamdata?.judges?.includes(user_id))
          throw new AccessError("createPicture", "errors.denied");

      if (jamdata?.creater_id == user_id)
          throw new AccessError("createPicture", "errors.denied");

      req.body.status = "public";
  }

  if (req?.body?.game_id) {
    const gamedata = await getGameById(Number(req?.body?.game_id));
    if (!gamedata || gamedata?.status != "public")
      throw new ContentError("createPicture", "errors.exists");

    req.body.game_id = Number(req?.body?.game_id);
  }

  if (typeof(req?.body?.is_background) == "string")
        req.body.is_background = Boolean(req?.body?.is_background);

  const id = await createPictureService(
    user_id,
    req?.body?.title,
    req?.body?.description,
    req?.body?.tags,
    req?.body?.jam_id,
    req?.body?.status,
    req?.body?.is_background,
    req?.body?.game_id,
    image
  );

  if (!id)
    throw new ContentError("createPicture", "errors.unknown");

  const picturedata = await getPicture(id);
  res.status(200).json(picturedata);
}

export default createPicture;