export default async (fastify, options) => {

    fastify.post("/logout", async (req, res) => {

        await new Promise((resolve, reject) => {
            req.session.destroy(err => {
                if(err) reject(err);
                else resolve();
            });
        });
      
        res.clearCookie("sessionId", { path: "/" });
      
        res.send({ success: true });

    });

}