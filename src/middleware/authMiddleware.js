const jwt =
  require("jsonwebtoken");

const prisma =
  require("../config/prisma");

module.exports =
  async (
    req,
    res,
    next
  ) => {
    try {
      const authHeader =
        req.headers.authorization;

      if (
        !authHeader ||
        !authHeader.startsWith(
          "Bearer "
        )
      ) {
        return res
          .status(401)
          .json({
            error:
              "Unauthorized",
          });
      }

      const token =
        authHeader.split(
          " "
        )[1];

      const decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );

      /**
       * CHECK USER EXISTS
       */
      const user =
        await prisma.user.findUnique(
          {
            where: {
              id:
                decoded.id,
            },
          }
        );

      if (!user) {
        return res
          .status(401)
          .json({
            error:
              "User not found",
          });
      }

      req.user = user;

      next();
    } catch (error) {
      console.error(error);

      return res
        .status(401)
        .json({
          error:
            "Invalid token",
        });
    }
  };