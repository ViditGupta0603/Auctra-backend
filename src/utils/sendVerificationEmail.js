const nodemailer =
  require("nodemailer");

const sendVerificationEmail =
  async (
    email,
    token
  ) => {
    const transporter =
      nodemailer.createTransport(
        {
          service:
            "gmail",

          auth: {
            user:
              process.env.EMAIL_USER,

            pass:
              process.env.EMAIL_PASS,
          },
        }
      );

    const verificationUrl =
      `${process.env.BACKEND_URL}/api/auth/verify-email/${token}`;

    await transporter.sendMail(
      {
        from: `"Auctra" <${process.env.EMAIL_USER}>`,

        to: email,

        subject:
          "Verify Your Auctra Account",

        html: `
          <div style="font-family:sans-serif;padding:30px">
            <h2>Welcome to Auctra</h2>

            <p>
              Click the button below to verify your email.
            </p>

            <a
              href="${verificationUrl}"
              style="
                display:inline-block;
                margin-top:20px;
                padding:12px 22px;
                background:#06b6d4;
                color:white;
                text-decoration:none;
                border-radius:10px;
              "
            >
              Verify Email
            </a>
          </div>
        `,
      }
    );
  };

module.exports =
  sendVerificationEmail;