import { z } from "zod";

const IdSchema = z.number({
    error: "ID должен быть числом"
}).nonnegative({
    error: "ID не может быть меньше 0"
}).nonoptional({
    error: "ID обязателен"
});

export default IdSchema;