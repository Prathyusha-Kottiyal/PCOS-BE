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
  weight: { type: Number, min: 30, max: 200 },
  notes: {
    type: String,
    trim: true,
    maxLength: 200,
  },
});


module.exports = mongoose.model("Progress", progressSchema);
