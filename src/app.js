const express = require("express");
const connectDb = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const PORT = process.env.PORT || 3000;

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const recipesRouter = require("./routes/recipes");
const yogaRouter = require("./routes/yoga");
const dailyPlanRouter = require('./routes/dailyPlan');
const progressRouter = require('./routes/progress');

const app = express();
app.use(cors({
  // origin: "http://localhost:3001",
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/profile", profileRouter);
app.use("/recipes", recipesRouter);
app.use("/yoga", yogaRouter);
app.use("/dailyPlan", dailyPlanRouter);
app.use('/progress',progressRouter)

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log("server successfully listning");
    });
  })
  .catch((err) => {
    console.error("Error while connecting to database", err);
  });
