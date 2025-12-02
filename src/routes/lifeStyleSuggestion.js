const express = require("express");
const router = express.Router();
const LifestyleSuggestion = require("../models/lifestyleSuggestion");

// GET all suggestions (with pagination)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 50;

    if (limit > 50) limit = 50;

    const skip = (page - 1) * limit;

    const totalCount = await LifestyleSuggestion.countDocuments({});

    const data = await LifestyleSuggestion.find({})
      .skip(skip)
      .limit(limit);

    res.json({
      message: "Lifestyle suggestions fetched successfully",
      data,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err) {
    res.status(400).json({ message: "Error: " + err.message });
  }
});

// GET a single suggestion by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid suggestion ID" });
    }

    const suggestion = await LifestyleSuggestion.findById(id);

    if (!suggestion) {
      return res.status(404).json({ message: "Suggestion not found" });
    }

    res.json({ message: "Suggestion fetched successfully", data: suggestion });
  } catch (err) {
    res.status(400).json({ message: "Error fetching suggestion: " + err.message });
  }
});

// CREATE new lifestyle suggestion
router.post("/", async (req, res) => {
  try {
    const { title, description, image, repeat, recommendedTime } = req.body;

    const obj = {
      title,
      description,
      image,
      repeat,
      recommendedTime,
    };

    const suggestion = new LifestyleSuggestion(obj);
    await suggestion.save();

    res.json({ message: "Lifestyle suggestion created successfully", data: suggestion });
  } catch (err) {
    res.status(400).json({ message: "Error creating suggestion: " + err.message });
  }
});

// UPDATE a lifestyle suggestion
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid suggestion ID" });
    }

    const { title, description, image, repeat, recommendedTime } = req.body;

    const updated = await LifestyleSuggestion.findByIdAndUpdate(
      id,
      { title, description, image, repeat, recommendedTime },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Suggestion not found" });
    }

    res.json({ message: "Lifestyle suggestion updated successfully", data: updated });
  } catch (err) {
    res.status(400).json({ message: "Error updating suggestion: " + err.message });
  }
});

// DELETE a suggestion
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid suggestion ID" });
    }

    const deleted = await LifestyleSuggestion.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Suggestion not found" });
    }

    res.json({ message: "Lifestyle suggestion deleted successfully", data: deleted });
  } catch (err) {
    res.status(400).json({ message: "Error deleting suggestion: " + err.message });
  }
});

module.exports = router;
