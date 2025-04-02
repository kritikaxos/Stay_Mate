const express = require("express");
const Room = require("../models/roomModel");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });

router.post("/", upload.array("photos", 4), async (req, res) => {
  try {
    const { title, description, location, latitude, longitude, price, owner } =
      req.body;

    if (
      !title ||
      !description ||
      !location ||
      !latitude ||
      !longitude ||
      !price ||
      !owner
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled.",
      });
    }

    const photoPaths = req.files.map((file) => `uploads/${file.filename}`);

    const newRoom = new Room({
      title,
      description,
      location,
      latitude,
      longitude,
      price,
      owner,
      photos: photoPaths,
    });

    await newRoom.save();
    res.status(201).json({ success: true, room: newRoom });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get("/", async (req, res) => {
  let { latitude, longitude, userId, maxDistance, maxPrice } = req.query;

  if (!latitude || !longitude || !userId) {
    return res.status(400).json({
      success: false,
      message: "Latitude, longitude, and userId are required",
    });
  }

  latitude = parseFloat(latitude);
  longitude = parseFloat(longitude);
  maxDistance = parseFloat(maxDistance) || 10;
  maxPrice = parseFloat(maxPrice) || 100000;

  try {
    // Fetch all rooms except those owned by the user
    const allRooms = await Room.find({
      owner: { $ne: userId },
      price: { $lte: maxPrice },
    })
      .populate("owner", "name email phone") // Fetch owner details
      .lean();

    // Calculate distance and filter rooms within maxDistance
    const filteredRooms = allRooms
      .map((room) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          room.latitude,
          room.longitude
        );
        return { ...room, distance };
      })
      .filter((room) => room.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);

    // console.log(`Total rooms found: ${filteredRooms.length}`);

    // Log first room's owner details for debugging
    if (filteredRooms.length > 0) {
      // console.log("First room owner details:", filteredRooms[0].owner);
    }

    res.json({
      success: true,
      rooms: filteredRooms,
    });
  } catch (err) {
    console.error("Error fetching rooms:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


router.get("/my", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const userRooms = await Room.find({ owner: userId })
      .populate("owner", "name email phone") // Populate owner details
      .lean();

    res.json({ success: true, rooms: userRooms });
  } catch (err) {
    console.error("Error fetching user rooms:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate(
      "owner",
      "phone email"
    );
    if (!room) return res.status(404).json({ message: "Room not found" });

    res.json({ success: true, room });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedRoom)
      return res.status(404).json({ message: "Room not found" });

    res.json({ success: true, room: updatedRoom });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);
    if (!deletedRoom)
      return res.status(404).json({ message: "Room not found" });

    res.json({ success: true, message: "Room deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
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
module.exports = router;
