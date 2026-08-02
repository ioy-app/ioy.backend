import Request from "@/types/request";
import promisegRPC from "@/utils/promisegRPC";
import { Response } from "express";
import { serviceUsers } from "index";

/**
 * Get current user info for sdk
 * @param req - Request
 * @param res - Response
*/
const getUserInfo = async(req: Request, res: Response): Promise<void> => {
  let is_auth = req?.is_access;
  let is_avatar = false;
  let is_donut = false;
  let login = null;
  
  try {
    const { value: userLogin } = await promisegRPC(serviceUsers, "GetUserLogin", { user_id: req?.user_id });
    const userData = await promisegRPC(serviceUsers, "GetUser", { login: userLogin });
    is_avatar = Boolean(userData?.is_avatar);
    is_donut = Boolean(userData?.is_donut);
    login = userLogin;
  }
  catch {}

  res.status(200).json({
    is_auth,
    is_avatar,
    is_donut,
    login
  });
}

export default getUserInfo;
