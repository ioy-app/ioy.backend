import { z } from "zod";
import LoginSchema from "./login";
import IdSchema from "./id";

export const DescriptionItem = z.object({
    type: z.string(),
    content: z.string().min(1).max(255)
});

export const Privacy = z.object({
    favorites: z.boolean().optional(),
    games: z.boolean().optional(),
    subscribers: z.boolean().optional(),
    likes: z.boolean().optional()
})

const UserDetailsSchema = z.object({
    id: IdSchema,
    login: LoginSchema,
    active: z.boolean(),
    ban_count: z.number().int().nonnegative().nullable(),
    privacy: Privacy.nullable(),
    description: z.array(DescriptionItem).nullable(),
    role_id: z.number().int().nonnegative().nullable(),
    date_last_login: z.iso.datetime().optional(),
    date_ban: z.iso.datetime().nullable().optional(),
    date_deleted: z.iso.datetime().nullable().optional(),
    date_created: z.iso.datetime().nullable()
});

export default UserDetailsSchema;