import { Webhook } from "svix";
import User from "../models/User.js";

export const clerkWebhooks = async (req, res) => {
  try {
    const payloadString = req.body.toString(); // raw string
    const headers = req.headers;

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const evt = wh.verify(payloadString, headers);

    const { data, type } = evt;

    // Use upsert to avoid duplicates and ensure save
    if (type === "user.created" || type === "user.updated") {
      await User.findByIdAndUpdate(
        data.id,
        {
          _id: data.id,
          email: data.email_addresses?.[0]?.email_address || "", // ensure email exists
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          imageUrl: data.image_url,
        },
       await User.save()
    )}

    if (type === "user.deleted") {
      await User.findByIdAndDelete(data.id);
    }

    res.status(200).json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.error("❌ Clerk webhook error:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};
