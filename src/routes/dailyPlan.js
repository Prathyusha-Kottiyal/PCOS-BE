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
      .populate("meals.breakfast.alternateRecipes", "title image")
      .populate("meals.lunch.recipes", "title image")
      .populate("meals.lunch.alternateRecipes", "title image")
      .populate("meals.dinner.recipes", "title image")
      .populate("meals.dinner.alternateRecipes", "title image")
      .populate("workouts.subVideos.workoutId", "title level duration videoUrl")
      .populate("workouts.followAlongFullVideo", "title duration videoUrl image")
      .exec();

    res.json({ message: "Data fetched successfully", data: dailyPlans });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

router.post("/", async (req, res) => {
  try {
    validateDailyPlanData(req);
    const { day, meals, workouts, quote } = req.body;

    const dailyPlanObject = {
      day,
      meals,
      workouts,
      quote,
    };

    const dailyPlan = new DailyPlan(dailyPlanObject);
    console.log(dailyPlan, "dailyPlan");
    await dailyPlan.save();
    res.send(dailyPlan);
  } catch (err) {
    res.status(400).send("Error creating recipe" + err.message);
  }
});

router.get("/:day", async (req, res) => {
  try {
    const day = parseInt(req.params.day);

    if (isNaN(day) || day < 1) {
      return res.status(400).json({ message: "Invalid day parameter" });
    }

    const dailyPlan = await DailyPlan.findOne({ day })
      .populate("meals.breakfast.recipes", "title image")
      .populate("meals.breakfast.alternateRecipes", "title image")
      .populate("meals.lunch.recipes", "title image")
      .populate("meals.lunch.alternateRecipes", "title image")
      .populate("meals.dinner.recipes", "title image")
      .populate("meals.dinner.alternateRecipes", "title image")
      .populate("workouts.subVideos.workoutId", "title duration videoUrl image")
      .populate("workouts.followAlongFullVideo", "title duration videoUrl image")
      .exec();

    if (!dailyPlan) {
      return res.status(404).json({ message: "Daily plan not found for this day" });
    }

    res.json({ message: "Daily plan fetched successfully", data: dailyPlan });
  } catch (err) {
    res.status(400).json({ message: "Error fetching daily plan", error: err.message });
  }
});


module.exports = router;
