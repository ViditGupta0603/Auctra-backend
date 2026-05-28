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
 * REGISTER
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
              "Only users above 18 are allowed",
          });
      }

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

              verificationToken,

              isEmailVerified:
                false,
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
        /**
         * DELETE USER IF EMAIL FAILS
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

      res.status(201).json({
        message:
          "Verification email sent successfully. Please check your Gmail.",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          error.message,
      });
    }
  };

/**
 * LOGIN
 */
exports.loginUser =
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

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
       * VERIFIED?
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
       * JWT
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

      res.json({
        token,

        user: {
          id: user.id,

          name:
            user.name,

          email:
            user.email,

          role:
            user.role,

          age:
            user.age,
        },
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          error.message,
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
       * REDIRECT TO LOGIN
       */
      return res.redirect(
        "https://auctra-frontend.onrender.com/login?verified=true"
      );
    } catch (error) {
      console.error(error);

      res.status(500).send(
        error.message
      );
    }
  };