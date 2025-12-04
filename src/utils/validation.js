const validator = require("validator");

const validateSignupData = (req) => {
  const { name, emailId, password } = req.body;
  if (!name) {
    throw new Error("Name is required");
  } else if (name.length < 3 || name.length > 50) {
    throw new Error("First name should be between 3 and 50 characters");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Invalid email format");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong enough");
  }
};

const validateDailyPlanData = (req) => {
  const allowedFields = ["day", "meals", "workouts", "qoute", "quote"];
  const hasOnlyAllowed = Object.keys(req.body).every((f) =>
    allowedFields.includes(f)
  );
  if (!hasOnlyAllowed) {
    throw new Error("Unexpected fields in daily plan payload");
  }

  const { day, meals, workouts, qoute, quote } = req.body;

  // ---- Day ----
  if (day === undefined || day === null) {
    throw new Error("Day is required");
  }
  if (typeof day !== "number" || !Number.isInteger(day) || day < 1) {
    throw new Error("Day must be an integer greater than or equal to 1");
  }

  // ---- Meals ----
  if (!meals || typeof meals !== "object" || Array.isArray(meals)) {
    throw new Error(
      "Meals must be an object with breakfast, lunch, and/or dinner arrays"
    );
  }

  const mealTypes = [
    "emptyStomach",
    "breakfast",
    "midMorning",
    "lunch",
    "evening",
    "dinner",
    "beforeBed",
  ];

  mealTypes.forEach((m) => {
    if (meals[m] !== undefined) {
      if (!Array.isArray(meals[m])) {
        throw new Error(`${m} must be an array of meal objects`);
      }

      meals[m].forEach((meal, index) => {
        if (typeof meal !== "object" || meal === null) {
          throw new Error(`Each item in ${m} must be an object`);
        }

        // Validate title
        if (
          !meal.title ||
          typeof meal.title !== "string" ||
          meal.title.trim().length === 0
        ) {
          throw new Error(
            `Meal at index ${index} in ${m} must have a non-empty title`
          );
        }

        // Validate recipes
        if (meal.recipes !== undefined) {
          if (!Array.isArray(meal.recipes)) {
            throw new Error(
              `recipes for meal "${meal.title}" must be an array if provided`
            );
          }
          if (
            !meal.recipes.every(
              (id) => typeof id === "string" && id.trim().length > 0
            )
          ) {
            throw new Error(
              `Each recipe ID in meal "${meal.title}" must be a non-empty string`
            );
          }
        }

        // Validate alternateRecipes
        if (meal.alternateRecipes !== undefined) {
          if (!Array.isArray(meal.alternateRecipes)) {
            throw new Error(
              `alternateRecipes for meal "${meal.title}" must be an array`
            );
          }
          if (
            !meal.alternateRecipes.every(
              (id) => typeof id === "string" && id.trim().length > 0
            )
          ) {
            throw new Error(
              `Each alternateRecipe ID in meal "${meal.title}" must be a non-empty string`
            );
          }
        }

        // Validate notes
        if (meal.notes !== undefined) {
          if (typeof meal.notes !== "string") {
            throw new Error(`notes for meal "${meal.title}" must be a string`);
          }
          if (meal.notes.length > 1000) {
            throw new Error(
              `notes for meal "${meal.title}" is too long (max 1000 characters)`
            );
          }
        }
      });
    }
  });

  // ---- Workouts ----
  if (workouts !== undefined) {
    if (!Array.isArray(workouts)) {
      throw new Error("workouts must be an array of objects");
    }

    workouts.forEach((workout, wIndex) => {
      if (typeof workout !== "object" || workout === null) {
        throw new Error(`Workout at index ${wIndex} must be an object`);
      }

      // Title
      if (
        !workout.title ||
        typeof workout.title !== "string" ||
        workout.title.trim().length === 0
      ) {
        throw new Error(
          `Workout at index ${wIndex} must have a non-empty title`
        );
      }

      // followAlongFullVideo (optional)
      if (
        workout.followAlongFullVideo !== undefined &&
        typeof workout.followAlongFullVideo !== "string"
      ) {
        throw new Error(
          `followAlongFullVideo for workout "${workout.title}" must be a string (Yoga ObjectId)`
        );
      }

      // subVideos
      if (workout.subVideos !== undefined) {
        if (!Array.isArray(workout.subVideos)) {
          throw new Error(
            `subVideos for workout "${workout.title}" must be an array`
          );
        }

        workout.subVideos.forEach((sub, sIndex) => {
          if (typeof sub !== "object" || sub === null) {
            throw new Error(
              `SubVideo at index ${sIndex} in workout "${workout.title}" must be an object`
            );
          }

          if (
            !sub.title ||
            typeof sub.title !== "string" ||
            sub.title.trim().length === 0
          ) {
            throw new Error(
              `Each subVideo in workout "${workout.title}" must have a non-empty title`
            );
          }

          if (
            sub.workoutId !== undefined &&
            typeof sub.workoutId !== "string"
          ) {
            throw new Error(
              `workoutId in subVideo "${sub.title}" must be a string (Yoga ObjectId)`
            );
          }

          if (sub.duration !== undefined && typeof sub.duration !== "string") {
            throw new Error(
              `duration in subVideo "${sub.title}" must be a string`
            );
          }

          if (sub.notes !== undefined && typeof sub.notes !== "string") {
            throw new Error(
              `notes in subVideo "${sub.title}" must be a string`
            );
          }
        });
      }

      // Notes (optional)
      if (workout.notes !== undefined && typeof workout.notes !== "string") {
        throw new Error(
          `notes for workout "${workout.title}" must be a string`
        );
      }
    });
  }

  // ---- Quote ----
  const q = qoute ?? quote;
  if (q !== undefined) {
    if (typeof q !== "string" || q.trim().length === 0) {
      throw new Error("Quote must be a non-empty string when provided");
    }
    if (q.length > 1000) {
      throw new Error("Quote is too long (max 1000 characters)");
    }
  }

  return true;
};
const validateEditProfile = (req) => {
  const allowedStableUpdates = [
    "name",
    "emailId",
    "dob",
    "photoUrl",
    "height",
  ];

  const allowedProgressUpdates = [
    "weight",
    "measurements",
  ];

  const allowedMeasurementFields = [
    "chest",
    "waist",
    "hip",
    "arm",
    "thigh",
    "neck",
  ];

  const bodyFields = Object.keys(req.body);

  // 1️⃣ Validate top-level fields
  const isTopLevelValid = bodyFields.every((field) =>
    allowedStableUpdates.includes(field) ||
    allowedProgressUpdates.includes(field)
  );

  if (!isTopLevelValid) return false;

  // 2️⃣ Validate measurement object keys (values CAN be empty)
  if (req.body.measurements) {
    const measurementFields = Object.keys(req.body.measurements);

    const isMeasurementsValid = measurementFields.every((mField) =>
      allowedMeasurementFields.includes(mField)
    );

    if (!isMeasurementsValid) return false;
  }

  return true;
};


const validateUpdatePassword = (req) => {
  const allowedUpdates = ["newPassword", "existingPassword"];
  const isAllowedEdit = Object.keys(req.body).every((field) =>
    allowedUpdates.includes(field)
  );
  return isAllowedEdit;
};

const validateRecipeData = (req) => {
  const { title, description, image, prepTime, cookTime, ingredients, steps } =
    req.body;

  if (!title || title.trim() === "") {
    throw new Error("Title is required");
  }
  if (!description || description.trim() === "") {
    throw new Error("Description is required");
  }
  if (!prepTime || prepTime.trim() === "") {
    throw new Error("Preparation time is required");
  }
  if (!cookTime || cookTime.trim() === "") {
    throw new Error("Cook time is required");
  }
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    throw new Error("At least one ingredient is required");
  }
  if (!Array.isArray(steps) || steps.length === 0) {
    throw new Error("At least one step is required");
  }
};

const validateYogaData = (req) => {
  const {
    title,
    description,
    image,
    duration,
    youtubeId,
    notes,
    instructions,
    isPeriodFriendly,
  } = req.body;

  // Title
  if (!title || title.trim() === "") {
    throw new Error("Title is required");
  }

  // Description
  if (!description || description.trim() === "") {
    throw new Error("Description is required");
  }

  // Image URL
  if (!image || !/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(image)) {
    throw new Error("Valid image URL is required");
  }

  // Duration
  if (!duration || typeof duration !== "string" || duration.trim() === "") {
    throw new Error(
      "Duration is required and should be a string (e.g., '20 mins')"
    );
  }

  // YouTube ID
  if (!youtubeId || typeof youtubeId !== "string" || youtubeId.trim() === "") {
    throw new Error("Valid YouTube ID is required");
  }

  // Optional Notes
  if (notes && (typeof notes !== "string" || notes.trim() === "")) {
    throw new Error("Notes, if provided, must be a non-empty string");
  }

  // Instructions
  if (instructions) {
    if (!Array.isArray(instructions) || instructions.length === 0) {
      throw new Error(
        "Instructions, if provided, must be a non-empty array of strings"
      );
    }
    instructions.forEach((step) => {
      if (typeof step !== "string" || step.trim() === "") {
        throw new Error("Each instruction must be a non-empty string");
      }
    });
  }

  // Optional isPeriodFriendly
  if (
    isPeriodFriendly !== undefined &&
    typeof isPeriodFriendly !== "boolean"
  ) {
    throw new Error("isPeriodFriendly, if provided, must be a boolean");
  }
};

const validateProgressData = (req) => {
  const allowedFields = ["date", "photoUrl", "weight", "notes"];
  if (!req.body || typeof req.body !== "object") {
    throw new Error("Invalid payload");
  }

  const hasOnlyAllowed = Object.keys(req.body).every((f) =>
    allowedFields.includes(f)
  );
  if (!hasOnlyAllowed) {
    throw new Error("Unexpected fields in progress payload");
  }

  const { date, photoUrl, weight, notes } = req.body;

  // Date (required, valid date string, not in future)
  if (!date) {
    throw new Error("Date is required");
  }
  const parsed = Date.parse(date);
  if (isNaN(parsed)) {
    throw new Error("Invalid date format");
  }
  if (new Date(date) > new Date()) {
    throw new Error("Date cannot be in the future");
  }

  // photoUrl (optional, must be a valid URL)
  if (photoUrl !== undefined) {
    if (typeof photoUrl !== "string" || !validator.isURL(photoUrl)) {
      throw new Error("Invalid photo URL");
    }
  }

  // weight (optional, number between 30 and 200)
  if (weight !== undefined) {
    if (typeof weight !== "number" || Number.isNaN(weight)) {
      throw new Error("Weight must be a number");
    }
    if (weight < 30 || weight > 200) {
      throw new Error("Weight must be between 30 and 200");
    }
  }

  // notes (optional, string, max 200 chars)
  if (notes !== undefined) {
    if (typeof notes !== "string") {
      throw new Error("Notes must be a string");
    }
    if (notes.trim().length > 200) {
      throw new Error("Notes cannot exceed 200 characters");
    }
  }
};

module.exports = {
  validateSignupData,
  validateEditProfile,
  validateUpdatePassword,
  validateRecipeData,
  validateYogaData,
  validateDailyPlanData,
  validateProgressData,
  validateYogaData,
};
