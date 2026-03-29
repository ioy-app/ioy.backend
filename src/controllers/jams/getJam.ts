import { Response } from "express";
import { getJam as getJamService } from "@/services/jams";
import verify from "@/utils/verify";
import getUserLogin from "@/services/users/getUserLogin";
import getUser from "@/services/users/getUser";

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
      const login = await getUserLogin(judge_id);
      const userdata = await getUser(login);

      judges_data.push(userdata);
    }
  }

  const creater_login = await getUserLogin(data?.creater_id);
  const creater_data = await getUser(creater_login);

  let is_join;
  let is_game;
  if (req?.token) {
    const { id: user_id } = await verify(req?.token);
  }

  res.status(200)
    .json({
      ...data,
      judges_data,
      creater_data,
      is_join,
      is_game
    });
}

export default getJam;