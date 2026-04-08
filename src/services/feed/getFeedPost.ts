import { getGameById } from "../games";
import { getJam } from "../jams";

/**
 * Get post data
 * @example
 * return getFeedPost()
*/
const getFeedPost = async (
  id: number,
  type: "game" | "jam"
): Promise<any> => {
  switch(type) {
    default:
      return null;
    break;
    case "game":
      return (await getGameById(id));
    break;
    case "jam":
      return (await getJam(id));
    break;
  }
}

export default getFeedPost;