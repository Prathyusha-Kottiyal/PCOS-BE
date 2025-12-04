const mongoose = require("mongoose");
const validator = require("validator");

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  date: {
    type: String,
    required: true,
    validate(value) {
      if (new Date(value) > new Date()) {
        throw new Error("Date cannot be in the future");
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

  weight: { type: Number, min: 30, max: 200 },

  measurements: {
    chest: { type: Number, min: 40, max: 200 },
    waist: { type: Number, min: 30, max: 200 },
    hip: { type: Number, min: 40, max: 200 },
    thigh: { type: Number, min: 20, max: 150 },
    arm: { type: Number, min: 10, max: 100 },
    neck: { type: Number, min: 10, max: 100 },
  },

  notes: {
    type: String,
    trim: true,
    maxLength: 200,
  },
});

module.exports = mongoose.model("Progress", progressSchema);
