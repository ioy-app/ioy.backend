import { z } from "zod";

const RoleSchema = z.object({
    title: z.string({
        error: "errors.invalid.title"
    }).trim().nonoptional({
        error: "errors.required.title"
    }),
    is_warning_comments: z.boolean({
        error: "errors.invalid.is_warning_comments"
    }).optional(),
    is_warning_games: z.boolean({
        error: "errors.invalid.is_warning_games"
    }).optional(),
    is_warning_jams: z.boolean({
        error: "errors.invalid.is_warning_jams"
    }).optional(),
    is_warning_users: z.boolean({
        error: "errors.invalid.is_warning_users"
    }).optional(),
    is_delete_comments: z.boolean({
        error: "errors.invalid.is_delete_comments"
    }).optional(),
    is_delete_games: z.boolean({
        error: "errors.invalid.is_delete_games"
    }).optional(),
    is_delete_jams: z.boolean({
        error: "errors.invalid.is_delete_jams"
    }).optional(),
    is_delete_users: z.boolean({
        error: "errors.invalid.is_delete_users"
    }).optional(),
    is_ban: z.boolean({
        error: "errors.invalid.is_ban"
    }).optional()
});

export default RoleSchema;