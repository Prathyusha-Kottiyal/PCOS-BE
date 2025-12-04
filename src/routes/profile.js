const express = require("express");
const router = express.Router();
const validator = require("validator");
const bcrypt = require("bcrypt");
const { userAuth } = require("../middlewares/auth");
const {
  validateEditProfile,
  validateUpdatePassword,
} = require("../utils/validation");

router.get("/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) throw new Error("User not found");
    res.send(user);
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

    // --- NEW: handle optional nested measurements ---
    if (updates.measurements) {
      user.measurements = {
        ...user.measurements,          // keep existing values
        ...updates.measurements,       // update only what is sent
      };
      delete updates.measurements;     // remove from main updates object
    }

    // Update remaining fields (name, dob, height, weight, etc.)
    Object.keys(updates).forEach((key) => {
      user[key] = updates[key];
    });

    await user.save();
    res.json({ message: "Profile updated", data: user });

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

    res.json({ message: "Password updated", data: user });

  } catch (err) {
    res.status(400).send("Error :" + err.message);
  }
});

module.exports = router;
