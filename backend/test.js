// Looking to send emails in production? Check out our Email API/SMTP product!
import { createTransport } from "nodemailer";
import { MailtrapTransport } from "mailtrap";
import { VERIFICATION_EMAIL_TEMPLATE } from "./config/email_templates.js";

const TOKEN = "8ef5668d52cacf6b7eeb06352bbd857e";

export const transport = createTransport(
  MailtrapTransport({
    token: TOKEN,
    testInboxId: 3138215,
  })
);

const sender = {
  address: "hello@example.com",
  name: "Mailtrap Test",
};
const recipients = [
  "cocof100mb@gmail.com",
];

transport
  .sendMail({
    from: sender,
    to: recipients,
    subject: "You are awesome!",
    html:VERIFICATION_EMAIL_TEMPLATE,
    category: "Integration Test",
    sandbox: true
  })
  .then(console.log, console.error);