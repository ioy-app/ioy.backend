import cron from "node-cron";
import getJams from "./getJams";
import dayjs from "dayjs";
import redis from "@/lib/redis";
import getJam from "./getJam";

export default () => {
  const jamScheduler = cron.schedule("* * * * *", async () => {
    const now = dayjs().toISOString();
    const [ jams, total ] = await getJams(now, now);
    for (const id of jams) {
      const jam = await getJam(id);
      if (jam.status != "finished")
        await redis.delWithLog(`jam:${id}`);
    }
  });

  jamScheduler.start();
}