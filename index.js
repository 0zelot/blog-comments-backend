import Fastify from "fastify";
import cors from "@fastify/cors";
import autoload from "@fastify/autoload";
import oauthPlugin from "@fastify/oauth2";
import cookie from "@fastify/cookie";
import session from "@fastify/session";
import { PrismaClient } from "@prisma/client";

import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

import config from "./config.js";

const fastify = Fastify({
    trustProxy: true,
    ignoreTrailingSlash: true
});

fastify.register(cors);
fastify.register(cookie);
fastify.register(session, {
    secret: config.oauth.secret,
    cookie: { secure: config.secure },
    saveUninitialized: false,
    path: "/",
    sameSite: "Lax",
});

const { id, secret } = config.oauth.github;

fastify.register(oauthPlugin, {
    name: "githubOAuth2",
    scope: [ "user:email" ],
    credentials: {
        client: { id, secret },
        auth: oauthPlugin.GITHUB_CONFIGURATION
    },
    startRedirectPath: "/auth/login",
    callbackUri: `${config.baseUrl}/auth/login/callback`,
});

fastify.decorate("requireAuthentication", (req, reply, done) => {
    if(!req.session?.user) {
        reply.status(401).send({ succes: false, error: "Unauthorized" });
        return;
    }
    done();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

fastify.register(autoload, { dir: join(__dirname, "./routes") });

fastify.setErrorHandler((err, req, res) => {

    const error = err.message;
    if(error == "Unauthorized") return res.status(401).send({ success: false, error });
    
    console.error(err.stack);
    res.status(500).send({ success: false, error }); 

});

const prisma = new PrismaClient();

(async () => {
    try {
        const { port, host } = config;
        await fastify.listen({ port, host });
        console.log(`Fastify server is running on ${host}:${port}.`);
    } catch(err) {
        console.error(err.stack);
        process.exit(1);
    }
})();

export { prisma }