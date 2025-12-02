const mongoose = require("mongoose");

const lifestyleSuggestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 80,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      validate: {
        validator: function (v) {
          if (!v) return true; // optional
          return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
        },
        message: (props) => `${props.value} is not a valid image URL`,
      },
    },
    repeat: {
      type: String,
      enum: [
        "daily",
        "weekly",
        "twice_week",
        "thrice_week",
        "twice_day",
        "thrice_day",
        "morning",
        "evening",
        "night",
        "after_meal",
        "before_meal",
        "custom",
      ],
      default: "daily",
    },

    recommendedTime: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "LifestyleSuggestion",
  lifestyleSuggestionSchema
);
