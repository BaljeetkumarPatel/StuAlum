const express = require("express");
const router = express.Router();
const Contact = require("../models/contact");

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newMessage = new Contact({ name, email, message });
    await newMessage.save();
    res.status(201).json({ success: true, msg: "Message saved successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
});


// Fetch all contact messages (for admin)
router.get("/", async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
});


module.exports = router;
