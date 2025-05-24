import { prisma } from "../../../index.js";

export default async (fastify, options) => {

    fastify.get("/get/:postSlug", async (req, res) => {

        const postSlug = req.params?.postSlug;

        if(!postSlug) return res.status(400).send({ success: false, error: "Missing postSlug" });

        try {

            const comments = await prisma.comments.findMany({
                where: { postSlug, hidden: false },
                select: {
                    id: true,
                    createdAt: true,
                    editedAt: true,
                    content: true,
                    replyTo: true,
                    author: {
                        select: {
                            id: true,
                            githubId: true,
                            login: true,
                            displayName: true
                        }
                    }
                }
            });

            const commentsMap = new Map();

            comments.forEach(comment => commentsMap.set(comment.id, { ...comment, replies: [] }));

            const rootComments = [];

            for(const comment of commentsMap.values()) {
                if(comment.replyTo) {
                    const parent = commentsMap.get(comment.replyTo);
                    if(parent) parent.replies.push(comment);
                    else rootComments.push(comment);
                } else rootComments.push(comment);
            }

            return res.send({ success: true, data: rootComments });

        } catch(err) {
            console.error(err);
            return res.status(500).send({ success: false });
        }

    });
    
};