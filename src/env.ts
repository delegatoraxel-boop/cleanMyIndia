import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
    server: {
        NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
        PORT: z.string().default("3000"),
        DATABASE_HOST: z.string().default("localhost"),
        DATABASE_PORT: z.string().default("5432"),
        DATABASE_NAME: z.string(),
        DATABASE_USER: z.string(),
        DATABASE_PASSWORD: z.string().optional(),
        GOOGLE_CLIENT_ID: z.string(),
        GOOGLE_CLIENT_SECRET: z.string(),
        JWT_SECRET: z.string(),
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
});
