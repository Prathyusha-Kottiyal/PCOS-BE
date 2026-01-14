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

    // 1. Check if an entry (active or inactive) already exists
    let routine = await UserLifestyleRoutine.findOne({
      userId: req.user._id,
      lifestyleSuggestionId,
    });

    if (routine) {
      // If it exists but is inactive, reactivate and update it
      if (!routine.isActive) {
        routine.isActive = true;
        routine.repeat = repeat;
        routine.preferredTime = preferredTime;
        routine.preferredTimeSlot = preferredTimeSlot;
        routine.duration = duration;
        routine.reminderEnabled = reminderEnabled;
        
        await routine.save();
        return res.status(200).json({
          message: "Routine reactivated successfully",
          data: routine,
        });
      } else {
        // If it's already active, return the conflict error
        return res.status(409).json({
          message: "This routine is already active in your list",
        });
      }
    }

    // 2. If no entry exists at all, create a new one
    const newRoutine = new UserLifestyleRoutine({
      userId: req.user._id,
      lifestyleSuggestionId,
      repeat,
      preferredTime,
      preferredTimeSlot,
      duration,
      reminderEnabled,
    });

    await newRoutine.save();

    res.status(201).json({
      message: "Routine added successfully",
      data: newRoutine,
    });
  } catch (err) {
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
    const result = await UserLifestyleRoutine.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!result) {
      return res.status(404).json({ message: "Routine not found" });
    }

    res.json({
      message: "Routine deleted permanently",
      id: req.params.id,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
