const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 80,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email format");
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Password is not strong enough");
        }
      },
    },
    dob: {
      type: String,
      required: true,
      validate(value) {
        if (new Date(value) > new Date()) {
          throw new Error("Date of birth cannot be in the future");
        }
      },
    },
    photoUrl: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid photo URL");
        }
      },
    },
    height: { type: Number, min: 100, max: 250 },
    weight: { type: Number, min: 30, max: 200 },
    resetPlan: {
      startDate: { type: Date },
    },
  },
  { timestamps: true }
);

userSchema.methods.getJWT = async function () {
  const token = await jwt.sign({ _id: this._id }, "DEV567", {
    expiresIn: "7d",
  });
  return token;
};
userSchema.index({ name: 1 });

userSchema.methods.validatePassword = async function (passwordByUser) {
  const passwordHash = this.password;
  const isPasswordMatch = await bcrypt.compare(passwordByUser, passwordHash);
  return isPasswordMatch;
};
module.exports = mongoose.model("User", userSchema);
