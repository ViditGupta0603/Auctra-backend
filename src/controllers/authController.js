const prisma =
  require("../config/prisma");

const bcrypt =
  require("bcrypt");

const jwt =
  require("jsonwebtoken");

const {
  v4: uuidv4,
} = require("uuid");

const sendVerificationEmail =
  require("../utils/sendVerificationEmail");

/**
 * REGISTER USER
 */
exports.registerUser =
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        age,
      } = req.body;

      /**
       * VALIDATIONS
       */

      if (
        !name ||
        !email ||
        !password ||
        !age
      ) {
        return res
          .status(400)
          .json({
            message:
              "All fields are required",
          });
      }

      if (
        !email.endsWith(
          "@gmail.com"
        )
      ) {
        return res
          .status(400)
          .json({
            message:
              "Only Gmail accounts allowed",
          });
      }

      if (
        password.length < 8
      ) {
        return res
          .status(400)
          .json({
            message:
              "Password must be at least 8 characters",
          });
      }

      if (
        Number(age) < 18
      ) {
        return res
          .status(400)
          .json({
            message:
              "Only 18+ users allowed",
          });
      }

      /**
       * CHECK USER
       */
      const existingUser =
        await prisma.user.findUnique(
          {
            where: {
              email,
            },
          }
        );

      if (existingUser) {
        return res
          .status(400)
          .json({
            message:
              "User already exists",
          });
      }

      /**
       * HASH PASSWORD
       */
      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      /**
       * TOKEN
       */
      const verificationToken =
        uuidv4();

      /**
       * CREATE USER
       */
      const user =
        await prisma.user.create(
          {
            data: {
              name,

              email,

              password:
                hashedPassword,

              age:
                Number(age),

              role: "user",

              isEmailVerified:
                false,

              verificationToken,
            },
          }
        );

      /**
       * SEND EMAIL
       */
      try {
        await sendVerificationEmail(
          email,
          verificationToken
        );
      } catch (
        emailError
      ) {
        console.error(
          "EMAIL ERROR:",
          emailError
        );

        /**
         * DELETE USER
         * IF EMAIL FAILS
         */
        await prisma.user.delete(
          {
            where: {
              id: user.id,
            },
          }
        );

        return res
          .status(500)
          .json({
            message:
              "Failed to send verification email",
          });
      }

      return res
        .status(201)
        .json({
          message:
            "Verification email sent successfully",
        });
    } catch (error) {
      console.error(
        "REGISTER ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Registration failed",
        });
    }
  };

/**
 * LOGIN USER
 */
exports.loginUser =
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      /**
       * FIND USER
       */
      const user =
        await prisma.user.findUnique(
          {
            where: {
              email,
            },
          }
        );

      if (!user) {
        return res
          .status(400)
          .json({
            message:
              "Invalid credentials",
          });
      }

      /**
       * EMAIL VERIFIED?
       */
      if (
        !user.isEmailVerified
      ) {
        return res
          .status(400)
          .json({
            message:
              "Please verify your email first",
          });
      }

      /**
       * PASSWORD CHECK
       */
      const isMatch =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!isMatch) {
        return res
          .status(400)
          .json({
            message:
              "Invalid credentials",
          });
      }

      /**
       * GENERATE JWT
       */
      const token =
        jwt.sign(
          {
            id: user.id,

            role:
              user.role,
          },
          process.env.JWT_SECRET,
          {
            expiresIn:
              "7d",
          }
        );

      return res.json({
        token,

        user: {
          id: user.id,

          name:
            user.name,

          email:
            user.email,

          role:
            user.role,
        },
      });
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          message:
            "Login failed",
        });
    }
  };

/**
 * VERIFY EMAIL
 */
exports.verifyEmail =
  async (req, res) => {
    try {
      const { token } =
        req.params;

      /**
       * FIND USER
       */
      const user =
        await prisma.user.findFirst(
          {
            where: {
              verificationToken:
                token,
            },
          }
        );

      if (!user) {
        return res
          .status(400)
          .send(
            "Invalid verification token"
          );
      }

      /**
       * VERIFY
       */
      await prisma.user.update(
        {
          where: {
            id: user.id,
          },

          data: {
            isEmailVerified:
              true,

            verificationToken:
              null,
          },
        }
      );

      /**
       * REDIRECT
       */
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?verified=true`
      );
    } catch (error) {
      console.error(
        "VERIFY ERROR:",
        error
      );

      return res
        .status(500)
        .send(
          "Verification failed"
        );
    }
  };