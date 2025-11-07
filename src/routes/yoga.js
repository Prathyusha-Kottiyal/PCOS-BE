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

router.post("/", async (req, res) => {
  try {
    validateYogaData(req);
    const { title, description, image, duration, type, youtubeId, tags } =
      req.body;

    const yogaObject = {
      title,
      description,
      image,
      duration,
      type,
      youtubeId,
      tags,
    };

    const yoga = new Yoga(yogaObject);
    await yoga.save();
    res.send(yoga);
  } catch (err) {
    res.status(400).send("Error creating recipe" + err.message);
  }
});

module.exports = router;
