import { getJam } from "@/services/jams";
import { checkSubscribe, putSubscribe } from "@/services/subscribers";
import Request from "@/types/request";
import AccessError from "@/utils/AccessError";
import ContentError from "@/utils/ContentError";
import { Response } from "express";

/**
 * Join to jam
 * @param req - Request
 * @param res - Response
*/
const joinJam = async(req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const jam_data = await getJam(id);

  if (jam_data.creater_id == req.user_id)
    throw new AccessError("joinJam", "errors.author");

  if (!["in_process", "init"].includes(jam_data?.status))
    throw new AccessError("joinJam", "errors.denied");

  const isSubscribe = await checkSubscribe(req.user_id, id, "jam");
  if (isSubscribe)
    throw new ContentError("joinJam", "errors.joined");

  await putSubscribe(req.user_id, id, "jam");
  res.status(200).end();
}

export default joinJam;