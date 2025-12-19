const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const sgMail = require("@sendgrid/mail");

const SENDGRID_API_KEY = defineSecret("SENDGRID_API_KEY");

// ✅ Your Gmail (where you want notifications)
const TO_EMAIL = "Olamidesamson841@gmail.com";

// ✅ MUST be a verified sender email in SendGrid
const FROM_EMAIL = "verified_sender@yourdomain.com";

exports.notifyNewMessage = onDocumentCreated(
  {
    document: "messages/{docId}",
    secrets: [SENDGRID_API_KEY],
    region: "us-central1",
  },
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    const name = data.name || "Unknown";
    const email = data.email || "No email";
    const subject = data.subject || "No subject";
    const message = data.message || "";
    const createdAt = data.createdAt?.toDate?.() || new Date();

    sgMail.setApiKey(SENDGRID_API_KEY.value());

    await sgMail.send({
      to: TO_EMAIL,
      from: FROM_EMAIL,
      subject: `📩 Portfolio message: ${subject}`,
      replyTo: email,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\nTime: ${createdAt.toISOString()}\n\nMessage:\n${message}`,
      html: `
        <h2>New Portfolio Message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Subject:</b> ${subject}</p>
        <p><b>Time:</b> ${createdAt.toISOString()}</p>
        <hr/>
        <p style="white-space:pre-wrap;">${message}</p>
      `,
    });
  }
);
