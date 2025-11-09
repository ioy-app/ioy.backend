import { z } from "zod";

const UserControlsSchema = z.object({
    is_subscribe: z.boolean().nonoptional(),
    is_me: z.boolean().nonoptional()
});

export default UserControlsSchema;