const mongoose = require("mongoose");

const PeriodProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    avgCycleLength: Number,
    avgPeriodLength: Number,

    lastPeriodStart: Date,
    nextPredictedPeriod: Date,

    hasPCOS: {
      type: Boolean,
      default: false,
    },

    trackingEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PeriodProfile", PeriodProfileSchema);
