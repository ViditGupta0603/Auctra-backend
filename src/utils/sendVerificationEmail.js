const nodemailer =
  require("nodemailer");

const sendVerificationEmail =
  async (
    email,
    token
  ) => {
    try {
      console.log(
        "STARTING EMAIL..."
      );

      /**
       * SMTP CONFIG
       */
      const transporter =
        nodemailer.createTransport(
          {
            host:
              "smtp.gmail.com",

            port: 587,

            secure: false,

            auth: {
              user:
                process.env.EMAIL_USER,

              pass:
                process.env.EMAIL_PASS,
            },

            tls: {
              rejectUnauthorized:
                false,
            },
          }
        );

      const verificationUrl =
        `${process.env.BACKEND_URL}/api/auth/verify-email/${token}`;

      console.log(
        "SENDING TO:",
        email
      );

      /**
       * SEND MAIL
       */
      const info =
        await transporter.sendMail(
          {
            from: `"Auctra" <${process.env.EMAIL_USER}>`,

            to: email,

            subject:
              "Verify Your Auctra Account",

            html: `
            <div style="
              font-family:Arial,sans-serif;
              background:#06111F;
              padding:40px;
              color:white;
              text-align:center;
            ">

              <img
                src="https://i.postimg.cc/xjPJL9LD/image-removebg-preview.png"
                style="
                  width:180px;
                  margin-bottom:20px;
                "
              />

              <h1 style="
                color:#06b6d4;
              ">
                Welcome to Auctra
              </h1>

              <p style="
                color:#cbd5e1;
                line-height:1.7;
              ">
                Verify your email to activate your account.
              </p>

              <a
                href="${verificationUrl}"
                style="
                  display:inline-block;
                  margin-top:30px;
                  padding:14px 28px;
                  background:#06b6d4;
                  color:#06111F;
                  text-decoration:none;
                  border-radius:12px;
                  font-weight:bold;
                "
              >
                Verify Email
              </a>

            </div>
            `,
          }
        );

      console.log(
        "EMAIL SENT"
      );

      console.log(
        info.messageId
      );

      return true;
    } catch (error) {
      console.error(
        "EMAIL ERROR:"
      );

      console.error(error);

      throw error;
    }
  };

module.exports =
  sendVerificationEmail;