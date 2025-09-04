import { Webhook } from "svix";
import User from "../models/User.js";
import fetch from "node-fetch"; // make sure you have node-fetch installed

export const clerkWebhooks = async (req, res) => {
  try {
    const payloadString = req.body.toString(); // raw body as string
    const headers = req.headers;

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const evt = wh.verify(payloadString, headers);

    const { id, ...attributes } = evt.data;
    const eventType = evt.type;

    let email =
      attributes.email_addresses?.[0]?.email_address ||
      attributes.primary_email_address_id ||
      null;

    // 🔄 If no email in webhook payload → fetch from Clerk API
    if (!email) {
      try {
        const resp = await fetch(`https://api.clerk.com/v1/users/${id}`, {
          headers: {
            Authorization: `Bearer ${process.env.CLERK_API_KEY}`,
          },
        });

        if (resp.ok) {
          const clerkUser = await resp.json();
          email = clerkUser.email_addresses?.[0]?.email_address || null;
        }
      } catch (fetchErr) {
        console.error("⚠️ Failed to fetch user from Clerk API:", fetchErr.message);
      }
    }

    if (eventType === "user.created") {
      const user = new User({
        _id: id,
        email,
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
          email,
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
