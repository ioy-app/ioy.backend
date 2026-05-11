import Request from "@/types/request";
import { Response } from "express";
import { getPicture as getPictureService } from "@/services/pictures";
import ContentError from "@/utils/ContentError";
import { getJam } from "@/services/jams";
import Role from "@/types/role";
import verify from "@/utils/verify";
import getUserLogin from "@/services/users/getUserLogin";
import getUser from "@/services/users/getUser";
import { checkLikeByInstance } from "@/services/likes";
import { getRole } from "@/services/roles";
import { checkSubscribe } from "@/services/subscribers";

/**
 * Get picture info
 * @param req - Request
 * @param res - Response
*/
const getPicture = async(req: Request, res: Response): Promise<void> => {
  const id = req?.params?.id && Number(req?.params?.id) || -1;

  const data = await getPictureService(id);
  if (!data)
    throw new ContentError("getPicture", "errors.exists");

  if (data?.status != "public" && req?.user_id != data?.creater_id) {
      res.status(404).end();
      return;
  }

  let jamdata;
  if (data.jam_id) {
      jamdata = await getJam(data?.jam_id);
  }

  const login = await getUserLogin(data?.creater_id);
  data.creater_data = await getUser(login);

  let is_like: boolean;
  let is_me: boolean;
  let is_vote: boolean;
  let roledata: Role = {};

  if (req?.token) {
    const { id: user_id } = await verify(req?.token);
    const login = await getUserLogin(Number(user_id));
    const userdata = await getUser(login);

    is_like = await checkLikeByInstance(Number(user_id), id, "picture");
    is_me = Boolean(Number(user_id) == Number(data?.creater_id));
    const role = await getRole(userdata?.role_id);
    roledata = role;

    if (jamdata?.status == "voting") {
      switch(jamdata?.vote_type) {
        case "judges": {
          if (jamdata?.judges?.length && jamdata?.judges?.includes(user_id))
            is_vote = true;
        } break;
        case "members": {
          const isMember = await checkSubscribe(user_id, jamdata?.id, "jam");
          is_vote = isMember;
        } break;
        case "all":
          is_vote = true;
        break;
      }
    }
  }

  const obj = {
    ...data,
    is_like,
    is_me,
    roledata,
    jamdata,
    is_vote
  }
  
  res.status(200).json(obj);
}

export default getPicture;