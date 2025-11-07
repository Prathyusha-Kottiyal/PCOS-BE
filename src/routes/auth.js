const express = require("express");
const router = express.Router();
const { validateSignupData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");

router.post("/signup", async (req, res) => {
  try {
    // validation logic here
    validateSignupData(req);
    // encript the password
    const { name, emailId, password,  dob,
      photoUrl,
      height,
      weight } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // salt rounds = 10, more the number more secure but slower

    // Signup logic here
    const userObject = {
      name,
      emailId,
      password: hashedPassword,
      dob,
      photoUrl,
      height,
      weight,
      resetPlan: {
        startDate: new Date()
      }
    };
    // create a new instance of User model

    const user = new User(userObject);
    await user.save();
    res.send(user);
  } catch (err) {
    res.status(400).send("Error signing up user" + err.message);
  }
});



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


router.post("/logout", async (req, res) => {
  try {
    //clean up actions here before logout
    res.cookie("token", null, { expires: new Date(0) }).send("Logout successful");
  } catch (err) {
    res.status(400).send("Error logging in user" + err.message);
  }
});    

module.exports = router;