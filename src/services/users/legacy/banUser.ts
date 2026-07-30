import db from "@/lib/db";
import { IdSchemaCustom } from "@/schemas/id";
import validate from "@/utils/validate";
import dayjs from "dayjs";
import getUserLogin from "./getUserLogin";
import getUser from "./getUser";
import redis from "@/lib/redis";
import z from "zod";

/**
 * Ban user
 * @example
 * return banUser()
*/
const banUser = async (user_id: number, days: number): Promise<any> => {
  validate(IdSchemaCustom("user_id"), user_id, "banUser");
  validate(
    z.number("errors.invalid.days")
      .int("errors.invalid.days")
      .nonoptional("errors.required.days")
  , days, "banUser");

  const set_days = dayjs().add(days, "day").toISOString();
  const login = await getUserLogin(user_id);
  const userdata = await getUser(login);

  const count = userdata.ban_count + Number(days > 0);
  await db.query(`
    UPDATE "users"
    SET ban_count=$3, date_ban=$2
    WHERE id=$1
  `, [ user_id, set_days, count ]);
  
  await redis.delWithLog(`user:${login}`);
  await redis.delWithLog(`user_id:${user_id}`);

  return true;
}

export default banUser;