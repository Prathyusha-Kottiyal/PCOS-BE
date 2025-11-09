const mongoose = require("mongoose");

// Sub-schema for workout segments / sub-videos
const workoutSubVideoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    workoutId: { type: mongoose.Schema.Types.ObjectId, ref: "Yoga" }, // reference to Yoga model
    duration: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

// Main workout schema for each section
const workoutSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    followAlongFullVideo: { type: mongoose.Schema.Types.ObjectId, ref: "Yoga" }, // optional full workout ref
    subVideos: { type: [workoutSubVideoSchema], default: [] },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

// Meal structure
const mealItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
    alternateRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
    notes: { type: String, default: "" },
  },
  { _id: false }
);

// Daily meals group
const mealsSchema = new mongoose.Schema(
  {
    emptyStomach: { type: [mealItemSchema], default: [] },
    breakfast: { type: [mealItemSchema], default: [] },
    midMorning: { type: [mealItemSchema], default: [] },
    lunch: { type: [mealItemSchema], default: [] },
    evening: { type: [mealItemSchema], default: [] },
    dinner: { type: [mealItemSchema], default: [] },
    beforeBed: { type: [mealItemSchema], default: [] },
  },
  { _id: false }
);

// Main Daily Plan Schema
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
      default: () => ({
        breakfast: [],
        lunch: [],
        dinner: [],
      }),
    },
    workouts: {
      type: [workoutSchema],
      default: [],
    },
    quote: {
      type: String,
      trim: true,
      alias: "qoute",
    },
  },
  { timestamps: true }
);

dailyPlanSchema.index({ day: 1 }, { unique: true });

module.exports = mongoose.model("DailyPlan", dailyPlanSchema);
