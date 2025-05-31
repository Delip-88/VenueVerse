import {
  BOOKING_SUCCESS_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_MESSAGE_TEMPLATE,
} from "./email_templates.js";
import { sender, transport } from "./mailtrap.config.js";

export const sendEmail = async (
  typeOfEmail,
  recipientEmail = "",
  subjectOfEmail = "",
  code = "",
  username = "",
  resetURL,
  bookingData = {}
) => {
  let htmlTemp;

  switch (typeOfEmail) {
    case "email_verification":
      htmlTemp = VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        code
      );
      break;
    case "welcome_message":
      htmlTemp = WELCOME_MESSAGE_TEMPLATE.replace("{username}", username);
      break;
    case "password_reset":
      htmlTemp = PASSWORD_RESET_REQUEST_TEMPLATE.replace(
        "{resetURL}",
        resetURL
      );
      break;
    case "password_reset_success":
      htmlTemp = PASSWORD_RESET_SUCCESS_TEMPLATE.replace(
        "{username}",
        username
      );
      break;
      case "payment_success":
        const serviceListHtml = bookingData.services
          .map((s) => `<li>${s}</li>`)
          .join("");
      
        const replacements = {
          "{{userName}}": username,
          "{{venueName}}": bookingData.venueName,
          "{{address}}": bookingData.address,
          "{{date}}": bookingData.date,
          "{{start}}": bookingData.start,
          "{{end}}": bookingData.end,
          "{{totalPrice}}": bookingData.totalPrice,
          "{{servicesList}}": serviceListHtml,
        };
      
        htmlTemp = BOOKING_SUCCESS_TEMPLATE; // ✅ NO "let" here
        for (const [key, value] of Object.entries(replacements)) {
          htmlTemp = htmlTemp.replace(new RegExp(key, "g"), value);
        }
      
        break;
      
    default:
      htmlTemp = "default msg";
      break;
  }

  try {
    // await client.send({
    //     to: [{ email: recipientEmail }],
    //     from: sender,
    //     subject: subjectOfEmail,
    //     html: htmlTemp,
    //     category: "Integration Test",
    // });

    transport.sendMail({
      from: sender,
      to: [recipientEmail],
      subject: subjectOfEmail,
      html: htmlTemp,
      category: "Integration Test",
      sandbox: true,
    });
    console.log(`Email sent to ${recipientEmail}`);
  } catch (err) {
    console.error("Email send failed: ", err.message);
    throw new Error("Email send failed");
  }
};
