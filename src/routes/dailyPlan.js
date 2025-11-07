const express = require("express");
const router = express.Router();
const DailyPlan = require("../models/dailyPlan");
const { validateDailyPlanData } = require("../utils/validation");

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    if (limit > 50) limit = 50;
    const skip = (page - 1) * limit;

    // Fetch daily plans and populate all recipe fields
    const dailyPlans = await DailyPlan.find({})
      .skip(skip)
      .limit(limit)
      .populate("meals.breakfast.recipes", "title image")
      .populate("meals.breakfast.alternateRecipes","title image")
      .populate("meals.lunch.recipes","title image")
      .populate("meals.lunch.alternateRecipes","title image")
      .populate("meals.dinner.recipes","title image")
      .populate("meals.dinner.alternateRecipes","title image")
      .exec();

    res.json({ message: "Data fetched successfully", data: dailyPlans });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});


router.post("/", async (req, res) => {
  try {
    validateDailyPlanData(req);
    const { day, meals, workoutIds, quote } =
      req.body;

    const dailyPlanObject = {
     day, meals, workoutIds, quote
    };

    const dailyPlan = new DailyPlan(dailyPlanObject);
    console.log(dailyPlan,'dailyPlan')
    await dailyPlan.save();
    res.send(dailyPlan);
  } catch (err) {
    res.status(400).send("Error creating recipe" + err.message);
  }
});

module.exports = router;
