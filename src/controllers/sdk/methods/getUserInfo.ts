import getUser from "@/services/users/getUser";
import getUserLogin from "@/services/users/getUserLogin";
import Request from "@/types/request";
import { Response } from "express";

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
    const userLogin = await getUserLogin(req?.user_id);
    const userData = await getUser(userLogin);
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