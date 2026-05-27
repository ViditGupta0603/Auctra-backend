const express =
  require("express");

const router =
  express.Router();

const upload =
  require("../middleware/uploadMiddleware");

router.post(
  "/image",
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({
            error:
              "No image uploaded",
          });
      }

      res.json({
        imageUrl:
          req.file.path,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          error.message ||
          "Upload failed",
      });
    }
  }
);

module.exports = router;