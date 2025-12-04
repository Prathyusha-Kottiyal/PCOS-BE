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

    resetPlan: {
      startDate: { type: Date },
    },
  },
  { timestamps: true }
);

// JWT
userSchema.methods.getJWT = async function () {
  return await jwt.sign({ _id: this._id }, "DEV567", { expiresIn: "7d" });
};

userSchema.index({ name: 1 });

// Password validation
userSchema.methods.validatePassword = async function (passwordByUser) {
  return bcrypt.compare(passwordByUser, this.password);
};

module.exports = mongoose.model("User", userSchema);
