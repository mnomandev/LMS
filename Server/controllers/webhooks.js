import { Webhook } from "svix";
import User from "../models/User.js";

export const clerkWebhooks = async (req, res) => {
  try {
    // ✅ Get raw Buffer as string
    const payloadString = req.body.toString("utf8");

    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // ✅ Verify signature against raw body string
    const evt = whook.verify(payloadString, headers);

    console.log("✅ Clerk event verified:", evt.type);

    const { data, type } = evt;

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses?.[0]?.email_address || "no-email",
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          imageUrl: data.image_url,
        };
        await User.create(userData);
        console.log("👤 User created in DB:", userData);
        break;
      }
      case "user.updated": {
        const userData = {
          email: data.email_addresses?.[0]?.email_address || "no-email",
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          imageUrl: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userData, { new: true });
        console.log("👤 User updated in DB:", userData);
        break;
      }
      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        console.log("❌ User deleted in DB:", data.id);
        break;
      }
      default:
        console.log("ℹ️ Unhandled Clerk event:", type);
        break;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Clerk webhook error:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};
