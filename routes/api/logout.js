export default async (fastify, options) => {

    fastify.post("/logout", async (req, res) => {

        await req.destroySession();
      
        res.clearCookie("sessionId", { path: "/" });
      
        res.send({ success: true });

    });

}