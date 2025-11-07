const express = require("express");
const router = express.Router();
const Recipes = require("../models/recipes");
const { validateRecipeData } = require("../utils/validation");

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    if (limit > 50) {
      limit = 50;
    }
    const skip = (page - 1) * limit;
    const recipes = await Recipes.find({}).skip(skip).limit(limit);
    res.json({ message: "data fetched successfully", data: recipes });
  } catch (err) {
    res.status(400).send("Error :" + err.message);
  }
});
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    // Case-insensitive search using regex
    const recipes = await Recipes.find({
      title: { $regex: query, $options: "i" },
    }).limit(50); // optional limit

    res.json({
      message: recipes.length
        ? "Recipes found successfully"
        : "No recipes matched your query",
      data: recipes,
    });
  } catch (err) {
    res.status(400).json({ message: "Error searching recipes: " + err.message });
  }
});
// GET recipe details by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid recipe ID" });
    }

    const recipe = await Recipes.findById(id);

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json({ message: "Recipe fetched successfully", data: recipe });
  } catch (err) {
    res.status(400).json({ message: "Error fetching recipe: " + err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    validateRecipeData(req);
    const {
      title,
      description,
      image,
      video,
      tags,
      prepTime,
      cookTime,
      ingredients,
      steps,
    } = req.body;

    const recipeObject = {
      title,
      description,
      image,
      video,
      tags,
      prepTime,
      cookTime,
      ingredients,
      steps,
    };

    const recipe = new Recipes(recipeObject);
    await recipe.save();
    res.send(recipe);
  } catch (err) {
    res.status(400).send("Error creating recipe" + err.message);
  }
});



module.exports = router;
