import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
    server: {
        NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
        PORT: z.string().default("3000"),
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
});
