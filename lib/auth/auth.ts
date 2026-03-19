import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { authPgPool } from "../db/postgres";

function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) throw new Error(`Missing environment variable: ${key}`);
    return value;
}

// TODO: https://better-auth.com/docs/concepts/database#extending-core-schema
export const auth = betterAuth({
/*
    user: {
        additionalFields: {
          role: {
            type: ["user", "admin"],
            required: false,
            defaultValue: "user",
            input: false, // don't allow user to set role
          },
          username: {
            type: "string",
            required: true,
          },
        },
      },
*/
    database: authPgPool,
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 300, // 5 minutes
        },
    },
    socialProviders: {
        github: {
            // Use GitHub App OAuth credentials instead of classic OAuth app
            clientId: requireEnv("GITHUB_APP_CLIENT_ID"),
            clientSecret: requireEnv("GITHUB_APP_CLIENT_SECRET"),
        },
        linkedin: {
            clientId: requireEnv("LINKEDIN_CLIENT_ID"),
            clientSecret: requireEnv("LINKEDIN_CLIENT_SECRET"),
        },
        discord: {
            clientId: requireEnv("DISCORD_CLIENT_ID"),
            clientSecret: requireEnv("DISCORD_CLIENT_SECRET"),
            permissions: 2048 | 16384,
        },
    },
    plugins: [nextCookies()],
});