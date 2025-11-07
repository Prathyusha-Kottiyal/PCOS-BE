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
  const allowedFields = ["day", "meals", "workoutIds", "qoute", "quote"];
  const hasOnlyAllowed = Object.keys(req.body).every((f) =>
    allowedFields.includes(f)
  );
  if (!hasOnlyAllowed) {
    throw new Error("Unexpected fields in daily plan payload");
  }

  const { day, meals, workoutIds, qoute, quote } = req.body;

  // Day
  if (day === undefined || day === null) {
    throw new Error("Day is required");
  }
  if (typeof day !== "number" || !Number.isInteger(day) || day < 1) {
    throw new Error("Day must be an integer greater than or equal to 1");
  }

  // Meals
  if (!meals || typeof meals !== "object" || Array.isArray(meals)) {
    throw new Error(
      "Meals must be an object with breakfast, lunch, and/or dinner arrays"
    );
  }

  const mealTypes = [
    "breakfast",
    "lunch",
    "dinner",
    "emptyStomach",
    "midMorning",
    "evening",
    " beforeBed",
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
          if (!Array.isArray(meal.recipes) || meal.recipes.length === 0) {
            throw new Error(
              `Meal "${meal.title}" in ${m} must have at least one recipe`
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

        // Validate alternateRecipes (optional)
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

        // Validate notes (optional)
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

  // workoutIds
  if (workoutIds !== undefined) {
    if (!Array.isArray(workoutIds)) {
      throw new Error("workoutIds must be an array of strings");
    }
    if (
      !workoutIds.every((id) => typeof id === "string" && id.trim().length > 0)
    ) {
      throw new Error("Each workoutId must be a non-empty string");
    }
  }

  // Quote (accept either 'qoute' or 'quote')
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
  const allowedUpdates = [
    "name",
    "emailId",
    "dob",
    "photoUrl",
    "height",
    "weight",
  ];
  const isAllowedEdit = Object.keys(req.body).every((field) =>
    allowedUpdates.includes(field)
  );
  return isAllowedEdit;
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
  const { title, description, image, duration, type, tags, youtubeId } =
    req.body;

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

  // Type
  const validTypes = ["Yoga", "Meditation", "Workout"];
  if (!type || !validTypes.includes(type)) {
    throw new Error(
      `Type is required and must be one of: ${validTypes.join(", ")}`
    );
  }

  // Tags
  if (!tags || !Array.isArray(tags) || tags.length === 0) {
    throw new Error("At least one tag is required");
  }
  tags.forEach((tag) => {
    if (typeof tag !== "string" || tag.trim() === "") {
      throw new Error("Each tag must be a non-empty string");
    }
  });

  // YouTube ID
  if (!youtubeId || typeof youtubeId !== "string" || youtubeId.trim() === "") {
    throw new Error("Valid YouTube ID is required");
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
