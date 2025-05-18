import { prisma } from "../../index.js";

export default async (fastify, options) => {

    fastify.get("/me", { preHandler: fastify.requireAuthentication }, async (req, res) => {

        const user = await prisma.users.findFirst({
            where: { githubId: req.session.user.githubId }
        });

        const { githubId, email, login, displayName, banned } = user;

        res.send({ 
            success: true, 
            data: { githubId, email, login, displayName, banned } 
        })
    
    });
    
}