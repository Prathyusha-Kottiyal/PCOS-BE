const express = require("express");
const router = express.Router();
const Progress = require("../models/progress");
const { userAuth } = require("../middlewares/auth");

// Cloudinary + Multer
const { cloudinary, storage } = require("../config/cloudinary");
const multer = require("multer");
const upload = multer({ storage });

router.get("/visualjourney", userAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    if (limit > 50) limit = 50;
    const skip = (page - 1) * limit;

    // find entries that have a non-empty photoUrl
    const query = {
      user: req.user._id,
      photoUrl: { $exists: true, $nin: [null, ""] },
    };

    const progress = await Progress.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      message: "Visual journey fetched successfully",
      data: progress,
    });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});


router.get("/", userAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    if (limit > 50) limit = 50;

    const skip = (page - 1) * limit;

    const progress = await Progress.find({ user: req.user._id })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      message: "Data fetched successfully",
      data: progress,
    });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

// ========== POST Progress ==========
router.post("/", userAuth, upload.single("photo"), async (req, res) => {
  try {
    const { date, weight, notes } = req.body;

    // Measurements (all optional)
    const measurements = {
      chest: req.body.chest,
      waist: req.body.waist,
      hip: req.body.hip,
      thigh: req.body.thigh,
      arm: req.body.arm,
      neck: req.body.neck,
    };

    // Remove undefined values
    Object.keys(measurements).forEach(
      (key) => measurements[key] === undefined && delete measurements[key]
    );

    const photoUrl = req.file?.path || null;

    const progress = new Progress({
      user: req.user._id,
      date,
      weight,
      notes,
      measurements,
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

// ========== UPDATE Progress ==========
router.patch("/:id", userAuth, upload.single("photo"), async (req, res) => {
  try {
    const progress = await Progress.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!progress) {
      return res.status(404).json({ message: "Progress entry not found" });
    }

    // --- Update fields ---
    const { date, weight, notes } = req.body;

    if (date) progress.date = date;
    if (weight !== undefined) progress.weight = weight;
    if (notes !== undefined) progress.notes = notes;

    // --- Update measurements (optional) ---
    const measurementFields = ["chest", "waist", "hip", "thigh", "arm", "neck"];
    measurementFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        progress.measurements[field] = req.body[field];
      }
    });

    // --- Handle photo update ---
    if (req.file) {
      // If old image exists, delete from Cloudinary
      if (progress.photoUrl) {
        const publicId = progress.photoUrl
          .split("/")
          .slice(-1)[0]
          .split(".")[0];

        await cloudinary.uploader.destroy(publicId);
      }

      progress.photoUrl = req.file.path;
    }

    await progress.save();

    res.json({
      message: "Progress updated successfully",
      data: progress,
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Error: " + err.message });
  }
});

// ========== DELETE Progress ==========
router.delete("/:id", userAuth, async (req, res) => {
  try {
    const progress = await Progress.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!progress) {
      return res.status(404).json({ message: "Progress entry not found" });
    }

    // Delete photo from Cloudinary if exists
    if (progress.photoUrl) {
      const publicId = progress.photoUrl
        .split("/")
        .slice(-1)[0]
        .split(".")[0];

      await cloudinary.uploader.destroy(publicId);
    }

    await Progress.deleteOne({ _id: progress._id });

    res.json({
      message: "Progress entry deleted successfully",
      id: progress._id,
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Error: " + err.message });
  }
});


module.exports = router;
