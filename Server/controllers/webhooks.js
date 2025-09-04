import { Webhook } from "svix";
import User from "../models/User.js";

export const clerkWebhooks = async (req, res) => {
  try {
    const payloadString = req.body.toString(); // raw body as string
    const headers = req.headers;

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const evt = wh.verify(payloadString, headers);

    const { id, ...attributes } = evt.data;
    const eventType = evt.type;

    if (eventType === "user.created") {
      const user = new User({
        _id: id,
        email: attributes.email_addresses?.[0]?.email_address || null,
        name: `${attributes.first_name || ""} ${attributes.last_name || ""}`.trim(),
        imageUrl: attributes.image_url,
      });
      await user.save();
      console.log("✅ User created:", user._id);
    }

    if (eventType === "user.updated") {
      await User.findByIdAndUpdate(
        id,
        {
          email: attributes.email_addresses?.[0]?.email_address || null,
          name: `${attributes.first_name || ""} ${attributes.last_name || ""}`.trim(),
          imageUrl: attributes.image_url,
        },
        { new: true }
      );
      console.log("✏️ User updated:", id);
    }

    if (eventType === "user.deleted") {
      await User.findByIdAndDelete(id);
      console.log("🗑️ User deleted:", id);
    }

    res.status(200).json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.error("❌ Clerk webhook error:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};
