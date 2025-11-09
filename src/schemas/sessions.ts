import { z } from "zod";
import IdSchema from "./id";

const SessionSchema = z.object({
    id: IdSchema,
    ip: z.string({
        error: "errors.invalid.ip"
    }).trim().nonoptional({
        error: "errors.invalid.ip"
    }),
    user_agent: z.string({
        error: "errors.invalid.user_agent"
    }).trim().nonoptional({
        error: "errors.invalid.user_agent"
    }),
    date_created: z.iso.datetime({
        error: "errors.invalid.date_created"
    }).nonoptional({
        error: "errors.required.date_created"
    }),
    date_expired: z.iso.datetime({
        error: "errors.invalid.date_expired"
    }).nonoptional({
        error: "errors.required.date_expired"
    })
});

export default SessionSchema;