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
