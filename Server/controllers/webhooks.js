import { Webhook } from "svix";
import User from "../models/User.js";

export const clerkWebhooks = async (req, res) => {
  try {
    const payloadString = req.body.toString(); // raw string
    const headers = req.headers;

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const evt = wh.verify(payloadString, headers);

    console.log("🔔 Incoming Clerk webhook...");
    console.log("Headers:", headers);

    const { data, type } = evt;

    console.log("✅ Verified event:", type);
    console.log("📦 Event data:", data);

    // Handle user.created
   if (type === "user.created") {
  const email = data.email_addresses?.[0]?.email_address;
  if (!email) {
    console.warn("⚠️ No email provided for user:", data.id);
    return res.status(200).json({ success: true, message: "No email, skipped" });
  }

  const newUser = new User({
    _id: data.id,
    email,
    name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
    imageUrl: data.image_url,
  });
  await newUser.save();
  console.log("🆕 User created in DB:", newUser);
}

    // Handle user.updated
    if (type === "user.updated") {
      const updatedUser = await User.findByIdAndUpdate(
        data.id,
        {
          email: data.email_addresses?.[0]?.email_address || "",
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          imageUrl: data.image_url,
        },
        { new: true }
      );
      console.log("🔄 User updated in DB:", updatedUser);
    }

    // Handle user.deleted
    if (type === "user.deleted") {
      await User.findByIdAndDelete(data.id);
      console.log("🗑️ User deleted:", data.id);
    }

    res.status(200).json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.error("❌ Clerk webhook error:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};
