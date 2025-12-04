const express = require("express");
const router = express.Router();
const { validateSignupData } = require("../utils/validation");
const User = require("../models/user");
const Progress = require("../models/progress");
const bcrypt = require("bcrypt");

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

      photoUrl:
        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
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

module.exports = router;
