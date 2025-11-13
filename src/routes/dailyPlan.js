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

    // Get total number of daily plans
    const totalCount = await DailyPlan.countDocuments({});

    // Fetch paginated & sorted data
    const dailyPlans = await DailyPlan.find({})
      .sort({ day: 1 }) // ascending order by 'day'
      .skip(skip)
      .limit(limit)
      .populate("meals.breakfast.recipes", "title image")
      .populate("meals.breakfast.alternateRecipes", "title image")
      .populate("meals.lunch.recipes", "title image")
      .populate("meals.lunch.alternateRecipes", "title image")
      .populate("meals.dinner.recipes", "title image")
      .populate("meals.dinner.alternateRecipes", "title image")
      .populate("meals.midMorning.recipes", "title image")
      .populate("meals.midMorning.alternateRecipes", "title image")
      .populate("meals.emptyStomach.recipes", "title image")
      .populate("meals.emptyStomach.alternateRecipes", "title image")
      .populate("meals.evening.recipes", "title image")
      .populate("meals.evening.alternateRecipes", "title image")
      .populate("meals.beforeBed.recipes", "title image")
      .populate("meals.beforeBed.alternateRecipes", "title image")
      .populate("workouts.subVideos.workoutId", "title level duration videoUrl isPeriodFriendly")
      .populate("workouts.followAlongFullVideo", "title duration videoUrl image isPeriodFriendly")
      .exec();

    res.json({
      message: "Data fetched successfully",
      data: dailyPlans,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err) {
    res.status(400).json({ message: "Error: " + err.message });
  }
});


// router.get("/", async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     let limit = parseInt(req.query.limit) || 10;
//     if (limit > 50) limit = 50;
//     const skip = (page - 1) * limit;

//     // Fetch daily plans and populate all recipe fields
//     const dailyPlans = await DailyPlan.find({})
//       .skip(skip)
//       .limit(limit)
//       .populate("meals.breakfast.recipes", "title image")
//       .populate("meals.breakfast.alternateRecipes", "title image")
//       .populate("meals.lunch.recipes", "title image")
//       .populate("meals.lunch.alternateRecipes", "title image")
//       .populate("meals.dinner.recipes", "title image")
//       .populate("meals.midMorning.recipes", "title image")
//       .populate("meals.midMorning.alternateRecipes", "title image")
//       .populate("meals.emptyStomach.recipes", "title image")
//       .populate("meals.emptyStomach.alternateRecipes", "title image")
//       .populate("meals.dinner.alternateRecipes", "title image")
//       .populate("workouts.subVideos.workoutId", "title level duration videoUrl isPeriodFriendly")
//       .populate("workouts.followAlongFullVideo", "title duration videoUrl image isPeriodFriendly")
//       .exec();

//     res.json({ message: "Data fetched successfully", data: dailyPlans });
//   } catch (err) {
//     res.status(400).send("Error: " + err.message);
//   }
// });

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
      .populate("meals.midMorning.recipes", "title image")
      .populate("meals.dinner.alternateRecipes", "title image")
      .populate("meals.beforeBed.recipes", "title image")
      .populate("meals.beforeBed.alternateRecipes", "title image")
      .populate("meals.emptyStomach.recipes", "title image")
      .populate("meals.emptyStomach.alternateRecipes", "title image")
      .populate("workouts.subVideos.workoutId", "title duration videoUrl image isPeriodFriendly")
      .populate("workouts.followAlongFullVideo", "title duration videoUrl image isPeriodFriendly")
      .exec();

    if (!dailyPlan) {
      return res.status(404).json({ message: "Daily plan not found for this day" });
    }

    res.json({ message: "Daily plan fetched successfully", data: dailyPlan });
  } catch (err) {
    res.status(400).json({ message: "Error fetching daily plan", error: err.message });
  }
});

router.put("/:day", async (req, res) => {
  try {
    const { day } = req.params; // get day from URL
    validateDailyPlanData(req);

    const { meals, workouts, quote } = req.body;

    if (!day) return res.status(400).json({ message: "Day parameter is required" });

    // Find plan by day and update
    const updatedPlan = await DailyPlan.findOneAndUpdate(
      { day: parseInt(day) },  // filter by day (as number)
      { meals, workouts, quote }, // update fields
      { new: true, runValidators: true }
    );

    if (!updatedPlan)
      return res.status(404).json({ message: `Daily plan for day ${day} not found` });

    res.json({ message: "Daily plan updated successfully", data: updatedPlan });
  } catch (err) {
    res.status(400).json({ message: "Error updating daily plan: " + err.message });
  }
});

// Delete daily plan by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPlan = await DailyPlan.findByIdAndDelete(id);
    if (!deletedPlan) return res.status(404).json({ message: "Daily plan not found" });
    res.json({ message: "Daily plan deleted successfully", data: deletedPlan });
  } catch (err) {
    res.status(400).json({ message: "Error deleting daily plan: " + err.message });
  }
});
module.exports = router;
