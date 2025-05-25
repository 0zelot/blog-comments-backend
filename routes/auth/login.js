import { prisma } from "../../index.js";

import getIpAddr from "../../utils/getIpAddr.js";

import config from "../../config.js";

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

            const ipAddr = getIpAddr(req);

            const user = await prisma.users.findFirst({
                where: { githubId: userInfo.id }
            });

            if(user) await prisma.users.update({
                where: { githubId: userInfo.id },
                data: {
                    email,
                    login: userInfo.login,
                    displayName: userInfo.name,
                    ipAddress: ipAddr
                }
            });

            else await prisma.users.create({
                data: {
                    githubId: userInfo.id,
                    email,
                    login: userInfo.login,
                    displayName: userInfo.name,
                    ipAddress: ipAddr
                }
            });


            if(user.banned) res.send({
                success: false,
                error: "Your account is suspended"
            })

            const { githubId, login, displayName } = user;

            req.session.token = token.access_token, 
            req.session.user = user;

            const redirectUrl = req.cookies.redirectUrl || "/blog";
        
            res.redirect(`https://${config.domain}${redirectUrl}`);

        } catch(err) {
            console.error(err);
            res.status(500).send({ success: false });
        }

    });
}