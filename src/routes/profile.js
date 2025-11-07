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
    // Fetch user profile logic here
    if (!user) {
      throw new Error("User not found");
    }
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
    // Update user profile logic here
    Object.keys(updates).forEach((key) => {
      user[key] = updates[key];
    });
    await user.save();
    res.json({ message: "test message", data: user });
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
    const updates = req.body;
    const isPasswordMatch = await user.validatePassword(updates.existingPassword);
    if(!isPasswordMatch){   
      throw new Error("Existing password is incorrect");
    }
    if (!validator.isStrongPassword(updates.newPassword)) {
      throw new Error("Not a strong password");
    }
    const hasedPassword=await bcrypt.hash(updates.newPassword, 10); 
    // Update user password logic here
    user.password = hasedPassword; 
    await user.save();
    res.json({ message: "password updated", data: user });
  } catch (err) {
    res.status(400).send("Error :" + err.message);
  }
});

module.exports = router;
