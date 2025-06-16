import { prisma } from "../../../index.js";

import cleanContent from "../../../utils/cleanContent.js";
import sendEmail from "../../../utils/sendEmail.js";

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

    fastify.post("/add/:postSlug", { preHandler: fastify.requireAuthentication }, async (req, res) => {

        const postSlug = req.params?.postSlug;

        if(!req.body) return res.status(400).send({ success: false, error: "Missing body" });

        const { content, replyTo } = req.body;

        if(!postSlug || !content) return res.status(400).send({ success: false, error: "Missing postSlug and/or content" });

        if(rateLimit.has(req.session.user.id) && !config.adminUsers.includes(req.session.user.githubId)) return res.status(429).send({ success: false, error: "You are being rate-limited" });

        const parsedContent = cleanContent(content);

        if(parsedContent.length < 20 || parsedContent.length > 4000) return res.status(400).send({ success: false, error: "Comment content is too short or too long" });

        try {

            if(replyTo) {

                const mainComment = await prisma.comments.findFirst({
                    where: { id: replyTo }
                });

                if(!mainComment) return res.status(404).send({ success: false, error: "Comment not found" });

            } else {

                const topLevelCount = await prisma.comments.count({
                    where: {
                        authorId: req.session.user.id,
                        postSlug,
                        replyTo: null,
                        hidden: false
                    }
                });
    
                if(topLevelCount >= config.maxCommentCount) return res.status(400).send({ success: false, error: `You can not post more than ${config.maxCommentCount} top-level comments on single post` });

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

            await sendEmail(config.commentAlerts, `${req.session.user.login} commented ${postSlug}`, `${req.session.user.login} commented ${postSlug}. <a href="https://${config.domain}/blog/${postSlug}">Click here</a> to see comment.`).catch(err => console.error(err));
    
            return res.send({ success: true, data: comment });

        } catch(err) {
            console.error(err);
            return res.status(500).send({ success: false });
        }

    });

}