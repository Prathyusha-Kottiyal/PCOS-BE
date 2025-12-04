const express = require("express");
const router = express.Router();
const { validateSignupData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");

router.post("/signup", async (req, res) => {
  try {
    // validation logic here
    validateSignupData(req);

    const {
      name,
      emailId,
      password,
      dob,
      photoUrl,
      height,
      weight,

      // NEW optional measurements
      measurements = {}
    } = req.body;

    // encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // signup logic
    const userObject = {
      name,
      emailId,
      password: hashedPassword,
      dob,
      photoUrl,
      height,
      weight,

      // add optional measurements safely
      measurements: {
        waist: measurements.waist,
        hip: measurements.hip,
        chest: measurements.chest,
        arm: measurements.arm,
        thigh: measurements.thigh,
        neck: measurements.neck,
      },

      resetPlan: {
        startDate: new Date(),
      },
    };

    // create new user
    const user = new User(userObject);
    await user.save();

    const token = await user.getJWT();

    res.status(200).json({
      message: "Registration successful",
      token,
      user,
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
