import { getFeedGlobal as getFeedGlobalService, getFeedPost } from "@/services/feed";
import getUser from "@/services/users/getUser";
import getUserLogin from "@/services/users/getUserLogin";
import Request from "@/types/request";
import { Response } from "express";

/**
 * Get global feed
 * @param req - Request
 * @param res - Response
*/
const getFeedGlobal = async(req: Request, res: Response): Promise<void> => {
  const offset = req?.query?.offset && Number(req?.query?.offset) || 0;
  const limit = req?.query?.limit && Number(req?.query?.limit) || 20;

  const [ content, total ] = await getFeedGlobalService(offset, limit);
  const items = [];

  for (const item of content) {
    try {
      const data = await getFeedPost(item?.id, item?.type);
      if (!data?.creater_id)
        continue;
      const author_login = await getUserLogin(data?.creater_id);
      if (!author_login)
        continue;
      const author_data = await getUser(author_login);
      items.push({
        ...data,
        type: item?.type,
        author_data
      });
    }
    catch(err) {  }
  }

  res.status(200).json({
      items,
      offset,
      limit,
      total
  });
}

export default getFeedGlobal;