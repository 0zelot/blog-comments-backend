import nodemailer from "nodemailer";

import config from "../config.js";

const { host, port, user, pass, name } = config.smtp;


export default async (to, subject, html) => {

    try {

        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: true,
            auth: { user, pass }
        });

        await transporter.sendMail({
            from: `${name} <${user}>`,
            to, subject, html
        });

        return true;
        
    } catch(err) {
        console.error(err);
        return false;
    }

}