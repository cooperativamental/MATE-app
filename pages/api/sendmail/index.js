import nodemailer from "nodemailer";
import { google } from "googleapis"
import fs from "fs"
import path from "path"
import handlebars from "handlebars"

const sendEmail = (req, res) => {

    try {
        const { subject, from, to, text, redirect } = JSON.parse(req.body);
        const oAuthClient = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.REDIRECT_URI
        )
        oAuthClient.setCredentials({
            refresh_token: process.env.REFRESH_TOKEN
        })
        const resolvePath = path.resolve(process.cwd(), "templatehtml")
        const filePath = path.join(resolvePath, "index.hbs")
        const html = fs.readFileSync(filePath, 'utf8').toString();
        handlebars.registerHelper("link", function (text, url) {
            var url = handlebars.escapeExpression(url),
                text = handlebars.escapeExpression(text)

            return new handlebars.SafeString(
                "<a style='border-radius: 0.5rem; border: none;background-color: #5A31E1;color: white;font-size: 1.5rem;font-weight: 600;text-align: center;text-transform: capitalize;letter-spacing: 1.25px;width: 100%;padding: 0.5rem;height: min-content;font-weight: 400;margin: 1rem' href='" 
                + url +
                 "'>" 
                 + text + 
                "</a>"
        );});
        const template = handlebars.compile(html);
        const replacements = {
            from: from,
            to: to,
            text: text,
            url: redirect
        };
        const htmlToSend = template(replacements);

        (async () => {
            try {
                const access_token = await oAuthClient.getAccessToken()

                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        type: "OAuth2",
                        user: process.env.EMAIL,
                        clientId: process.env.CLIENT_ID,
                        clientSecret: process.env.CLIENT_SECRET,
                        refreshToken: process.env.REFRESH_TOKEN,
                        accessToken: access_token
                    },
                });

                const mailOption = {

                    to: to.email,
                    subject: `${subject}`,
                    html: htmlToSend,
                    headers: {
                        'reply-to': from.email
                    },
                };

                transporter.sendMail(mailOption, (err, data) => {
                    if (err) {
                console.log(err)

                        res.status(500).json({ err: err });
                    } else {
                        res.status(200).json({ res: "success" });
                    }
                });
            } catch (err) {
                console.log(err)
                res.status(500).json({ err: "En de envio" });
            }
        })()
    } catch (err) {
        console.log(err)

        res.status(500).json({ err: err });
    }
}

export default sendEmail