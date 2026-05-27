import { getComments } from "@/services/comments";
import { getInstances as getInstancesService } from "@/services/dashboard";
import { getGameById } from "@/services/games";
import { getLikesByInstance } from "@/services/likes";
import { getPicture } from "@/services/pictures";
import Request from "@/types/request";
import { Response } from "express";

/**
 * Get dashboard's instances
 * @param req - Request
 * @param res - Response
*/
const getInstances = async(req: Request, res: Response): Promise<void> => {
  const { offset, limit, ...filters } = req?.query;

  const items = [];
  const [ insts, total ] = await getInstancesService(
    Number(req?.user_id),
    filters,
    Number(offset) || 0,
    Number(limit) || 10
  );

  for (const { id, type } of insts) {
    const likes = await getLikesByInstance(id, type);
    const [ _, comments ] = await getComments(Number(id), 0, 1, type);

    switch(type) {
      case "game": {
        const data = await getGameById(id);
        items.push({
          ...data,
          likes,
          comments,
          type
        });
      } break;
      case "picture": {
        const data = await getPicture(id);
        items.push({
          ...data,
          likes,
          comments,
          type
        });
      } break;
    }
  }
  
  res.status(200).json({
    items,
    total,
    offset,
    limit
  });
}

export default getInstances;