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
    type: {
      type: String,
      required: true,
      enum: ["Yoga", "Meditation", "Workout"],
    },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: () => `At least one tag is required`,
      },
    },
    youtubeId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Yoga", yogaSchema);
