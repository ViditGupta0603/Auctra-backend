const prisma = require("../config/prisma");

/**
 * =========================================
 * CREATE AUCTION
 * =========================================
 */
exports.createAuction = async (
  req,
  res
) => {
  try {
    const {
      title,
      description,
      category,
      startingPrice,
      endTime,
      imageUrl,
    } = req.body;

    const auction =
      await prisma.auction.create({
        data: {
          title,
          description,
          category,

          startingPrice:
            Number(
              startingPrice
            ),

          currentBid:
            Number(
              startingPrice
            ),

          endTime:
            new Date(
              endTime
            ),

          imageUrl,

          status:
            "PENDING",

          seller: {
            connect: {
              id: req.user.id,
            },
          },
        },
      });

    res.status(201).json({
      message:
        "Auction submitted for approval",
      auction,
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
 * =========================================
 * GET ALL APPROVED AUCTIONS
 * =========================================
 */
exports.getAuctions =
  async (req, res) => {
    try {
      const auctions =
        await prisma.auction.findMany(
          {
            where: {
              status:
                "APPROVED",
            },

            orderBy: {
              updatedAt:
                "desc",
            },

            include: {
              seller: true,
              bids: {
                orderBy: {
                  amount:
                    "desc",
                },
              },
            },
          }
        );

      res.set(
        "Cache-Control",
        "no-store"
      );

      res.json(auctions);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          error.message,
      });
    }
  };

  
/**
 * =========================================
 * GET SINGLE AUCTION
 * =========================================
 */
exports.getAuctionById =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const auction =
        await prisma.auction.findUnique(
          {
            where: {
              id,
            },

            include: {
              seller: true,

              bids: {
                include: {
                  user: true,
                },

                orderBy: {
                  createdAt:
                    "desc",
                },
              },
            },
          }
        );

      if (!auction) {
        return res
          .status(404)
          .json({
            error:
              "Auction not found",
          });
      }

      res.json(auction);
    } catch (error) {
      console.error(
        error
      );

      res.status(500).json({
        error:
          error.message,
      });
    }
  };

/**
 * =========================================
 * PLACE BID
 * =========================================
 */
exports.placeBid = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    const { amount } =
      req.body;

    const auction =
      await prisma.auction.findUnique(
        {
          where: {
            id,
          },
        }
      );

    if (!auction) {
      return res
        .status(404)
        .json({
          error:
            "Auction not found",
        });
    }

    if (
      auction.status !==
      "APPROVED"
    ) {
      return res
        .status(400)
        .json({
          error:
            "Auction is not approved",
        });
    }

    if (
      new Date() >
      new Date(
        auction.endTime
      )
    ) {
      return res
        .status(400)
        .json({
          error:
            "Auction ended",
        });
    }

    if (
      Number(amount) <=
      auction.currentBid
    ) {
      return res
        .status(400)
        .json({
          error:
            "Bid must be higher than current bid",
        });
    }

    /**
     * CREATE BID
     */
    const bid =
      await prisma.bid.create({
        data: {
          amount:
            Number(amount),

          user: {
            connect: {
              id: req.user.id,
            },
          },

          auction: {
            connect: {
              id,
            },
          },
        },
      });

    /**
     * UPDATE AUCTION BID
     */
    const updatedAuction =
      await prisma.auction.update(
        {
          where: {
            id,
          },

          data: {
            currentBid:
              Number(amount),
          },
        }
      );

    /**
     * SOCKET EVENT
     */
    const io =
      req.app.get("io");

    io.emit(
      "bidPlaced",
      {
        auctionId:
          updatedAuction.id,

        currentBid:
          updatedAuction.currentBid,
      }
    );

    res.status(201).json({
      message:
        "Bid placed successfully",

      bid,

      auction:
        updatedAuction,
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
 * =========================================
 * APPROVE AUCTION
 * =========================================
 */
exports.approveAuction =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const updatedAuction =
        await prisma.auction.update(
          {
            where: {
              id,
            },

            data: {
              status:
                "APPROVED",
            },

            include: {
              seller: true,
              bids: true,
            },
          }
        );

      res.json({
        message:
          "Auction approved successfully",

        auction:
          updatedAuction,
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
 * =========================================
 * REJECT AUCTION
 * =========================================
 */
exports.rejectAuction =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const auction =
        await prisma.auction.update(
          {
            where: {
              id,
            },

            data: {
              status:
                "REJECTED",
            },
          }
        );

      res.json({
        message:
          "Auction rejected successfully",

        auction,
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
 * =========================================
 * GET MY AUCTIONS
 * =========================================
 */
exports.getMyAuctions =
  async (req, res) => {
    try {
      const auctions =
        await prisma.auction.findMany(
          {
            where: {
              sellerId:
                req.user.id,
            },

            include: {
              bids: true,
            },

            orderBy: {
              createdAt:
                "desc",
            },
          }
        );

      res.json(auctions);
    } catch (error) {
      console.error(
        error
      );

      res.status(500).json({
        error:
          error.message,
      });
    }
  };

/**
 * =========================================
 * GET PENDING AUCTIONS
 * =========================================
 */
exports.getPendingAuctions =
  async (req, res) => {
    try {
      const auctions =
        await prisma.auction.findMany(
          {
            where: {
              status:
                "PENDING",
            },

            orderBy: {
              updatedAt:
                "desc",
            },
          }
        );

      res.json(auctions);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          error.message,
      });
    }
  };

  exports.deleteAuction =
  async (req, res) => {
    try {
      const auction =
        await prisma.auction.findUnique(
          {
            where: {
              id: req.params.id,
            },
          }
        );

      if (!auction) {
        return res
          .status(404)
          .json({
            error:
              "Auction not found",
          });
      }

      if (
        auction.sellerId !==
        req.user.id &&
        req.user.role !==
          "admin"
      ) {
        return res
          .status(403)
          .json({
            error:
              "Unauthorized",
          });
      }

      await prisma.bid.deleteMany(
        {
          where: {
            auctionId:
              auction.id,
          },
        }
      );

      await prisma.auction.delete(
        {
          where: {
            id: auction.id,
          },
        }
      );

      res.json({
        message:
          "Auction deleted successfully",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          error.message,
      });
    }
  };
  
  exports.updateAuction =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const {
        title,
        description,
        category,
        startingPrice,
        endTime,
        imageUrl,
      } = req.body;

      const existingAuction =
        await prisma.auction.findUnique(
          {
            where: {
              id,
            },
          }
        );

      if (
        !existingAuction
      ) {
        return res
          .status(404)
          .json({
            error:
              "Auction not found",
          });
      }

      /**
       * OWNER CHECK
       */
      if (
        existingAuction.sellerId !==
        req.user.id
      ) {
        return res
          .status(403)
          .json({
            error:
              "Unauthorized",
          });
      }

      const updatedAuction =
        await prisma.auction.update(
          {
            where: {
              id,
            },

            data: {
              title,

              description,

              category,

              startingPrice:
                Number(
                  startingPrice
                ),

              endTime:
                new Date(
                  endTime
                ),

              imageUrl,

              /**
               * IMPORTANT
               * REQUIRES RE-APPROVAL
               */
              status:
                "PENDING",
            },
          }
        );

      res.json({
        message:
          "Auction updated successfully",

        auction:
          updatedAuction,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          error.message,
      });
    }
  };