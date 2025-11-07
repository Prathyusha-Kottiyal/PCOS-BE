// ...existing code...
const mongoose = require("mongoose");

const mealArrayValidator = (arr) =>
  Array.isArray(arr) && arr.every((s) => typeof s === "string" && s.trim().length > 0);

const mealsSchema = new mongoose.Schema(
  {
    breakfast: {
      type: [String],
      default: [],
      validate: {
        validator: mealArrayValidator,
        message: "Breakfast must be an array of non-empty strings",
      },
    },
    lunch: {
      type: [String],
      default: [],
      validate: {
        validator: mealArrayValidator,
        message: "Lunch must be an array of non-empty strings",
      },
    },
    dinner: {
      type: [String],
      default: [],
      validate: {
        validator: mealArrayValidator,
        message: "Dinner must be an array of non-empty strings",
      },
    },
  },
  { _id: false }
);

const dailyPlanSchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: true,
      min: 1,
      index: { unique: true },
    },
    meals: {
      type: mealsSchema,
      required: true,
      default: () => ({}),
    },
    workoutIds: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.every((s) => typeof s === "string" && s.trim().length > 0),
        message: "workoutIds must be an array of non-empty strings",
      },
    },
    quote: {
      type: String,
      trim: true,
      alias: "qoute", // accept 'qoute' input while storing as 'quote'
    },
  },
  { timestamps: true }
);

dailyPlanSchema.index({ day: 1 }, { unique: true });

module.exports = mongoose.model("DailyPlan", dailyPlanSchema);
