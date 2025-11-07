const mongoose = require("mongoose");

const mongoDBURL =
  "mongodb+srv://prathyusha2502_db_user:Pathu2502@cluster0.oar8u8z.mongodb.net/pcoscare?appName=Cluster0";


const connectDb = async () => {
  await mongoose.connect(mongoDBURL);
  console.log("Database connected successfully");
};

module.exports = connectDb;   