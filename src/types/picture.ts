import { IdSchemaCustom } from "@/schemas/id";
import z from "zod";

export const PictureValidate = z.object({
  id: IdSchemaCustom("id"),
  title: z.string("errors.invalid.title")
    .nonempty("errors.required.title"),
  description: z.string("errors.invalid.description")
    .optional(),
  tags: z.array(
    z.string("erros.invalid.tags")
      .nonempty("errors.required.tags"),
    "erros.invalid.tags"
  ).optional(),
  creater_id: IdSchemaCustom("creater_id"),
  jam_id: z.number("errors.invalid.jam_id")
    .int("errors.invalid.jam_id")
    .nonnegative("errors.invalid.jam_id")
    .optional(),
  date_created: z.string("erros.invalid.date_created")
    .optional(),
  date_updated: z.string("erros.invalid.date_updated")
    .optional(),
  status: z.enum([
    "draft",
    "public"
  ], "errors.invalid.status")
  .nonoptional("errors.required.status"),
  is_background: z.boolean("errors.invalid.is_background")
    .optional(),
  game_id: z.number("errors.invalid.game_id")
    .int("errors.invalid.game_id")
    .nonnegative("errors.invalid.game_id")
    .optional()
});

type Picture = z.infer<typeof PictureValidate>;
export default Picture;