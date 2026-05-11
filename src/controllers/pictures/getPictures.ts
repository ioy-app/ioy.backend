import es from "@/lib/elasticsearch";
import { getPicture } from "@/services/pictures";
import { Request, Response } from "express";

const per_page = 10;

/**
 * Get pictures global
 * @param req - Request
 * @param res - Response
*/
const getPictures = async(req: Request, res: Response): Promise<void> => {
  const { hits } = await es.search({
    index: "pictures",
    from: req?.query?.offset || 0,
    size: per_page,
    sort: [
      { date_created: { order: "desc" } }
    ]
  });

  const pictures = [];
  for (const picture of hits?.hits || []) {
    const data = await getPicture(Number(picture?._id));
    pictures.push(data);
  }

  res.status(200).json({
    items: pictures,
    offset: Number(req?.query?.offset || 0),
    limit: per_page,
    total: hits?.total?.value
  });
}

export default getPictures;