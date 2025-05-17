export default async (fastify, options) => {

    fastify.get("/login/callback", async (req, res) => {

        try {

            const { token } = await fastify.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);
            
            const emailsResponse = await fetch("https://api.github.com/user/emails", {
                headers: {
                    "Accept": "application/vnd.github+json",
                    "Authorization": `Bearer ${token.access_token}`,
                    "X-GitHub-Api-Version": "2022-11-28"
                }
            });

            const emails = await emailsResponse.json();

            const email = emails.find(email => email.primary)?.email;

            const userInfoResponse = await fetch("https://api.github.com/user", {
                headers: {
                    "Accept": "application/vnd.github+json",
                    "Authorization": `Bearer ${token.access_token}`,
                    "X-GitHub-Api-Version": "2022-11-28"
                }
            });

            const userInfo = await userInfoResponse.json();

            console.log(userInfo)

            req.session.user = {
                token: token.access_token, email
            }
            
            res.send({ success: true, token: token.access_token, email });

        } catch(err) {
            console.error(err);
            res.status(500).send({ success: false });
        }

    });
}