const express = require("express");
const router = express.Router();
const UserLifestyleRoutine = require("../models/userLifeStyle");
const LifestyleSuggestion = require("../models/lifestyleSuggestion");
const { userAuth } = require("../middlewares/auth");

/**
 * ===========================
 * GET – User Routine List
 * ===========================
 */
router.get("/", userAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    if (limit > 50) limit = 50;

    const skip = (page - 1) * limit;

    const routines = await UserLifestyleRoutine.find({
      userId: req.user._id,
      isActive: true,
    })
      .populate("lifestyleSuggestionId")
      .sort({ preferredTime: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      message: "User routine fetched successfully",
      data: routines,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * ===========================
 * POST – Add to Routine
 * ===========================
 */
router.post("/", userAuth, async (req, res) => {
  try {
    const {
      lifestyleSuggestionId,
      repeat,
      preferredTime,
      preferredTimeSlot,
      duration,
      reminderEnabled,
    } = req.body;

    // validate suggestion exists
    const suggestion = await LifestyleSuggestion.findById(
      lifestyleSuggestionId
    );
    if (!suggestion) {
      return res.status(404).json({
        message: "Lifestyle suggestion not found",
      });
    }

    const routine = new UserLifestyleRoutine({
      userId: req.user._id,
      lifestyleSuggestionId,
      repeat,
      preferredTime,
      preferredTimeSlot,
      duration,
      reminderEnabled,
    });

    await routine.save();

    res.status(201).json({
      message: "Routine added successfully",
      data: routine,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "This routine already exists for the user",
      });
    }

    res.status(400).json({ message: err.message });
  }
});

/**
 * ===========================
 * PATCH – Update Routine
 * ===========================
 */
router.patch("/:id", userAuth, async (req, res) => {
  try {
    const routine = await UserLifestyleRoutine.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!routine) {
      return res.status(404).json({
        message: "Routine not found",
      });
    }

    const allowedFields = [
      "repeat",
      "preferredTime",
      "preferredTimeSlot",
      "duration",
      "isActive",
      "reminderEnabled",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        routine[field] = req.body[field];
      }
    });

    await routine.save();

    res.json({
      message: "Routine updated successfully",
      data: routine,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * ===========================
 * DELETE – Remove Routine
 * (Soft delete by default)
 * ===========================
 */
router.delete("/:id", userAuth, async (req, res) => {
  try {
    const routine = await UserLifestyleRoutine.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!routine) {
      return res.status(404).json({
        message: "Routine not found",
      });
    }

    routine.isActive = false;
    await routine.save();

    res.json({
      message: "Routine removed successfully",
      id: routine._id,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
