import { prisma } from "../../../index.js";

import config from "../../../config.js";

const rateLimit = new Map();

setInterval(() => {
    const now = Date.now();
    for(const [id, start] of rateLimit.entries()) {
        if(now - start >= config.rateLimit.cooldown) {
            rateLimit.delete(id);
        }
    }
}, config.rateLimit.interval);

export default async (fastify, options) => {

    fastify.delete("/delete/:id", { preHandler: fastify.requireAuthentication }, async (req, res) => {

        const id = Number(req.params?.id);

        if(!Number.isInteger(id) || id <= 0) return res.status(400).send({ success: false, error: "Missing id" });

        if(rateLimit.has(req.session.user.id)) return res.status(429).send({ success: false, error: "You are being rate-limited" });

        try {

            const comment = await prisma.comments.findFirst({
                where: { id }
            });

            if(!comment) return res.status(404).send({ success: false, error: "Comment not found" });

            if(comment.authorId !== req.session.user.id && !config.adminUsers.includes(req.session.githubId)) return res.status(403).send({ success: false, error: "You are not authorized to delete this comment" });

            await prisma.comments.update({
                where: { id },
                data: {
                    hidden: true
                }
            });

            rateLimit.set(req.session.user.id, Date.now());
    
            return res.send({ success: true });

        } catch(err) {
            console.error(err);
            return res.status(500).send({ success: false });
        }

    });

}