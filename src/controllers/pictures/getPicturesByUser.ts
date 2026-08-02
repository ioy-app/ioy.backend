import { getPicture, getPictures } from "@/services/pictures";
import Picture from "@/types/picture";
import Request from "@/types/request";
import promisegRPC from "@/utils/promisegRPC";
import { Response } from "express";
import { serviceUsers } from "index";

/**
 * Get all pictures by author
 * @param req - Request
 * @param res - Response
*/
const getPicturesByUser = async (req: Request, res: Response): Promise<void> => {
  const { login } = req.params;
  const offset: number = req.query.offset && Number(req.query.offset);
  const limit: number = req.query.limit && Number(req.query.limit);
  const status: string = "public";
  const search: string = req.query?.search && String(req.query.search) || undefined;
  const sort: "new" | "old" = (req.query.sort && req.query.sort) as ("new" | "old");

  const userdata = await promisegRPC(serviceUsers, "GetUser", { login });
  const [ ids, total ] = await getPictures(
    offset,
    limit,
    search,
    Number(userdata?.id),
    sort,
    status
  );

    const items: Picture[] = [];
    for (const id of ids) {
        const picture = await getPicture(Number(id));
        items.push(picture);
    }

    res.status(200).json({
        items,
        offset,
        limit,
        total
    });
}

export default getPicturesByUser;
