const express = require("express");

const router = express.Router();

const {
  createAuction,
  getAuctions,
  placeBid,
  approveAuction,
  rejectAuction,
  getPendingAuctions,
  getMyAuctions,
  getAuctionById,
  updateAuction,
  deleteAuction,
} = require("../controllers/auctionController");

const authMiddleware = require("../middleware/authMiddleware");

const adminMiddleware = require("../middleware/adminMiddleware");

/**
 * =========================================
 * SWAGGER TAGS
 * =========================================
 */

/**
 * @swagger
 * tags:
 *   name: Auctions
 *   description: Auction APIs
 */

/**
 * =========================================
 * GET ALL APPROVED AUCTIONS
 * =========================================
 */

/**
 * @swagger
 * /api/auctions:
 *   get:
 *     summary: Get all approved auctions
 *     tags: [Auctions]
 *     responses:
 *       200:
 *         description: Auctions fetched successfully
 */
router.get("/", getAuctions);

/**
 * =========================================
 * GET SINGLE AUCTION
 * =========================================
 */

/**
 * @swagger
 * /api/auctions/{id}:
 *   get:
 *     summary: Get auction by ID
 *     tags: [Auctions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Auction fetched successfully
 *       404:
 *         description: Auction not found
 */
router.get("/:id", getAuctionById);

/**
 * =========================================
 * CREATE AUCTION
 * =========================================
 */

/**
 * @swagger
 * /api/auctions:
 *   post:
 *     summary: Create new auction
 *     tags: [Auctions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - startingPrice
 *               - endTime
 *             properties:
 *               title:
 *                 type: string
 *                 example: Industrial Generator
 *               description:
 *                 type: string
 *                 example: Heavy duty generator for factory use
 *               startingPrice:
 *                 type: number
 *                 example: 5000
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-06-01T10:00:00Z
 *               imageUrl:
 *                 type: string
 *                 example: https://images.unsplash.com/photo-1581092921461-eab62e97a780
 *     responses:
 *       201:
 *         description: Auction created successfully
 */
router.post(
  "/",
  authMiddleware,
  createAuction
);

/**
 * =========================================
 * PLACE BID
 * =========================================
 */

/**
 * @swagger
 * /api/auctions/{id}/bid:
 *   post:
 *     summary: Place bid on auction
 *     tags: [Auctions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 7000
 *     responses:
 *       201:
 *         description: Bid placed successfully
 *       400:
 *         description: Invalid bid
 */
router.post(
  "/:id/bid",
  authMiddleware,
  placeBid
);

/**
 * =========================================
 * GET MY AUCTIONS
 * =========================================
 */

/**
 * @swagger
 * /api/auctions/my/auctions:
 *   get:
 *     summary: Get logged in user's auctions
 *     tags: [Auctions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User auctions fetched successfully
 */
router.get(
  "/my/auctions",
  authMiddleware,
  getMyAuctions
);

/**
 * =========================================
 * GET PENDING AUCTIONS
 * =========================================
 */

/**
 * @swagger
 * /api/auctions/admin/pending:
 *   get:
 *     summary: Get pending auctions
 *     tags: [Auctions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending auctions fetched successfully
 */
router.get(
  "/admin/pending",
  authMiddleware,
  adminMiddleware,
  getPendingAuctions
);

/**
 * =========================================
 * APPROVE AUCTION
 * =========================================
 */

/**
 * @swagger
 * /api/auctions/{id}/approve:
 *   patch:
 *     summary: Approve auction
 *     tags: [Auctions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Auction approved successfully
 */
router.patch(
  "/:id/approve",
  authMiddleware,
  adminMiddleware,
  approveAuction
);

/**
 * =========================================
 * REJECT AUCTION
 * =========================================
 */

/**
 * @swagger
 * /api/auctions/{id}/reject:
 *   patch:
 *     summary: Reject auction
 *     tags: [Auctions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Auction rejected successfully
 */
router.patch(
  "/:id/reject",
  authMiddleware,
  adminMiddleware,
  rejectAuction
);
/**
 * =========================================
 * UPDATE AUCTION
 * =========================================
 */

/**
 * @swagger
 * /api/auctions/{id}:
 *   patch:
 *     summary: Update auction
 *     tags: [Auctions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated MacBook Pro
 *               description:
 *                 type: string
 *                 example: Updated auction description
 *               startingPrice:
 *                 type: number
 *                 example: 1200
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-06-01T10:00:00Z
 *               imageUrl:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *     responses:
 *       200:
 *         description: Auction updated successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Auction not found
 */
router.patch(
  "/:id",
  authMiddleware,
  updateAuction
);

/**
 * =========================================
 * DELETE AUCTION
 * =========================================
 */

/**
 * @swagger
 * /api/auctions/{id}:
 *   delete:
 *     summary: Delete auction
 *     tags: [Auctions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Auction deleted successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Auction not found
 */
router.delete(
  "/:id",
  authMiddleware,
  deleteAuction
);
module.exports = router;