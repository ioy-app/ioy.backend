import { getJam } from "@/services/jams";
import { checkSubscribe, putSubscribe } from "@/services/subscribers";
import Request from "@/types/request";
import AccessError from "@/utils/AccessError";
import ContentError from "@/utils/ContentError";
import { Response } from "express";

/**
 * Leave jam
 * @param req - Request
 * @param res - Response
*/
const leaveJam = async(req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const jam_data = await getJam(id);

  if (jam_data.creater_id == req.user_id)
    throw new AccessError("joinJam", "errors.author");

  const isSubscribe = await checkSubscribe(req.user_id, id, "jam");
  if (!isSubscribe)
    throw new ContentError("joinJam", "errors.leaved");

  await putSubscribe(req.user_id, id, "jam");
  res.status(200).end();
}

export default leaveJam;