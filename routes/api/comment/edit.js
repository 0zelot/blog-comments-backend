import { prisma } from "../../../index.js";

import cleanContent from "../../../utils/cleanContent.js";

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

    fastify.post("/edit", { preHandler: fastify.requireAuthentication }, async (req, res) => {

        if(!req.body) return res.status(400).send({ success: false, error: "Missing body" });

        const { id, content } = req.body;

        if(!id || !content) return res.status(400).send({ success: false, error: "Missing id and/or content" });

        if(rateLimit.has(req.session.user.id)) return res.status(429).send({ success: false, error: "You are being rate-limited" });

        const parsedContent = cleanContent(content);

        if(parsedContent.length < 20 || parsedContent.length > 4000) return res.status(400).send({ success: false, error: "Comment content is too short or too long" });

        try {

            const findComment = await prisma.comments.findFirst({
                where: { id }
            });

            if(!findComment || findComment.hidden) return res.status(404).send({ success: false, error: "Comment not found" });

            if(findComment.authorId !== req.session.user.id && !config.adminUsers.includes(req.session.githubId)) return res.status(403).send({ success: false, error: "You are not authorized to edit this comment" });

            const comment = await prisma.comments.update({
                where: { id },
                data: {
                    content: parsedContent,
                    editedAt: new Date(),
                    previousContent: `${findComment.previousContent ?? findComment.content ?? ""}\n\n---\n\n${new Date().toISOString()}\n\n---`
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            githubId: true,
                            email: true,
                            login: true,
                            displayName: true
                        }
                    }
                }
            });

            if(!comment) return res.status(500).send({ success: false, error: "Could not edit comment" });

            rateLimit.set(req.session.user.id, Date.now());
    
            return res.send({ success: true, data: comment });

        } catch(err) {
            console.error(err);
            return res.status(500).send({ success: false });
        }

    });

}