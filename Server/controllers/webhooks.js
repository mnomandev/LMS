import { Webhook } from "svix";
import User from "../models/User.js";
import "dotenv/config";

// Clerk Webhook Controller
export const clerkWebhooks = async (req, res) => {
  try {
    // Clerk requires the raw body (string) for signature verification
    const payloadString = req.body.toString();
    const svixHeaders = req.headers;

    // Verify payload
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const evt = wh.verify(payloadString, svixHeaders);

    const { id, ...attributes } = evt.data;
    const eventType = evt.type;

    switch (eventType) {
      case "user.created":
         console.log("User created event received:", attributes);
        await User.create({
          _id: id,
          email: attributes.email_addresses?.[0]?.email_address,
          name: `${attributes.first_name || ""} ${attributes.last_name || ""}`.trim(),
          imageUrl: attributes.image_url,
        });
        break;

      case "user.updated":
        await User.findByIdAndUpdate(
          id,
          {
            email: attributes.email_addresses?.[0]?.email_address,
            name: `${attributes.first_name || ""} ${attributes.last_name || ""}`.trim(),
            imageUrl: attributes.image_url,
          },
          { new: true }
        );
        break;

      case "user.deleted":
        await User.findByIdAndDelete(id);
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    res.status(200).json({
      success: true,
      message: `Webhook processed: ${eventType}`,
    });
  } catch (error) {
    console.error("❌ Clerk webhook error:", error.message);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
