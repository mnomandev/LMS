import { Webhook } from "svix";
import User from "../models/User.js";

export const clerkWebhooks = async (req, res) => {
  console.log("🔍 Webhook triggered:", req.method, new Date().toISOString());
  console.log("🔍 Headers:", Object.keys(req.headers));
  console.log("🔍 Body type:", typeof req.body);
  console.log("🔍 Body length:", req.body?.length);
  
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    
    // Convert raw buffer to string for verification
    const payload = req.body.toString();
    console.log("🔍 Payload preview:", payload.substring(0, 100) + "...");
    
    // Verify webhook signature
    await whook.verify(payload, {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"]
    });

    // Parse JSON after verification
    const { data, type } = JSON.parse(payload);
    console.log("🔍 Event type:", type);
    console.log("🔍 User data:", {
      id: data?.id,
      email: data?.email_addresses?.[0]?.email_address,
      name: `${data?.first_name || ''} ${data?.last_name || ''}`.trim()
    });

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses?.[0]?.email_address || null,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          imageUrl: data.image_url
        };
        
        console.log("🔍 Attempting to create user:", userData);
        const newUser = await User.create(userData);
        console.log("✅ New user created successfully:", newUser._id);
        
        return res.status(200).json({ 
          success: true, 
          message: "User created",
          userId: newUser._id
        });
      }
      
      case "user.updated": {
        const userData = {
          email: data.email_addresses?.[0]?.email_address,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          imageUrl: data.image_url
        };
        
        console.log("🔍 Attempting to update user:", data.id, userData);
        const updatedUser = await User.findByIdAndUpdate(data.id, userData, { new: true });
        console.log("✅ User updated successfully:", updatedUser?._id);
        
        return res.status(200).json({ 
          success: true, 
          message: "User updated",
          userId: updatedUser?._id
        });
      }
      
      case "user.deleted": {
        console.log("🔍 Attempting to delete user:", data.id);
        const deletedUser = await User.findByIdAndDelete(data.id);
        console.log("✅ User deleted successfully:", deletedUser?._id);
        
        return res.status(200).json({ 
          success: true, 
          message: "User deleted",
          userId: deletedUser?._id
        });
      }
      
      default:
        console.log("⚠️ Unhandled webhook type:", type);
        return res.status(200).json({ 
          success: true, 
          message: "Event received but not processed",
          eventType: type
        });
    }
    
  } catch (error) {
    console.error("❌ Webhook error:", error.message);
    console.error("❌ Full error stack:", error.stack);
    
    // Return error response
    return res.status(400).json({ 
      success: false, 
      message: "Webhook processing failed",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};