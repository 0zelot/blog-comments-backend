export default async (fastify, options) => {

    fastify.get("/me", { preHandler: fastify.requireAuthentication }, async (req, res) => {

        res.send({ success: true, data: req.session.user })
    
    });
    
}