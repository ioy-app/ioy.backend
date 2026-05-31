import Request from "@/types/request";
import { Response } from "express";
import { getLikes as getLikesService } from "@/services/dashboard";
import { getLikesByInstance } from "@/services/likes";
import { getComments } from "@/services/comments";
import { getGameById } from "@/services/games";
import { getPicture } from "@/services/pictures";
import getUserLogin from "@/services/users/getUserLogin";
import getUser from "@/services/users/getUser";

/**
 * Get all likes instance by user
 * @param req - Request
 * @param res - Response
*/
const getLikes = async(req: Request, res: Response): Promise<void> => {
  const { offset, limit, ...filters } = req?.query;

  const items = [];
  const [ insts, total ] = await getLikesService(
    Number(req?.user_id),
    filters,
    Number(offset) || 0,
    Number(limit) || 10
  );

  for (const { id, type, date_created } of insts) {
    const likes = await getLikesByInstance(id, type);
    const [ _, comments ] = await getComments(Number(id), 0, 1, type);
    
    try {
      switch(type) {
        case "game": {
          const data = await getGameById(id);
          const author_login = await getUserLogin(data.creater_id);
          const creater_data = await getUser(author_login);
          items.push({
            ...data,
            likes,
            comments,
            type,
            creater_data,
            like_created: date_created
          });
        } break;
        case "picture": {
          const data = await getPicture(id);
          const author_login = await getUserLogin(data.creater_id);
          const creater_data = await getUser(author_login);
          items.push({
            ...data,
            likes,
            comments,
            type,
            creater_data,
            like_created: date_created
          });
        } break;
      }
    }
    catch {}
  }
  
  res.status(200).json({
    items,
    total,
    offset,
    limit
  });
}

export default getLikes;