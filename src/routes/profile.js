const express = require("express");
const router = express.Router();
const validator = require("validator");
const bcrypt = require("bcrypt");
const { userAuth } = require("../middlewares/auth");
const Progress = require("../models/progress");
const {
  validateEditProfile,
  validateUpdatePassword,
} = require("../utils/validation");


router.get("/view", userAuth, async (req, res) => {
  try {
    const user = req.user;

    const latestProgress = await Progress.findOne({ userId: user._id })
      .sort({ date: -1 });

    const response = {
      name: user.name,
      emailId: user.emailId,
      dob: user.dob,
      photoUrl: user.photoUrl,

      // height stays in Profile
      height: user.height,

      // weight + measurements come from Progress table
      weight: latestProgress?.weight || null,
      measurements: latestProgress?.measurements || {}
    };

    res.json(response);

  } catch (err) {
    res.status(400).send("Error :" + err.message);
  }
});


router.patch("/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfile(req)) {
      throw new Error("Invalid updates!");
    }

    const user = req.user;
    const updates = req.body;

    // Extract only the fields related to progress
    const { weight, measurements, ...stableFields } = updates;

    const hasProgressUpdates =
      weight !== undefined || measurements !== undefined;

    // 1️⃣ If weight or measurements is in request → add progress entry
    if (hasProgressUpdates) {
      await Progress.create({
        userId: user._id,
        date: new Date(),
        weight: weight ?? null,
        measurements: measurements ?? {}
      });
    }

    // 2️⃣ Update stable profile fields (name, emailId, dob, photoUrl, height)
    Object.keys(stableFields).forEach((key) => {
      user[key] = stableFields[key];
    });

    // Save ONLY if stable fields exist
    if (Object.keys(stableFields).length > 0) {
      await user.save();
    }

    res.json({
      message: "Profile updated successfully",
      progressUpdated: hasProgressUpdates,
      userUpdated: Object.keys(stableFields).length > 0,
    });

  } catch (err) {
    res.status(400).send("Error :" + err.message);
  }
});


router.patch("/password", userAuth, async (req, res) => {
  try {
    if (!validateUpdatePassword(req)) {
      throw new Error("Invalid updates!");
    }

    const user = req.user;
    const { existingPassword, newPassword } = req.body;

    const isPasswordMatch = await user.validatePassword(existingPassword);
    if (!isPasswordMatch) {
      throw new Error("Existing password is incorrect");
    }

    if (!validator.isStrongPassword(newPassword)) {
      throw new Error("Not a strong password");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({
      message: "Password updated successfully",
      data: user,
    });

  } catch (err) {
    res.status(400).send("Error :" + err.message);
  }
});

module.exports = router;
