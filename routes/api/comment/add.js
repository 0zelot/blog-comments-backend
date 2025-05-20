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

    fastify.post("/add", { preHandler: fastify.requireAuthentication }, async (req, res) => {

        if(!req.body) return res.status(400).send({ success: false, error: "Missing body" });

        const { postSlug, content, replyTo } = req.body;

        if(!postSlug || !content) return res.status(400).send({ success: false, error: "Missing postSlug and/or content" });

        if(rateLimit.has(req.session.user.id)) return res.status(429).send({ success: false, error: "You are being rate-limited" });

        const parsedContent = content
            .replace(/[ \t]+/g, " ")
            .replace(/^[ ]+|[ ]+$/gm, "")
            .replace(/\n{3,}/g, "\n\n")
            .trim()

        if(parsedContent.length < 20 || parsedContent.length > 4000) return res.status(400).send({ success: false, error: "Comment content is too short or too long" });

        try {

            if(replyTo) {

                const mainComment = await prisma.comments.findFirst({
                    where: { id: replyTo }
                });

                if(!mainComment) return res.status(404).send({ success: false, error: "Comment not found" });

            }

            const comment = await prisma.comments.create({
                data: {
                    authorId: req.session.user.id,
                    postSlug,
                    content: parsedContent,
                    replyTo
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

            if(!comment) return res.status(500).send({ success: false, error: "Could not add comment" });

            rateLimit.set(req.session.user.id, Date.now());
    
            return res.send({ success: true, data: comment });

        } catch(err) {
            console.error(err);
            return res.status(500).send({ success: false });
        }

    });

}