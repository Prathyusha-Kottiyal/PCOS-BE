const mongoose = require("mongoose");

const yogaSchema = new mongoose.Schema(
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
      required: true,
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
        },
        message: (props) => `${props.value} is not a valid image URL`,
      },
    },
    duration: {
      type: String,
      required: true,
    },
    youtubeId: {
      type: String,
      required: true,
    },
    instructions: {
      type: [String],
    },
    notes: {
      type: String,
    },
    isPeriodFriendly: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Yoga", yogaSchema);
