const express = require("express");
const cors = require("cors");
require("dotenv").config();

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const authRoutes = require("./routes/authRoutes");
const auctionRoutes = require("./routes/auctionRoutes");
const analyticsRoutes =
  require("./routes/analyticsRoutes");
const app = express();
const uploadRoutes =
  require("./routes/uploadRoutes");
const notificationRoutes =
  require("./routes/notificationRoutes");

app.use(cors());
app.use(express.json());
app.use(
  "/api/analytics",
  analyticsRoutes
);
app.use(
  "/api/upload",
  uploadRoutes
);
app.use(
  "/api/notifications",
  notificationRoutes
);

app.get("/", (req, res) => {
  res.send("Auctra API Running");
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/auctions", auctionRoutes);

module.exports = app;