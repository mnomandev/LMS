import { Webhook } from "svix";
import User from "../models/User.js";

export const clerkWebhooks = async (req, res) => {
  try {
    const payload = req.body;
    const headers = req.headers;
    
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    
    // Verify webhook signature
    await whook.verify(payload, {
      "svix-id": headers["svix-id"],
      "svix-timestamp": headers["svix-timestamp"],
      "svix-signature": headers["svix-signature"]
    });
    
    // Parse the webhook payload
    const { data, type } = JSON.parse(payload.toString());
    
    console.log(`Received webhook type: ${type}`);

    switch(type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses?.[0]?.email_address || null,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          imageUrl: data.image_url
        };
        
        await User.create(userData);
        console.log("New user created:", userData);
        return res.json({ success: true, message: "User created" });
      }
      
      case "user.updated": {
        const userData = {
          email: data.email_addresses?.[0]?.email_address,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          imageUrl: data.image_url
        };
        
        await User.findByIdAndUpdate(data.id, userData);
        console.log("User updated:", userData);
        return res.json({ success: true, message: "User updated" });
      }
      
      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        console.log("User deleted:", data.id);
        return res.json({ success: true, message: "User deleted" });
      }
      
      default:
        console.log("Unhandled webhook type:", type);
        return res.json({ success: true, message: "Webhook received but not handled" });
    }
  } catch (error) {
    console.error("❌ Clerk webhook error:", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};