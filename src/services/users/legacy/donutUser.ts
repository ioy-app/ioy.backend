import db from "@/lib/db";
import { IdSchemaCustom } from "@/schemas/id";
import validate from "@/utils/validate";
import dayjs from "dayjs";
import getUserLogin from "./getUserLogin";
import getUser from "./getUser";
import redis from "@/lib/redis";
import z from "zod";

/**
 * Donate to user
 * @example
 * return donutUser()
*/
const donutUser = async (user_id: number, days: number): Promise<any> => {
  validate(IdSchemaCustom("user_id"), user_id, "donutUser");
  validate(
    z.number("errors.invalid.days")
      .int("errors.invalid.days")
      .nonoptional("errors.required.days")
  , days, "donutUser");

  const set_days = dayjs().add(days, "day").toISOString();
  const login = await getUserLogin(user_id);
  await db.query(`
    UPDATE "users"
    SET date_donut=$2
    WHERE id=$1
  `, [ user_id, set_days ]);
  
  await redis.delWithLog(`user:${login}`);
  await redis.delWithLog(`user_id:${user_id}`);

  return true;
}

export default donutUser;