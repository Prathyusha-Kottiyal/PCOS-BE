// ...existing code...
const mongoose = require("mongoose");

const mealArrayValidator = (arr) =>
  Array.isArray(arr) && arr.every((s) => typeof s === "string" && s.trim().length > 0);


const mealItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    recipes: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Recipe", required: true }
    ],
    alternateRecipes: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }
    ],
    notes: { type: String, default: "" }
  },
  { _id: false }
);

const mealsSchema = new mongoose.Schema(
  {
    breakfast: { type: [mealItemSchema], default: [] },
    lunch: { type: [mealItemSchema], default: [] },
    dinner: { type: [mealItemSchema], default: [] }
  },
  { _id: false }
);

const dailyPlanSchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: true,
      min: 1,
      index: { unique: true }
    },
    meals: {
      type: mealsSchema,
      required: true,
      default: () => ({ breakfast: [], lunch: [], dinner: [] })
    },
    workoutIds: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) =>
          Array.isArray(arr) &&
          arr.every((s) => typeof s === "string" && s.trim().length > 0),
        message: "workoutIds must be an array of non-empty strings"
      }
    },
    quote: {
      type: String,
      trim: true,
      alias: "qoute"
    }
  },
  { timestamps: true }
);


dailyPlanSchema.index({ day: 1 }, { unique: true });

module.exports = mongoose.model("DailyPlan", dailyPlanSchema);
