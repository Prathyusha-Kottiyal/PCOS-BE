const mongoose = require("mongoose");

const PeriodCycleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // First day of bleeding
    periodStart: {
      type: Date,
      required: true,
    },

    // Last day of bleeding
    periodEnd: {
      type: Date,
    },

    // Calculated fields
    cycleLength: {
      type: Number,
      min: 10,
      max: 90,
      default: null,
    },

    periodLength: {
      type: Number,
      min: 1,
      max: 15,
    },

    isPredicted: {
      type: Boolean,
      default: false,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PeriodCycle", PeriodCycleSchema);
