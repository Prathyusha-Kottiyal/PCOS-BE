const express = require("express");
const router = express.Router();
const { validateSignupData } = require("../utils/validation");
const User = require("../models/user");
const Progress = require("../models/progress");
const bcrypt = require("bcrypt");
const { cloudinary } = require("../config/cloudinary");
const { userAuth } = require("../middlewares/auth");

router.post("/signup", async (req, res) => {
  try {
    validateSignupData(req);

    const {
      name,
      emailId,
      password,
      dob,
      photoUrl,
      height,

      // moving these to Progress
      weight,
      measurements = {}
    } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // USER data (only stable fields)
    const userObject = {
      name,
      emailId,
      password: hashedPassword,
      dob,
      photoUrl,
      height,

      resetPlan: { startDate: new Date() }
    };

    // Create USER
    const user = new User(userObject);
    await user.save();

    // ========== CREATE INITIAL PROGRESS ENTRY ==========
    const progressEntry = new Progress({
      user: user._id,
      date: new Date().toISOString(),

      weight: weight || null,

      notes: "Initial measurements from signup",

      measurements: {
        waist: measurements.waist || null,
        hip: measurements.hip || null,
        chest: measurements.chest || null,
        arm: measurements.arm || null,
        thigh: measurements.thigh || null,
        neck: measurements.neck || null,
      },
      photoUrl: ""
    });

    await progressEntry.save();

    // Generate token
    const token = await user.getJWT();

    res.status(200).json({
      message: "Registration successful",
      token,
      user,
      initialProgress: progressEntry
    });

  } catch (err) {
    res.status(400).send("Error signing up user: " + err.message);
  }
});


// LOGIN API
router.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId });
    if (!user) throw new Error("Invalid credentials");

    const isPasswordMatch = await user.validatePassword(password);
    if (!isPasswordMatch) throw new Error("Invalid credentials");

    const token = await user.getJWT();

    res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (err) {
    res.status(400).send("Error logging in user: " + err.message);
  }
});

// LOGOUT
router.post("/logout", async (req, res) => {
  try {
    res
      .cookie("token", null, { expires: new Date(0) })
      .send("Logout successful");
  } catch (err) {
    res.status(400).send("Error logging out user: " + err.message);
  }
});

// DELETE ACCOUNT + DELETE ALL USER DATA

router.delete("/delete-account", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    const extractPublicId = (url) => {
      if (!url) return null;

      // Remove version
      const afterVersion = url.split(/\/v\d+\//)[1];
      if (!afterVersion) return null;

      // Remove file extension
      return afterVersion.replace(/\.[^/.]+$/, "");
    };

    // 1. Progress photos
    const progressEntries = await Progress.find({ user: userId });
    for (const entry of progressEntries) {
      if (entry.photoUrl) {
        const publicId = extractPublicId(entry.photoUrl);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }
    }

    // 2. User profile photo
    if (req.user.photoUrl) {
      const publicId = extractPublicId(req.user.photoUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // 3. Delete DB entries
    await Progress.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    res.json({
      message: "Account + all photos deleted successfully",
      deletedUser: userId
    });

  } catch (err) {
    console.error("Delete error:", err);
    res.status(400).send("Error deleting account: " + err.message);
  }
});




module.exports = router;
