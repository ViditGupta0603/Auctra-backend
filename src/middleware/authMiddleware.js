const jwt =
  require("jsonwebtoken");

module.exports = (
  req,
  res,
  next
) => {
  try {
    const authHeader =
      req.headers.authorization;

    /**
     * NO AUTH HEADER
     */
    if (!authHeader) {
      return res
        .status(401)
        .json({
          message:
            "No token provided",
        });
    }

    /**
     * TOKEN FORMAT
     * Bearer TOKEN
     */
    const parts =
      authHeader.split(
        " "
      );

    if (
      parts.length !== 2
    ) {
      return res
        .status(401)
        .json({
          message:
            "Invalid token format",
        });
    }

    const token =
      parts[1];

    /**
     * EMPTY TOKEN
     */
    if (
      !token ||
      token ===
        "undefined" ||
      token === "null"
    ) {
      return res
        .status(401)
        .json({
          message:
            "Invalid token",
        });
    }

    /**
     * VERIFY JWT
     */
    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    req.user = decoded;

    next();
  } catch (error) {
    console.error(
      "JWT ERROR:",
      error.message
    );

    return res
      .status(401)
      .json({
        message:
          "Unauthorized",
      });
  }
};