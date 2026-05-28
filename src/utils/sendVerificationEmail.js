const nodemailer =
  require("nodemailer");

const sendVerificationEmail =
  async (
    email,
    token
  ) => {
    try {
      console.log(
        "============================"
      );

      console.log(
        "STARTING EMAIL SEND..."
      );

      console.log(
        "EMAIL:",
        email
      );

      console.log(
        "TOKEN:",
        token
      );

      console.log(
        "EMAIL_USER:",
        process.env.EMAIL_USER
          ? "FOUND"
          : "MISSING"
      );

      console.log(
        "EMAIL_PASS:",
        process.env.EMAIL_PASS
          ? "FOUND"
          : "MISSING"
      );

      console.log(
        "BACKEND_URL:",
        process.env.BACKEND_URL
      );

      /**
       * TRANSPORTER
       */
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

      console.log(
        "TRANSPORTER CREATED"
      );

      /**
       * VERIFY SMTP CONNECTION
       */
      await transporter.verify();

      console.log(
        "SMTP CONNECTION VERIFIED"
      );

      /**
       * VERIFICATION URL
       */
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
              padding:30px;
              background:#06111F;
              color:white;
              text-align:center;
            ">

              <img
                src="https://i.postimg.cc/xjPJL9LD/image-removebg-preview.png"
                alt="Auctra"
                style="
                  width:180px;
                  margin-bottom:20px;
                "
              />

              <h2 style="
                color:#06b6d4;
                margin-bottom:15px;
              ">
                Welcome to Auctra
              </h2>

              <p style="
                color:#cbd5e1;
                font-size:16px;
                line-height:1.6;
              ">
                Click below to verify your email and activate your account.
              </p>

              <a
                href="${verificationUrl}"
                style="
                  display:inline-block;
                  margin-top:25px;
                  padding:14px 24px;
                  background:#06b6d4;
                  color:#06111F;
                  text-decoration:none;
                  border-radius:12px;
                  font-weight:bold;
                "
              >
                Verify Email
              </a>

              <p style="
                margin-top:30px;
                color:#64748b;
                font-size:13px;
              ">
                If you didn't create this account,
                you can ignore this email.
              </p>

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

      console.log(
        "============================"
      );

      return true;
    } catch (error) {
      console.error(
        "EMAIL SEND ERROR:"
      );

      console.error(error);

      console.log(
        "============================"
      );

      throw error;
    }
  };

module.exports =
  sendVerificationEmail;