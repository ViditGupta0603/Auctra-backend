const nodemailer =
  require("nodemailer");

const sendVerificationEmail =
  async (
    email,
    token
  ) => {
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

    /**
     * IMPORTANT
     * THIS MUST HIT BACKEND
     * NOT FRONTEND
     */
    const verificationUrl =
      `http://localhost:5000/api/auth/verify-email/${token}`;

    /**
     * SEND EMAIL
     */
    await transporter.sendMail(
      {
        from: `"Auctra" <${process.env.EMAIL_USER}>`,

        to: email,

        subject:
          "Verify Your Auctra Account",

        html: `
        <div style="
          font-family: Arial, sans-serif;
          background:#06111F;
          padding:40px;
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

          <h1 style="
            color:#06b6d4;
            margin-bottom:10px;
          ">
            Welcome to Auctra
          </h1>

          <p style="
            color:#cbd5e1;
            font-size:16px;
            line-height:1.6;
            max-width:500px;
            margin:auto;
          ">
            Thank you for registering on Auctra.
            Please verify your email address to activate your account and start bidding on premium auctions.
          </p>

          <a 
            href="${verificationUrl}"
            style="
              display:inline-block;
              margin-top:35px;
              background:#06b6d4;
              color:#06111F;
              padding:14px 28px;
              border-radius:12px;
              text-decoration:none;
              font-weight:bold;
              font-size:16px;
            "
          >
            Verify Email
          </a>

          <p style="
            margin-top:35px;
            color:#64748b;
            font-size:13px;
          ">
            If you did not create this account,
            you can safely ignore this email.
          </p>

        </div>
        `,
      }
    );
  };

module.exports =
  sendVerificationEmail;