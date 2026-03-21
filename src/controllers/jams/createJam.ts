import { createJam as createJamService, putJamFile } from "@/services/jams";
import Request from "@/types/request";
import AccessError from "@/utils/AccessError";
import { Response } from "express";

/**
 * Create a new jam
 * @param req - Request
 * @param res - Response
*/
const createJam = async(req: Request, res: Response): Promise<void> => {
  const {
    title,
    theme,
    description,
    date_started,
    date_finished,
    date_vote_started,
    date_vote_finished,
    vote_type,
    nominations,
    judges
  } = req.body;

  if (req?.files?.icon?.[0]) {
    if (req?.files?.icon?.[0]?.size > (1 * 1024 * 1024))
        throw new AccessError("editGame", "errors.icon_limit");
    if (req?.files?.icon?.[0]?.mimetype != "image/png")
        throw new AccessError("editGame", "errors.icon_type");
  }

  const response = await createJamService(
    Number(req.user_id),
    title,
    theme,
    date_started,
    date_finished,
    date_vote_started,
    date_vote_finished,
    nominations,
    vote_type,
    description,
    judges?.map(judge => Number(judge?.id))
  );

  let is_avatar;
  if (req?.files?.icon?.[0]) {
    await putJamFile(
      response?.id,
      "icon.png",
      req.files.icon?.[0]?.buffer,
      req.files.icon?.[0]?.size
    );
    is_avatar = true;
  }

  res.status(200).json({
    ...response,
    is_avatar
  });
}

export default createJam;