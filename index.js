import Fastify from "fastify";
import cors from "@fastify/cors";
import autoload from "@fastify/autoload";
import { PrismaClient } from "@prisma/client";

import config from "./config.js";

const fastify = Fastify({
    trustProxy: true,
    ignoreTrailingSlash: true
});

fastify.register(cors);
fastify.register(autoload, { dir: "./routes" });

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