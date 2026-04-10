import { Response } from "express";
import { getJam as getJamService } from "@/services/jams";
import verify from "@/utils/verify";
import getUserLogin from "@/services/users/getUserLogin";
import getUser from "@/services/users/getUser";
import { checkSubscribe } from "@/services/subscribers";
import dayjs from "dayjs";

/**
 * Get jam info by id
 * @param req - Request
 * @param res - Response
*/
const getJam = async(req: Request, res: Response): Promise<void> => {
  const id = Number(req.params?.id);
  const data = await getJamService(id);

  const judges_data = [];
  if (data?.judges) {
    for (const judge_id of data?.judges) {
      try {
        const login = await getUserLogin(judge_id);
        const userdata = await getUser(login);

        judges_data.push(userdata);
      }
      catch(err) {}
    }
  }

  const creater_login = await getUserLogin(data?.creater_id);
  const creater_data = await getUser(creater_login);

  let is_join;
  let is_game;
  let is_author;
  let is_vote;
  if (req?.token) {
    const { id: user_id } = await verify(req?.token);
    is_author = Number(user_id) == data.creater_id;
    if (!is_author)
      is_join = await checkSubscribe(Number(user_id), id, "jam");

    if (data?.status == "voting") {
        switch(data?.vote_type) {
            case "judges":
                if (data?.judges?.length && data?.judges?.includes(user_id))
                  is_vote = true;
            break;
            case "members": {
              const isMember = await checkSubscribe(user_id, id, "jam");
              is_vote = isMember;
            } break;
            case "all":
              is_vote = true;
            break;
        }
    }
  }

  res.status(200)
    .json({
      ...data,
      judges_data,
      creater_data,
      is_join,
      is_game,
      is_author,
      is_vote
    });
}

export default getJam;