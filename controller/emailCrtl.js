const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

const sendEmail = asyncHandler(async (data, req, res) => {
    try {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            service:'gmail',
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAIL_ID,
                pass: process.env.MP,
            },
        });

        const info = await transporter.sendMail({
            from: '"Fred Foo 👻" <olasunkanmiolamide46@gmail.com>',
            to: data.to,
            subject: data.subject,
            text: data.text,
            html: data.htm,
        });

        console.log("Email sent successfully. Message ID: %s", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Error sending email");
    }
});

module.exports = sendEmail;
