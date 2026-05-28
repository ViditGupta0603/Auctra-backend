const prisma =
  require("../config/prisma");

const bcrypt =
  require("bcrypt");

const jwt =
  require("jsonwebtoken");

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
       * VALIDATION
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

      /**
       * ONLY GMAIL
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

      /**
       * PASSWORD LENGTH
       */
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

      /**
       * AGE CHECK
       */
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
       * EXISTING USER
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
            },
          }
        );

      return res
        .status(201)
        .json({
          message:
            "Registration successful",

          user,
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
       * CHECK PASSWORD
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
       * JWT TOKEN
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