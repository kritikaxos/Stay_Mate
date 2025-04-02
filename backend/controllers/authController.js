const User = require("../models/userModel.js");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync.js");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const signToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    phone: req.body.phone,
    age: req.body.age,
    gender: req.body.gender,
    occupation: req.body.occupation,
    dietaryPreference: req.body.dietaryPreference,
    location: req.body.location,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    lookingForRoommate: req.body.lookingForRoommate,
    photo: req.body.photo,
  });
  const userWithoutPassword = await User.findById(newUser._id).select(
    "-password"
  );
  const token = signToken(newUser._id);

  res.status(201).json({
    status: "Signed Up succesfully",
    token,
    data: {
      user: userWithoutPassword,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  user.password = undefined;
  const token = signToken(user._id);
  res
    .cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV==='production',
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    .status(200)
    .json({
      status: "Login Successful!",
      token,
      user,
    });
});

exports.logout = (req, res) => {
  res.cookie("jwt", "", { 
    expires: new Date(0),
    secure: true,  
    sameSite: "None",
    httpOnly: true 
  });
  res.status(200).json({ message: "Logged out successfully" });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage,limits: { fileSize: 50 * 1024 * 1024 } });

exports.update = catchAsync(async (req, res, next) => {
  const allowedFields = [
    "name",
    "age",
    "gender",
    "location",
    "phone",
    "dietaryPreference",
    "occupation",
    "lookingForRoommate",
    "longitude",
    "latitude",
  ];

  if (!req.user) {
    return next(
      new AppError("You must be logged in to update your profile", 401)
    );
  }

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (req.body.photo === "https://avatar.iran.liara.run/public/41") {
    updates.photo = "https://avatar.iran.liara.run/public/41";
  } else if (req.file) {
    updates.photo = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;
  }

  if (req.body.email && req.body.email !== req.user.email) {
    return next(new AppError("Email updates are not allowed", 403));
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!updatedUser) {
    return next(new AppError("User not found", 404));
  }

  // console.log("User updated:", updatedUser);

  res.status(200).json({
    status: "Profile Updated Successfully!",
    user: updatedUser,
  });
});

exports.uploadPhoto = upload.single("photo");

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email must be provided", 400));
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User does not exist", 404));
  }

  const resetToken = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? here is your token valid for only 10 minutes: ${resetToken}.\n Please ignore this email if you didn't forget your password.`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Message sent to email",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending email> Try again later", 500)
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

    // console.log("Received Token:", req.params.token);
    // console.log("Hashed Token:", hashedToken);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // console.log("User Found:", user);
  if(!user){
    return next(new AppError("Invalid token or expired", 400));
  }


  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const token = signToken(user._id);
  res
    .cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV==='production',
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    .status(200)
    .json({
      status: "Update Successful!",
      token,
    });
});
