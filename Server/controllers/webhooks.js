import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js"; // adjust path
import { Webhook } from "svix";

const router = express.Router();

router.post("/clerk", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const payload = req.body;
    const headers = req.headers;

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    let evt;
    try {
      evt = wh.verify(payload, headers);
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const { id, type, data } = evt;

    console.log("✅ Clerk Webhook Received:", type, id);

    if (type === "user.created") {
      const email = data.email_addresses?.[0]?.email_address || null;
      const name = `${data.first_name || ""} ${data.last_name || ""}`.trim();
      const imageUrl = data.image_url;

      await User.findOneAndUpdate(
        { _id: data.id },
        {
          email,
          name,
          imageUrl,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      console.log("🎉 User saved to DB:", data.id);
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Webhook handler error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
