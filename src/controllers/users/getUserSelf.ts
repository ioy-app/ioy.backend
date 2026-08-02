import { Response } from "express";
import { UserDetails } from "@/types/user";
import Request from "@/types/request";
import dayjs from "dayjs";
import AccessError from "@/utils/AccessError";
import { getSubsCounterByInstance } from "@/services/subscribers";
import promisegRPC from "@/utils/promisegRPC";
import { serviceUsers } from "index";

/**
 * Get self data
 * 
 * @param req
 * @param res
*/
const getUserSelf = async (req: Request, res: Response): Promise<void> => {
  const login = await promisegRPC(serviceUsers, "GetUserLogin", { user_id: req?.user_id });
	const data: UserDetails = await promisegRPC(serviceUsers, "GetUser", { login });

  if (data?.date_ban && dayjs(data?.date_ban).isAfter(dayjs()))
      throw new AccessError("getUserSelf", "errors.denied");

  data.subscribers = await getSubsCounterByInstance(data.id, "user");
  data.notify = await promisegRPC(serviceUsers, "GetUserNotify", { login });

  res.status(200).json(data);
}

export default getUserSelf;
