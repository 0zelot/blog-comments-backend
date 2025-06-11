import { prisma } from "../../index.js";

export default async (fastify, options) => {

    fastify.get("/me", { preHandler: fastify.requireAuthentication }, async (req, res) => {

        const user = await prisma.users.findFirst({
            where: { githubId: req.session.user.githubId }
        });

        if(!user) return res.status(404).send({ 
            success: false, 
            error: "User not found"
        });

        const { githubId, email, login, displayName } = user;

        res.send({ 
            success: true, 
            data: { githubId, email, login, displayName } 
        });
    
    });
    
}