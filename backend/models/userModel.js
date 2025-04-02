const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User must have a name"],
    },
    email: {
      type: String,
      required: [true, "User must have an email"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "User must have a password"],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "User must confirm password"],
      validate: {
        validator: function (val) {
          //only works on create and save
          return this.password === val;
        },
        message: "Passwords do not match",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    phone: {
      type: String,
      required: [true, "User must provide a phone number"],
      unique: true,
    },
    age: {
      type: Number,
      required: [true, "User must provide their age"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    occupation: {
      type: String,
      required: false,
    },
    dietaryPreference: {
      type: String,
      enum: ["vegetarian", "non-vegetarian", "vegan", "other"],
      default: "other",
    },
    location: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    lookingForRoommate: {
      type: Boolean,
      default: false,
    },
    photo: {
      type: String,
      default: "default.jpg",
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

userSchema.virtual("geoLocation").get(function () {
  return {
    type: "Point",
    coordinates: [this.longitude, this.latitude], 
  };
});

//encrypting the password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createPasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
