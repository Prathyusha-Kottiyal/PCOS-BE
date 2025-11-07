const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dx92um5oh",
  api_key: "937578384175827",
  api_secret: "C_564LQAHh7XlKHmaz5JFKvACnY",
});

// Setup storage for multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "progress_photos",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

module.exports = { cloudinary, storage };
