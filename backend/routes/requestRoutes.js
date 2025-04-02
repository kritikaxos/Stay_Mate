const express = require("express");
const router = express.Router();
const Request = require("../models/requestModel");
const { protect } = require("../middlewares/authMiddleware"); 

router.post("/send", protect, async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id; 

    if (senderId === receiverId) {
      return res
        .status(400)
        .json({ message: "You cannot send a request to yourself." });
    }

    const existingRequest = await Request.findOne({
      sender: senderId,
      receiver: receiverId,
    });

    if (existingRequest) {
      return res.status(200).json({ message: "Request already sent." });
    }

    const request = new Request({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });
    await request.save();

    res.status(201).json({ message: "Request sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/notifications", protect, async (req, res) => {
  try {
    // console.log("\n🔹 Incoming request to /requests/notifications");
    // console.log("🔹 Cookies received:", req.cookies);
    // console.log("🔹 Headers received:", req.headers);
    // console.log("🔹 Authenticated user ID:", req.user?.id);

    if (!req.user?.id) {
      return res
        .status(401)
        .json({ message: "Unauthorized. No user ID found." });
    }

    const requests = await Request.find({
      receiver: req.user.id,
      status: "pending",
    }).populate("sender", "name photo");

    console.log("🔹 Requests found:", requests);

    res.json(requests);
  } catch (error) {
    console.error("🔴 Server Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/update", protect, async (req, res) => {
  try {
    const { requestId, status } = req.body;
    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found." });
    }
    if (status !== "pending") {
      await Request.findByIdAndDelete(requestId);
      return res.json({ message: "Request deleted successfully" });
    }
    request.status = status;
    await request.save();

    res.json({ message: `Request ${status}.` });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
