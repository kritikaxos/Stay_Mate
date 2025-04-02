
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AppError = require("../utils/appError");

exports.protect = async (req, res, next) => {
  const token = req.cookies?.jwt; 
// console.log("Headers received:", req.headers);

  if (!token) {
    return next(new AppError("Not authorized, no token", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return next(new AppError("User not found", 401));
    }

    next();
  } catch (error) {
    return next(new AppError("Not authorized, invalid token", 401));
  }
};
