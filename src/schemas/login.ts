import { z } from "zod";

const LoginSchema = z.string()
    .min(3, "Не может быть < 3 символов")
    .max(50, "Не может превышать 50 символов")
    .regex(/^[a-zA-Z0-9_-]+$/, "Не верный формат строки");

export default LoginSchema;