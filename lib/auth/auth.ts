import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
    session: {
        /**
         * Stateless, encrypted (JWE-style) session cookies with a small cookie cache
         * to keep RSC and client in sync without a server-side session store.
         */
        cookieCache: {
            enabled: true,
            maxAge: 300, // 5 minutes
            refreshCache: {
                updateAge: 60, // Refresh when 60 seconds remain before expiry
            },
        },
    },
    socialProviders: {
        github: {
            // Use GitHub App OAuth credentials instead of classic OAuth app
            clientId: process.env.GITHUB_APP_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_APP_CLIENT_SECRET as string,
        },
        linkedin: {
            clientId: process.env.LINKEDIN_CLIENT_ID as string,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
        },
        discord: {
            clientId: process.env.DISCORD_CLIENT_ID as string,
            clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
            permissions: 2048 | 16384,
        },
    },
    plugins: [nextCookies()],
});