const express = require("express");
const router = express.Router();
const PeriodCycle = require("../models/periodCycle");
const PeriodLog = require("../models/periodLog");
const PeriodProfile = require("../models/periodProfile");
const { userAuth } = require("../middlewares/auth");

/**
 * ===========================
 * GET – User Period Cycles
 * ===========================
 */
router.get("/cycles", userAuth, async (req, res) => {
  try {
    const cycles = await PeriodCycle.find({
      userId: req.user._id,
    }).sort({ periodStart: -1 });

    res.json({
      message: "Period cycles fetched successfully",
      data: cycles,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * ===========================
 * POST – Add Period Cycle
 * ===========================
 */
router.post("/cycles", userAuth, async (req, res) => {
  try {
    const { periodStart, periodEnd, notes } = req.body;

    if (!periodStart) {
      return res.status(400).json({
        message: "periodStart is required",
      });
    }

    let periodLength = null;
    if (periodEnd) {
      const diff =
        (new Date(periodEnd) - new Date(periodStart)) /
          (1000 * 60 * 60 * 24) +
        1;
      periodLength = Math.max(1, Math.round(diff));
    }

    // find last cycle to calculate cycle length
    const lastCycle = await PeriodCycle.findOne({
      userId: req.user._id,
    }).sort({ periodStart: -1 });

    let cycleLength = null;
    if (lastCycle) {
      const diff =
        (new Date(periodStart) - new Date(lastCycle.periodStart)) /
        (1000 * 60 * 60 * 24);
      cycleLength = Math.round(diff);
    }

    const cycle = new PeriodCycle({
      userId: req.user._id,
      periodStart,
      periodEnd,
      periodLength,
      cycleLength,
    });

    await cycle.save();

    // update profile
    await PeriodProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        lastPeriodStart: periodStart,
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      message: "Period cycle added successfully",
      data: cycle,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * ===========================
 * PATCH – Update Period Cycle
 * ===========================
 */
router.patch("/cycles/:id", userAuth, async (req, res) => {
  try {
    const cycle = await PeriodCycle.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!cycle) {
      return res.status(404).json({
        message: "Period cycle not found",
      });
    }

    const allowedFields = ["periodStart", "periodEnd", "notes"];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        cycle[field] = req.body[field];
      }
    });

    if (cycle.periodStart && cycle.periodEnd) {
      const diff =
        (new Date(cycle.periodEnd) - new Date(cycle.periodStart)) /
          (1000 * 60 * 60 * 24) +
        1;
      cycle.periodLength = Math.round(diff);
    }

    await cycle.save();

    res.json({
      message: "Period cycle updated successfully",
      data: cycle,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * ===========================
 * DELETE – Remove Period Cycle
 * ===========================
 */
router.delete("/cycles/:id", userAuth, async (req, res) => {
  try {
    const cycle = await PeriodCycle.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!cycle) {
      return res.status(404).json({
        message: "Period cycle not found",
      });
    }

    await PeriodLog.deleteMany({ cycleId: cycle._id });

    res.json({
      message: "Period cycle deleted successfully",
      id: cycle._id,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * ===========================
 * GET – Logs for a Cycle
 * ===========================
 */
router.get("/logs/:cycleId", userAuth, async (req, res) => {
  try {
    const logs = await PeriodLog.find({
      userId: req.user._id,
      cycleId: req.params.cycleId,
    }).sort({ date: 1 });

    res.json({
      message: "Period logs fetched successfully",
      data: logs,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * ===========================
 * POST – Add / Update Daily Log
 * ===========================
 */
router.post("/logs", userAuth, async (req, res) => {
  try {
    const {
      cycleId,
      date,
      flow,
      painLevel,
      mood,
      symptoms,
      notes,
    } = req.body;

    if (!cycleId || !date) {
      return res.status(400).json({
        message: "cycleId and date are required",
      });
    }

    const log = await PeriodLog.findOneAndUpdate(
      { userId: req.user._id, cycleId, date },
      {
        flow,
        painLevel,
        mood,
        symptoms,
        notes,
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      message: "Period log saved successfully",
      data: log,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * ===========================
 * GET – Period Profile
 * ===========================
 */
router.get("/profile", userAuth, async (req, res) => {
  try {
    const profile = await PeriodProfile.findOne({
      userId: req.user._id,
    });

    res.json({
      message: "Period profile fetched successfully",
      data: profile,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
