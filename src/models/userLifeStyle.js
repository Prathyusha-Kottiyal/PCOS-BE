const mongoose = require("mongoose");

const userLifestyleRoutineSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    lifestyleSuggestionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LifestyleSuggestion",
      required: true,
    },

    // User-selected frequency
    repeat: {
      type: String,
      enum: [
        "daily",
        "weekly",
        "twice_week",
        "thrice_week",
        "twice_day",
        "thrice_day",
        "custom",
      ],
      required: true,
    },

    // User comfort time (KEY requirement)
    preferredTime: {
      type: String,
      enum: [
        "morning",
        "afternoon",
        "evening",
        "night",
        "anytime",
      ],
      required: true,
    },

    // Optional exact time chosen by user (eg: 07:30)
    preferredTimeSlot: {
      type: String,
      trim: true,
    },

    // Approx duration shown in UI
    duration: {
      type: String,
      trim: true,
      maxLength: 30, // eg: "5–10 mins"
    },

    // Enable / disable without deleting
    isActive: {
      type: Boolean,
      default: true,
    },

    // For future use (reminders, streaks, etc.)
    reminderEnabled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent duplicate same habit for same user
userLifestyleRoutineSchema.index(
  { userId: 1, lifestyleSuggestionId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "UserLifestyleRoutine",
  userLifestyleRoutineSchema
);
