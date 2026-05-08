import type { Event } from "@strapi/database/dist/lifecycles";

// Fires when a Kommentar entry is updated in Strapi (e.g., isApproved toggled in Admin).
// Sends an email notification to the comment author when their comment is approved.
//
// Prerequisites (configure in Strapi Admin → Settings → Email):
//   - Set up an email provider plugin, e.g. @strapi/provider-email-sendgrid
//     or @strapi/provider-email-nodemailer for SMTP.
//   - Set DEFAULT_FROM and DEFAULT_REPLYTO in the backend .env file.

export default {
  async afterUpdate(event: Event) {
    const { result, params } = event;

    // Only act when isApproved was explicitly set to true in this update
    const wasJustApproved =
      params.data?.isApproved === true && result.isApproved === true;

    if (!wasJustApproved) return;

    // Fetch full comment with user relation to get the email address
    const kommentar = await strapi.entityService.findOne(
      "api::kommentar.kommentar",
      result.id,
      { populate: ["user", "rezension"] }
    );

    const userEmail = (kommentar as any)?.user?.email;
    const rezensionTitle = (kommentar as any)?.rezension?.title ?? "eine Rezension";

    if (!userEmail) return;

    try {
      await strapi.plugins["email"].services.email.send({
        to: userEmail,
        subject: "Dein Kommentar wurde freigeschaltet – roterdorn.de",
        text: [
          `Hallo ${(kommentar as any)?.name ?? ""},`,
          "",
          `Dein Kommentar zu "${rezensionTitle}" wurde von unserem Team freigegeben und ist jetzt öffentlich sichtbar.`,
          "",
          "Viele Grüße",
          "Das roterdorn-Team",
        ].join("\n"),
        html: `
          <p>Hallo ${(kommentar as any)?.name ?? ""},</p>
          <p>
            Dein Kommentar zu <strong>${rezensionTitle}</strong> wurde von unserem Team
            freigegeben und ist jetzt öffentlich sichtbar.
          </p>
          <p>Viele Grüße<br>Das roterdorn-Team</p>
        `,
      });
    } catch (err) {
      // Email failure should not break the update — log and continue.
      strapi.log.error("Kommentar-Benachrichtigung fehlgeschlagen:", err);
    }
  },
};
