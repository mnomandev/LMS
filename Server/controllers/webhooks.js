import { Webhook } from "svix";
import User from "../models/User.js";

export const clerkWebhooks = async (req, res) => {
  try {
    // raw body string
    const payload = req.body.toString("utf8");

    // Clerk headers
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const evt = whook.verify(payload, headers); // ✅ verify signature

    console.log("✅ Verified Clerk event:", evt.type);

    const { data, type } = evt;

    switch (type) {
      case "user.created": {
        await User.create({
          _id: data.id,
          email: data.email_addresses?.[0]?.email_address || "",
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          imageUrl: data.image_url,
        });
        break;
      }
      case "user.updated": {
        await User.findByIdAndUpdate(
          data.id,
          {
            email: data.email_addresses?.[0]?.email_address || "",
            name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
            imageUrl: data.image_url,
          },
          { new: true }
        );
        break;
      }
      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        break;
      }
      default:
        console.log("ℹ️ Unhandled Clerk event:", type);
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Clerk webhook error:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};
