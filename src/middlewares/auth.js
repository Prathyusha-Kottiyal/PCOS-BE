// const User = require("../models/user");
// const jwt = require("jsonwebtoken");

// const userAuth = async (req, res, next) => {
//   try {
//     const cookie = req.cookies;
//     const { token } = cookie;
//     if (!token) {
//       throw new Error("Token not found");
//     }
//     const decodedObj = jwt.verify(token, "DEV567");
//     const { _id } = decodedObj;
//     const user = await User.findById(_id);
//     // Fetch user profile logic here
//     if (!user) {
//       throw new Error("User not found");
//     }
//     req.user = user;
//     next();
//   } catch (err) {
//     return res.status(401).send("Unauthorized"+err.message);
//   }
// };

// module.exports = {
//   userAuth,
// };

const jwt = require("jsonwebtoken");
const User = require("../models/user"); 

const userAuth = async (req, res, next) => {
  try {
    // Expect token in headers (Authorization: Bearer <token>)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Token not found");
    }

    const token = authHeader.split(" ")[1];
    const decodedObj = jwt.verify(token, "DEV567"); // use process.env.JWT_SECRET in production
    const { _id } = decodedObj;

    const user = await User.findById(_id);
    if (!user) throw new Error("User not found");

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).send("Unauthorized: " + err.message);
  }
};

module.exports = {
  userAuth,
};

