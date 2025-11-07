const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      validate: {
        validator: function (value) {
          return !value || /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(value);
        },
        message: "Invalid image URL format",
      },
    },
    video: {
      type: String,
      validate: {
        validator: function (value) {
          return !value || /^https?:\/\/.+/.test(value);
        },
        message: "Invalid video URL format",
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    prepTime: {
      type: String,
      required: true,
      trim: true,
    },
    cookTime: {
      type: String,
      required: true,
      trim: true,
    },
    ingredients: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one ingredient is required",
      },
    },
    steps: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one step is required",
      },
    },
  },
  { timestamps: true }
);

// Optional: Create index on tags for faster filtering
recipeSchema.index({ tags: 1 });

// Export model
module.exports = mongoose.model("Recipe", recipeSchema);
