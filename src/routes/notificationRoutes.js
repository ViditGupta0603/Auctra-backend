const express =
  require("express");

const router =
  express.Router();

const prisma =
  require("../config/prisma");

const authMiddleware =
  require("../middleware/authMiddleware");

/**
 * GET MY NOTIFICATIONS
 */
router.get(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      const notifications =
        await prisma.notification.findMany(
          {
            where: {
              userId:
                req.user.id,
            },

            orderBy: {
              createdAt:
                "desc",
            },
          }
        );

      res.json(
        notifications
      );
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          error.message,
      });
    }
  }
);

/**
 * MARK AS READ
 */
router.patch(
  "/:id/read",
  authMiddleware,
  async (req, res) => {
    try {
      const notification =
        await prisma.notification.update(
          {
            where: {
              id:
                req.params.id,
            },

            data: {
              read: true,
            },
          }
        );

      res.json(
        notification
      );
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          error.message,
      });
    }
  }
);

module.exports = router;