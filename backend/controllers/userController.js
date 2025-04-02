const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();
   

  if (users.length === 0) {
    console.log("⚠️ No users found in the database.");
  }

  res.status(200).json({
    message: "All users retrieved successfully",
    data: {
      length: users.length,
      users,
    }, 
  });
});
exports.getUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};
exports.createUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json({
      status: "success",
      message: "User created successfully!",
      data: newUser,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Failed to create user",
      error: error.message,
    });
  }
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};


exports.search = async (req, res) => {
  try {
    // console.log("Search Route Called")
    // console.log("Received query params:", req.query);
    let {
      latitude,
      longitude,
      distanceRange,
      gender,
      ageRange,
      dietaryPreference,
      searchQuery,
      userId, 
    } = req.query;

    if (!latitude || !longitude || !distanceRange) {
      return res.status(400).json({ message: "Missing location data" });
    }

    latitude = parseFloat(latitude);
    longitude = parseFloat(longitude);
    distanceRange = parseFloat(distanceRange);

    let query = {
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null },
    };

    if (gender) query.gender = gender;
    if (ageRange) query.age = { $gte: parseInt(ageRange) };
    if (dietaryPreference) query.dietaryPreference = dietaryPreference;
    if (searchQuery) query.name = { $regex: searchQuery, $options: "i" };

    const users = await User.find(query);

    const filteredUsers = users.filter((user) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        user.latitude,
        user.longitude
      );
      return distance <= distanceRange && user._id.toString() !== userId;
    });

    // console.log("Filtered Users:", filteredUsers.length);
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in search API:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Haversine formula to calculate distance (in km)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function toRadians(deg) {
  return deg * (Math.PI / 180);
}