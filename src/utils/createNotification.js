const prisma =
  require("../config/prisma");

const createNotification =
  async ({
    userId,
    title,
    message,
  }) => {
    return prisma.notification.create(
      {
        data: {
          userId,
          title,
          message,
        },
      }
    );
  };

module.exports =
  createNotification;