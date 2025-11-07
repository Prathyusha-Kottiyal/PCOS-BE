const express = require("express");
const router = express.Router();
const Progress = require("../models/progress");
const { validateProgressData } = require("../utils/validation");
const { userAuth } = require("../middlewares/auth");

// Import cloudinary + storage
const { cloudinary, storage } = require("../config/cloudinary");
const multer = require("multer");

// Multer setup using Cloudinary storage
const upload = multer({ storage });

// ========== GET Progress ==========
router.get("/", userAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    if (limit > 50) limit = 50;

    const skip = (page - 1) * limit;
    const progress = await Progress.find({ user: req.user._id })
      .skip(skip)
      .limit(limit);

    res.json({ message: "Data fetched successfully", data: progress });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

// ========== POST Progress ==========
router.post("/", userAuth, upload.single("photo"), async (req, res) => {
  try {
    const { date, weight, notes } = req.body;

    // Cloudinary-storage automatically uploads and sets req.file.path
    const photoUrl = req.file?.path || null;

    console.log("Uploaded to Cloudinary:", req.file);

    const progress = new Progress({
      user: req.user._id,
      date,
      weight,
      notes,
      photoUrl,
    });

    await progress.save();

    res.status(201).json({
      message: "Progress saved successfully",
      data: progress,
    });
  } catch (error) {
    console.error("Error saving progress:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
