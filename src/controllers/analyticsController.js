const prisma =
  require("../config/prisma");

exports.getDashboardAnalytics =
  async (req, res) => {
    try {
      // TOTAL AUCTIONS
      const totalAuctions =
        await prisma.auction.count(
          {
            where: {
              status:
                "APPROVED",
            },
          }
        );

      // TOTAL BIDS
      const totalBids =
        await prisma.bid.count();

      // REVENUE
      const revenueData =
        await prisma.bid.aggregate(
          {
            _sum: {
              amount: true,
            },
          }
        );

      // MONTHLY AUCTIONS
      const auctions =
        await prisma.auction.findMany(
          {
            where: {
              status:
                "APPROVED",
            },

            select: {
              createdAt: true,
            },
          }
        );

      const monthlyMap = {};

      auctions.forEach(
        (auction) => {
          const month =
            new Date(
              auction.createdAt
            ).toLocaleString(
              "default",
              {
                month:
                  "short",
              }
            );

          if (
            !monthlyMap[
              month
            ]
          ) {
            monthlyMap[
              month
            ] = 0;
          }

          monthlyMap[
            month
          ]++;
        }
      );

      const monthlyAuctions =
        Object.entries(
          monthlyMap
        ).map(
          ([
            month,
            auctions,
          ]) => ({
            month,
            auctions,
          })
        );

      res.json({
        totalAuctions,

        totalBids,

        revenue:
          revenueData._sum
            .amount || 0,

        monthlyAuctions,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          error.message,
      });
    }
  };