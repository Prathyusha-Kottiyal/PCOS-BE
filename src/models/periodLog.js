const mongoose = require("mongoose");

const PeriodLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    cycleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PeriodCycle",
      required: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
    },

    flow: {
      type: String,
      enum: ["spotting", "light", "medium", "heavy"],
    },

    painLevel: {
      type: Number,
      min: 0,
      max: 10,
    },

    mood: [
      {
        type: String,
        enum: [
          "happy",
          "sad",
          "irritated",
          "anxious",
          "low_energy",
          "normal",
        ],
      },
    ],

    symptoms: [
      {
        type: String,
        trim: true,
      },
    ],

    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PeriodLog", PeriodLogSchema);
