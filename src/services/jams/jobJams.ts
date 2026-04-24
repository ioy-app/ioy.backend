import cron from "node-cron";
import getJams from "./getJams";
import dayjs from "dayjs";
import redis from "@/lib/redis";
import getJam from "./getJam";
import kafka from "@/lib/kafka";
import { getSubsByInstance } from "../subscribers";
import getEmail from "../users/getEmail";
const producer = kafka.producer();

export default () => {
  const jamScheduler = cron.schedule("* * * * *", async () => {
    const now = dayjs().toISOString();
    const [ jams, total ] = await getJams(now, now);
    for (const id of jams) {
      const jam = await getJam(id);
      if (jam.status != "finished")
        await redis.delWithLog(`jam:${id}`);

      const cache = await redis.readWithLog(`jam:${id}:status`);
      if (cache) {
        if (cache != jam.status) {
          await producer.connect();
          switch(jam.status) {
            case "in_process": {
              const users = await getSubsByInstance(jam?.id, "jam");
              for (const user_id of users) {
                const email = await getEmail(user_id);
                await producer.send({
                  topic: "notify",
                  messages: [
                    {
                      key: `start_jam:${jam?.id}`,
                      value: JSON.stringify({
                        type: "jam_start",
                        subject: `Jam ${jam.title} started!`,
                        email,
                        props: {
                          title: jam?.title,
                          description: jam?.description,
                          id: jam?.id
                        }
                      })
                    }
                  ]
                });
              }
              console.log(`send notify jam started to ${users?.length}`);
            } break;
            case "finished": {
              const users = await getSubsByInstance(jam?.id, "jam");
              for (const user_id of users) {
                const email = await getEmail(user_id);
                await producer.send({
                  topic: "notify",
                  messages: [
                    {
                      key: `finish_result:${jam?.id}`,
                      value: JSON.stringify({
                        type: "jam_result",
                        subject: `Jam ${jam.title} finished!`,
                        email,
                        props: {
                          title: jam?.title,
                          id: jam?.id
                        }
                      })
                    }
                  ]
                });
              }
              console.log(`send notify jam finished to ${users?.length}`);
            } break;
          }
          await producer.disconnect();
        }
      }

      redis.writeWithLog(`jam:${id}:status`, jam?.status);
    }
  });

  jamScheduler.start();
}