import { Response } from "express";
import getUserFollowers from "@services/users/getUserFollowers";
import { default as getUserService } from "@services/users/getUser";
import getUserControls from "@services/users/getUserControls";
import verify from "@utils/verify";
import { UserDetails } from "@/types/user";
import Request from "@/types/request";
import dayjs from "dayjs";
import AccessError from "@/utils/AccessError";
import getUserLogin from "@/services/users/getUserLogin";
import getUserNotify from "@/services/users/getUserNotify";

/**
 * Get self data
 * 
 * @param req
 * @param res
*/
const getUserSelf = async (req: Request, res: Response): Promise<void> => {
  const login = await getUserLogin(req.user_id);
  const data: UserDetails = await getUserService(login);

  if (data?.date_ban && dayjs(data?.date_ban).isAfter(dayjs()))
      throw new AccessError("getUserSelf", "errors.denied");

  data.subscribers = await getUserFollowers(data.id);
  data.notify = await getUserNotify(login);

  res.status(200).json(data);
}

export default getUserSelf;