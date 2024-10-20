import Fastify from "fastify";
import cors from "@fastify/cors";
import autoload from "@fastify/autoload";
import { PrismaClient } from "@prisma/client";

import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

import config from "./config.js";

const fastify = Fastify({
    trustProxy: true,
    ignoreTrailingSlash: true
});

fastify.register(cors);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

fastify.register(autoload, { 
    dir: join(__dirname, "./routes"),
    options: {
        prefix: "/api" 
    }
});

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