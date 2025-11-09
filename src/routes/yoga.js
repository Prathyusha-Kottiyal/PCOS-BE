const express = require("express");
const router = express.Router();
const Yoga = require("../models/yoga");
const { validateYogaData } = require("../utils/validation");

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    if (limit > 50) {
      limit = 50;
    }
    const skip = (page - 1) * limit;
    const yoga = await Yoga.find({}).skip(skip).limit(limit);
    res.json({ message: "data fetched successfully", data: yoga });
  } catch (err) {
    res.status(400).send("Error :" + err.message);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid workout ID" });
    }

    const workout = await Yoga.findById(id);

    if (!workout) {
      return res.status(404).json({ message: "workout not found" });
    }

    res.json({ message: "workout fetched successfully", data: workout });
  } catch (err) {
    res.status(400).json({ message: "Error fetching workout: " + err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    validateYogaData(req);
    const { title, description, image, duration, youtubeId, instructions,
      notes } =
      req.body;

    const yogaObject = {
      title,
      description,
      image,
      duration,
      youtubeId,
      instructions,
      notes
    };

    const yoga = new Yoga(yogaObject);
    await yoga.save();
    res.send(yoga);
  } catch (err) {
    res.status(400).send("Error creating recipe" + err.message);
  }
});

module.exports = router;
