const nodemailer =
  require("nodemailer");

const sendVerificationEmail =
  async (
    email,
    token
  ) => {
    try {
      console.log(
        "STARTING EMAIL SERVICE..."
      );

      /**
       * USE SMTP
       * PORT 587
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
          }
        );

      console.log(
        "SMTP CREATED"
      );

      /**
       * VERIFY SMTP
       */
      await transporter.verify();

      console.log(
        "SMTP VERIFIED"
      );

      const verificationUrl =
        `${process.env.BACKEND_URL}/api/auth/verify-email/${token}`;

      console.log(
        "VERIFICATION URL:",
        verificationUrl
      );

      /**
       * SEND EMAIL
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
                max-width:500px;
                margin:auto;
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
        "EMAIL SENT SUCCESSFULLY"
      );

      console.log(
        "MESSAGE ID:",
        info.messageId
      );

      return true;
    } catch (error) {
      console.error(
        "EMAIL SEND ERROR:"
      );

      console.error(error);

      throw error;
    }
  };

module.exports =
  sendVerificationEmail;